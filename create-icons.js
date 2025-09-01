const fs = require('fs');
const { createCanvas } = require('canvas');

// Create a simple canvas-based icon generator
function createStellaIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Create dark blue gradient background
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, '#000428');
    gradient.addColorStop(1, '#004e92');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Add constellation pattern (Orion-like)
    const starSize = size * 0.08;
    const stars = [
        {x: 0.5, y: 0.2},   // Top center
        {x: 0.3, y: 0.4},   // Left middle
        {x: 0.7, y: 0.4},   // Right middle
        {x: 0.5, y: 0.6},   // Center
        {x: 0.2, y: 0.8},   // Bottom left
        {x: 0.8, y: 0.8}    // Bottom right
    ];
    
    // Draw stars
    stars.forEach(star => {
        const x = star.x * size;
        const y = star.y * size;
        
        // Star glow
        ctx.shadowColor = '#4fb3ff';
        ctx.shadowBlur = starSize * 2;
        ctx.beginPath();
        ctx.arc(x, y, starSize, 0, Math.PI * 2);
        ctx.fillStyle = '#4fb3ff';
        ctx.fill();
        
        // Remove shadow for next operations
        ctx.shadowBlur = 0;
    });
    
    // Add constellation lines
    ctx.strokeStyle = '#4fb3ff';
    ctx.lineWidth = size * 0.01;
    ctx.lineCap = 'round';
    
    // Draw lines connecting stars
    const lines = [
        [0, 1], [1, 3], [3, 2], [2, 0], // Top diamond
        [3, 4], [3, 5] // Bottom connections
    ];
    
    lines.forEach(line => {
        const start = stars[line[0]];
        const end = stars[line[1]];
        ctx.beginPath();
        ctx.moveTo(start.x * size, start.y * size);
        ctx.lineTo(end.x * size, end.y * size);
        ctx.stroke();
    });
    
    // Add main center star (larger)
    const centerX = size * 0.5;
    const centerY = size * 0.6;
    const mainStarSize = starSize * 1.5;
    
    ctx.shadowColor = '#4fb3ff';
    ctx.shadowBlur = mainStarSize * 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, mainStarSize, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    return canvas;
}

// Generate icons
async function generateIcons() {
    try {
        console.log('🌟 Generating Stella app icons...');
        
        const sizes = [192, 512];
        
        for (const size of sizes) {
            const canvas = createStellaIcon(size);
            const buffer = canvas.toBuffer('image/png');
            const filename = `icon-${size}.png`;
            
            fs.writeFileSync(filename, buffer);
            console.log(`✅ Created ${filename} (${size}x${size})`);
        }
        
        console.log('🎉 All icons generated successfully!');
        console.log('📱 Your Stella app should now have proper icons');
        
    } catch (error) {
        console.error('❌ Error generating icons:', error.message);
        console.log('💡 Try installing canvas: npm install canvas');
    }
}

// Run if called directly
if (require.main === module) {
    generateIcons();
}

module.exports = { createStellaIcon, generateIcons };
