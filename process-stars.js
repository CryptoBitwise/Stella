// process-stars.js
// Downloads and processes HYG v4.2 star catalog for Stella
// Run: npm install node-fetch csv-parser zlib
//      node process-stars.js

const fs = require('fs');
const zlib = require('zlib');
const csv = require('csv-parser');
const https = require('https');

console.log('🌟 Stella Star Catalog Processor\n');

// Download the catalog
function downloadCatalog() {
    return new Promise(async (resolve, reject) => {
        const urls = [
            // Codeberg (most current - correct paths with MAIN branch)
            'https://codeberg.org/astronexus/hyg/raw/branch/main/data/hyg/CURRENT/hyg_v42.csv.gz',
            'https://codeberg.org/astronexus/hyg/raw/branch/main/data/hyg/CURRENT/hyg_v41.csv.gz',
            'https://codeberg.org/astronexus/hyg/raw/branch/main/data/hyg/CURRENT/hyg_v40.csv.gz',

            // Alternative Codeberg paths with MAIN branch
            'https://codeberg.org/astronexus/hyg/raw/branch/main/hyg/CURRENT/hyg_v42.csv.gz',
            'https://codeberg.org/astronexus/hyg/raw/branch/main/hyg_v42.csv.gz',
            'https://codeberg.org/astronexus/hyg/raw/branch/main/hygdata_v42.csv.gz',

            // Original sources
            'https://www.astronexus.com/files/downloads/hygdata_v42.csv.gz',
            'https://astronexus.com/downloads/hygdata_v42.csv.gz'
        ];

        console.log('📥 Trying to download HYG star catalog...\n');

        for (const url of urls) {
            try {
                console.log(`   Trying: ${url.substring(0, 50)}...`);

                const isCSV = url.endsWith('.csv');
                const filename = isCSV ? 'hyg_v42.csv' : 'hyg_v42.csv.gz';
                const file = fs.createWriteStream(filename);

                await new Promise((resolveDownload, rejectDownload) => {
                    https.get(url, (response) => {
                        if (response.statusCode !== 200) {
                            rejectDownload(new Error(`Status ${response.statusCode}`));
                            return;
                        }

                        const totalSize = parseInt(response.headers['content-length'], 10);
                        let downloaded = 0;

                        response.on('data', (chunk) => {
                            downloaded += chunk.length;
                            if (totalSize) {
                                const percent = ((downloaded / totalSize) * 100).toFixed(1);
                                process.stdout.write(`\r   Progress: ${percent}% (${(downloaded / 1024 / 1024).toFixed(1)} MB)`);
                            }
                        });

                        response.pipe(file);

                        file.on('finish', () => {
                            file.close();
                            console.log('\n✅ Download complete!');
                            resolveDownload();
                        });
                    }).on('error', rejectDownload);
                });

                // If we got here, download succeeded
                resolve();
                return;

            } catch (err) {
                console.log(`   ❌ Failed: ${err.message}`);
                continue;
            }
        }

        reject(new Error('Could not download from any source'));
    });
}

// Unzip the catalog
function unzipCatalog() {
    return new Promise((resolve, reject) => {
        // Check if it's already a CSV
        if (fs.existsSync('hyg_v42.csv')) {
            console.log('✅ CSV already exists, skipping extraction');
            resolve();
            return;
        }

        // Check if we have a .gz file
        if (!fs.existsSync('hyg_v42.csv.gz')) {
            console.log('✅ No .gz file found, assuming direct CSV download');
            resolve();
            return;
        }

        console.log('📦 Extracting catalog...');

        const gunzip = zlib.createGunzip();
        const input = fs.createReadStream('hyg_v42.csv.gz');
        const output = fs.createWriteStream('hyg_v42.csv');

        input.pipe(gunzip).pipe(output);

        output.on('finish', () => {
            console.log('✅ Extraction complete!');
            resolve();
        });

        gunzip.on('error', reject);
    });
}

// Process the catalog
async function processCatalog() {
    console.log('✨ Processing stars...\n');

    const stars = [];
    const magnitudeLimit = 6.5; // Naked eye visibility
    let totalCount = 0;

    return new Promise((resolve, reject) => {
        fs.createReadStream('hyg_v42.csv')
            .pipe(csv())
            .on('data', (row) => {
                totalCount++;

                // Convert RA from hours to degrees if needed
                let ra = parseFloat(row.ra);
                if (ra < 24) ra = ra * 15;

                const star = {
                    id: parseInt(row.id) || totalCount,
                    ra: ra,
                    dec: parseFloat(row.dec),
                    mag: parseFloat(row.mag)
                };

                // Only include visible stars with valid coordinates
                if (star.mag < magnitudeLimit && !isNaN(star.ra) && !isNaN(star.dec)) {
                    // Add optional fields if they exist
                    if (row.proper) star.name = row.proper;
                    if (row.dist && parseFloat(row.dist) > 0) {
                        star.dist = parseFloat(row.dist);
                        star.dist_ly = (star.dist * 3.26).toFixed(1);
                    }
                    if (row.con) star.constellation = row.con;
                    if (row.spect) star.spectral = row.spect;

                    stars.push(star);
                }

                // Show progress
                if (totalCount % 10000 === 0) {
                    process.stdout.write(`\r   Processed: ${totalCount} stars, Found ${stars.length} visible stars`);
                }
            })
            .on('end', () => {
                console.log(`\n\n📊 Final Statistics:`);
                console.log(`   - Total stars processed: ${totalCount}`);
                console.log(`   - Visible stars (mag < ${magnitudeLimit}): ${stars.length}`);
                console.log(`   - Named stars: ${stars.filter(s => s.name).length}`);
                console.log(`   - Stars with distance data: ${stars.filter(s => s.dist).length}`);

                // Sort by brightness
                stars.sort((a, b) => a.mag - b.mag);

                // Save to JSON
                fs.writeFileSync('stella_stars.json', JSON.stringify(stars, null, 2));
                console.log('\n✅ Created stella_stars.json');

                // Show brightest stars
                console.log('\n🌟 Top 10 Brightest Stars:');
                stars.slice(0, 10).forEach((star, i) => {
                    console.log(`   ${i + 1}. ${star.name || 'Unnamed'} (mag: ${star.mag.toFixed(2)})`);
                });

                resolve(stars);
            })
            .on('error', reject);
    });
}

// Run everything
async function main() {
    try {
        // Check if catalog already exists
        if (!fs.existsSync('hyg_v42.csv')) {
            if (!fs.existsSync('hyg_v42.csv.gz')) {
                await downloadCatalog();
            }
            await unzipCatalog();
        } else {
            console.log('✅ Found existing hyg_v42.csv');
        }

        await processCatalog();

        console.log('\n🎉 Success! Your star catalog is ready.');
        console.log('📱 Add stella_stars.json to your Stella app!\n');

        // Clean up
        console.log('Cleaning up temporary files...');
        if (fs.existsSync('hyg_v42.csv.gz')) {
            fs.unlinkSync('hyg_v42.csv.gz');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

// Install required packages if missing
const checkDependencies = () => {
    try {
        require('csv-parser');
    } catch {
        console.log('📦 Installing required packages...');
        require('child_process').execSync('npm install csv-parser', { stdio: 'inherit' });
    }
};

checkDependencies();
main();
