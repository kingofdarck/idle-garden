#!/usr/bin/env node

/**
 * Pre-deployment checker for Idle Garden
 * Verifies all required files are present and properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🌱 Idle Garden - Deployment Checker\n');

const checks = [];
let allPassed = true;

// Check if required files exist
const requiredFiles = [
    'idle-garden/index.html',
    'idle-garden/styles.css',
    'idle-garden/js/main.js',
    'idle-garden/js/GameEngine.js',
    'idle-garden/js/PlantConfig.js',
    'idle-garden/js/Plant.js',
    'idle-garden/js/ResourceManager.js',
    'idle-garden/js/Shop.js',
    'idle-garden/js/GardenGrid.js',
    'idle-garden/js/UpgradeSystem.js',
    'idle-garden/js/SaveSystem.js',
    'idle-garden/js/PlayerProfile.js',
    'README.md',
    '.gitignore'
];

console.log('📁 Checking required files...\n');

requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${file}`);
    
    if (!exists) {
        allPassed = false;
    }
});

console.log('\n📊 Checking file sizes...\n');

// Check file sizes
const filesToCheck = [
    'idle-garden/index.html',
    'idle-garden/styles.css',
    'idle-garden/js/PlantConfig.js'
];

filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`📄 ${file}: ${sizeKB} KB`);
    }
});

console.log('\n🔍 Checking for common issues...\n');

// Check for console.log statements (optional warning)
const jsFiles = [
    'idle-garden/js/main.js',
    'idle-garden/js/GameEngine.js'
];

let consoleLogCount = 0;
jsFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const matches = content.match(/console\.log/g);
        if (matches) {
            consoleLogCount += matches.length;
        }
    }
});

if (consoleLogCount > 0) {
    console.log(`⚠️  Found ${consoleLogCount} console.log statements (optional: remove for production)`);
} else {
    console.log('✅ No console.log statements found');
}

// Check README for placeholder text
if (fs.existsSync('README.md')) {
    const readme = fs.readFileSync('README.md', 'utf8');
    if (readme.includes('yourusername')) {
        console.log('⚠️  README.md contains placeholder "yourusername" - update with your GitHub username');
        allPassed = false;
    } else {
        console.log('✅ README.md looks good');
    }
}

console.log('\n' + '='.repeat(50));

if (allPassed) {
    console.log('\n🎉 All checks passed! Ready to deploy!\n');
    console.log('Next steps:');
    console.log('1. git init');
    console.log('2. git add .');
    console.log('3. git commit -m "Initial commit"');
    console.log('4. git remote add origin YOUR_REPO_URL');
    console.log('5. git push -u origin main');
    console.log('6. Enable GitHub Pages in repository settings\n');
} else {
    console.log('\n❌ Some checks failed. Please fix the issues above.\n');
    process.exit(1);
}
