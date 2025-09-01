// integrate-stars.js
// Integrates processed star catalog into Stella app
// Run: node integrate-stars.js

const fs = require('fs');

console.log('🌟 Stella Star Integration Script\n');

function integrateStars() {
    try {
        // Check if star catalog exists
        if (!fs.existsSync('stella_stars.json')) {
            console.log('❌ stella_stars.json not found!');
            console.log('   Run "node process-stars.js" first to create the catalog.\n');
            return;
        }

        // Read the star catalog
        const starData = JSON.parse(fs.readFileSync('stella_stars.json', 'utf8'));
        console.log(`📖 Loaded ${starData.length} stars from catalog`);

        // Read the current HTML file
        if (!fs.existsSync('index.html')) {
            console.log('❌ index.html not found!');
            return;
        }

        let htmlContent = fs.readFileSync('index.html', 'utf8');
        console.log('📱 Loaded index.html');

        // Create enhanced star data with fun facts
        const enhancedStars = starData.slice(0, 100).map(star => {
            // Generate fun facts based on star properties
            let fact = '';
            if (star.dist_ly) {
                fact = `This star is ${star.dist_ly} light years away. `;
            }
            if (star.spectral) {
                fact += `It's a ${star.spectral} type star. `;
            }
            if (star.constellation) {
                fact += `Located in the constellation ${star.constellation}.`;
            }
            if (!fact) {
                fact = `A beautiful star visible to the naked eye!`;
            }

            return {
                name: star.name || `Star ${star.id}`,
                constellation: star.constellation || 'Unknown',
                ra: star.ra,
                dec: star.dec,
                magnitude: star.mag,
                distance: star.dist_ly ? `${star.dist_ly} light years` : 'Unknown',
                type: star.spectral ? `${star.spectral} Star` : 'Main Sequence',
                fact: fact,
                size: Math.max(0.5, 1 - (star.mag + 2) / 5) // Size based on magnitude
            };
        });

        // Create the new stars array
        const newStarsArray = JSON.stringify(enhancedStars, null, 8)
            .split('\n')
            .map(line => '            ' + line)
            .join('\n');

        // Replace the existing stars array
        const starsPattern = /const stars = \[[\s\S]*?\];/;
        const replacement = `const stars = [\n${newStarsArray}\n        ];`;

        if (starsPattern.test(htmlContent)) {
            htmlContent = htmlContent.replace(starsPattern, replacement);
            console.log('✅ Replaced stars array');
        } else {
            console.log('❌ Could not find stars array in HTML');
            return;
        }

        // Add more constellation lines for the new stars
        const newConstellationLines = [
            // Orion
            { from: "Betelgeuse", to: "Rigel" },
            { from: "Betelgeuse", to: "Bellatrix" },
            { from: "Rigel", to: "Saiph" },

            // Ursa Major (Big Dipper)
            { from: "Dubhe", to: "Merak" },
            { from: "Merak", to: "Phecda" },
            { from: "Phecda", to: "Megrez" },
            { from: "Megrez", to: "Alioth" },
            { from: "Alioth", to: "Mizar" },
            { from: "Mizar", to: "Alkaid" },

            // Cassiopeia
            { from: "Schedar", to: "Caph" },
            { from: "Caph", to: "Cih" },
            { from: "Cih", to: "Ruchbah" },
            { from: "Ruchbah", to: "Segin" },

            // Cygnus (Northern Cross)
            { from: "Deneb", to: "Sadr" },
            { from: "Sadr", to: "Gienah" },
            { from: "Gienah", to: "Albireo" },
            { from: "Albireo", to: "Deneb" }
        ];

        const constellationPattern = /const constellationLines = \[[\s\S]*?\];/;
        const constellationReplacement = `const constellationLines = [\n            ${JSON.stringify(newConstellationLines, null, 12)
            .split('\n')
            .map(line => '            ' + line)
            .join('\n')}\n        ];`;

        if (constellationPattern.test(htmlContent)) {
            htmlContent = htmlContent.replace(constellationPattern, constellationReplacement);
            console.log('✅ Enhanced constellation lines');
        }

        // Save the updated HTML
        fs.writeFileSync('index.html', htmlContent);
        console.log('💾 Saved updated index.html');

        // Show statistics
        console.log('\n📊 Integration Complete!');
        console.log(`   - Added ${enhancedStars.length} stars to your app`);
        console.log(`   - Enhanced constellation patterns`);
        console.log(`   - Stars now include real astronomical data`);
        console.log('\n🚀 Your Stella app now has a professional star catalog!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the integration
integrateStars();
