#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying build output...');

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.error('❌ dist directory not found');
  process.exit(1);
}

// Check if index.html exists
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html not found in dist');
  process.exit(1);
}

// Check for CSS and JS files
const files = fs.readdirSync(path.join(distPath, 'assets'));
const cssFiles = files.filter(f => f.endsWith('.css'));
const jsFiles = files.filter(f => f.endsWith('.js'));

console.log(`✅ Found ${cssFiles.length} CSS file(s)`);
console.log(`✅ Found ${jsFiles.length} JS file(s)`);

// Check for chunked files
const hasVendorChunk = jsFiles.some(f => f.includes('vendor'));
const hasUiChunk = jsFiles.some(f => f.includes('ui'));

if (hasVendorChunk) console.log('✅ Vendor chunk found');
if (hasUiChunk) console.log('✅ UI chunk found');

console.log('🎉 Build verification complete!');
console.log('📦 Ready for Vercel deployment');