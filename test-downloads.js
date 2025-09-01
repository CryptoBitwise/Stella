// test-downloads.js
// Test which HYG catalog download URLs actually work
// Run: node test-downloads.js

const https = require('https');
const fs = require('fs');

console.log('🔍 Testing HYG Catalog Download URLs\n');

const testUrls = [
    // Codeberg (most current - correct paths with MAIN branch)
    'https://codeberg.org/astronexus/hyg/raw/branch/main/data/hyg/CURRENT/hyg_v42.csv.gz',
    'https://codeberg.org/astronexus/hyg/raw/branch/main/data/hyg/CURRENT/hyg_v41.csv.gz',
    'https://codeberg.org/astronexus/hyg/raw/branch/main/data/hyg/CURRENT/hyg_v40.csv.gz',

    // Alternative Codeberg paths with MAIN branch
    'https://codeberg.org/astronexus/hyg/raw/branch/main/hyg/CURRENT/hyg_v42.csv.gz',
    'https://codeberg.org/astronexus/hyg/raw/branch/main/hyg_v42.csv.gz',
    'https://codeberg.org/astronexus/hyg/raw/branch/main/hygdata_v42.csv.gz',

    // More alternative Codeberg patterns with MAIN branch
    'https://codeberg.org/astronexus/hyg/raw/branch/main/catalog/hyg_v42.csv.gz',
    'https://codeberg.org/astronexus/hyg/raw/branch/main/files/hyg_v42.csv.gz',
    'https://codeberg.org/astronexus/hyg/raw/branch/main/downloads/hyg_v42.csv.gz',

    // Original sources
    'https://www.astronexus.com/files/downloads/hygdata_v42.csv.gz',
    'https://astronexus.com/downloads/hygdata_v42.csv.gz'
];

async function testUrl(url) {
    return new Promise((resolve) => {
        console.log(`🔗 Testing: ${url}`);

        const request = https.get(url, (response) => {
            console.log(`   Status: ${response.statusCode}`);
            console.log(`   Content-Type: ${response.headers['content-type'] || 'unknown'}`);
            console.log(`   Content-Length: ${response.headers['content-length'] || 'unknown'} bytes`);

            if (response.statusCode === 200) {
                console.log(`   ✅ SUCCESS - This URL works!`);
                resolve({ url, status: 'success', response });
            } else {
                console.log(`   ❌ Failed with status ${response.statusCode}`);
                resolve({ url, status: 'failed', response });
            }
        });

        request.on('error', (err) => {
            console.log(`   ❌ Error: ${err.message}`);
            resolve({ url, status: 'error', error: err.message });
        });

        request.setTimeout(10000, () => {
            console.log(`   ⏰ Timeout after 10 seconds`);
            request.destroy();
            resolve({ url, status: 'timeout' });
        });
    });
}

async function testAllUrls() {
    console.log('Starting URL tests...\n');

    const results = [];

    for (const url of testUrls) {
        const result = await testUrl(url);
        results.push(result);
        console.log(''); // Empty line for readability
    }

    console.log('📊 Test Results Summary:');
    console.log('========================');

    const working = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status !== 'success');

    if (working.length > 0) {
        console.log(`✅ Working URLs (${working.length}):`);
        working.forEach(r => console.log(`   - ${r.url}`));
    } else {
        console.log('❌ No working URLs found');
    }

    if (failed.length > 0) {
        console.log(`❌ Failed URLs (${failed.length}):`);
        failed.forEach(r => console.log(`   - ${r.url} (${r.status})`));
    }

    console.log('\n💡 Recommendation:');
    if (working.length > 0) {
        console.log(`Use the first working URL: ${working[0].url}`);
    } else {
        console.log('All URLs failed. You may need to:');
        console.log('1. Check your internet connection');
        console.log('2. Try a different network');
        console.log('3. Check if the URLs have changed');
    }
}

// Run the tests
testAllUrls();
