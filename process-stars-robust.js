// process-stars-robust.js
// More robust star catalog processor with multiple download sources
// Run: node process-stars-robust.js

const fs = require('fs');
const zlib = require('zlib');
const csv = require('csv-parser');
const https = require('https');

console.log('🌟 Stella Star Catalog Processor (Robust Version)\n');

// Multiple download sources (updated with current locations)
const downloadSources = [
    'https://raw.githubusercontent.com/astronexus/hyg-database/master/data/hyg_v42.csv.gz',
    'https://github.com/astronexus/hyg-database/raw/master/data/hyg_v42.csv.gz',
    'https://heasarc.gsfc.nasa.gov/W3Browse/star-catalog/hyg.html',
    'https://cdsarc.cds.unistra.fr/viz-bin/Cat?cat=I/311&target=brief'
];

// Download the catalog with retry logic
function downloadCatalog(sourceIndex = 0) {
    return new Promise((resolve, reject) => {
        if (sourceIndex >= downloadSources.length) {
            reject(new Error('All download sources failed'));
            return;
        }

        const url = downloadSources[sourceIndex];
        const file = fs.createWriteStream('hyg_v42.csv.gz');
        
        console.log(`📥 Downloading from source ${sourceIndex + 1}: ${url}`);
        
        const request = https.get(url, (response) => {
            if (response.statusCode !== 200) {
                console.log(`❌ Source ${sourceIndex + 1} failed (${response.statusCode})`);
                file.close();
                fs.unlink('hyg_v42.csv.gz', () => {});
                // Try next source
                downloadCatalog(sourceIndex + 1).then(resolve).catch(reject);
                return;
            }

            const totalSize = parseInt(response.headers['content-length'], 10);
            let downloaded = 0;
            
            response.on('data', (chunk) => {
                downloaded += chunk.length;
                if (totalSize) {
                    const percent = ((downloaded / totalSize) * 100).toFixed(1);
                    process.stdout.write(`\r   Progress: ${percent}% (${(downloaded/1024/1024).toFixed(1)} MB)`);
                }
            });
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log('\n✅ Download complete!');
                
                // Verify file size
                const stats = fs.statSync('hyg_v42.csv.gz');
                if (stats.size < 1000000) { // Less than 1MB = probably corrupted
                    console.log('❌ File seems too small, trying next source...');
                    fs.unlink('hyg_v42.csv.gz', () => {});
                    downloadCatalog(sourceIndex + 1).then(resolve).catch(reject);
                    return;
                }
                
                resolve();
            });
        });
        
        request.on('error', (err) => {
            console.log(`❌ Source ${sourceIndex + 1} failed: ${err.message}`);
            file.close();
            fs.unlink('hyg_v42.csv.gz', () => {});
            // Try next source
            downloadCatalog(sourceIndex + 1).then(resolve).catch(reject);
        });
        
        request.setTimeout(30000, () => { // 30 second timeout
            console.log(`❌ Source ${sourceIndex + 1} timed out`);
            request.destroy();
            file.close();
            fs.unlink('hyg_v42.csv.gz', () => {});
            downloadCatalog(sourceIndex + 1).then(resolve).catch(reject);
        });
    });
}

// Unzip the catalog with better error handling
function unzipCatalog() {
    return new Promise((resolve, reject) => {
        console.log('📦 Extracting catalog...');
        
        const gunzip = zlib.createGunzip();
        const input = fs.createReadStream('hyg_v42.csv.gz');
        const output = fs.createWriteStream('hyg_v42.csv');
        
        let hasError = false;
        
        gunzip.on('error', (err) => {
            if (!hasError) {
                hasError = true;
                console.log('❌ Extraction failed, file may be corrupted');
                reject(err);
            }
        });
        
        output.on('error', (err) => {
            if (!hasError) {
                hasError = true;
                reject(err);
            }
        });
        
        input.pipe(gunzip).pipe(output);
        
        output.on('finish', () => {
            if (!hasError) {
                console.log('✅ Extraction complete!');
                resolve();
            }
        });
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
                    console.log(`   ${i+1}. ${star.name || 'Unnamed'} (mag: ${star.mag.toFixed(2)})`);
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
        console.log('\n💡 Troubleshooting tips:');
        console.log('   1. Check your internet connection');
        console.log('   2. Try running the script again');
        console.log('   3. Try manual download from browser');
        console.log('   4. Check if antivirus is blocking the download');
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
