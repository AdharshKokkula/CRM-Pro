#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Vercel environment variables...');

const envFile = path.join(__dirname, '..', '.env.production');

if (!fs.existsSync(envFile)) {
  console.error('❌ .env.production file not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envFile, 'utf8');
const envVars = {};

// Parse environment variables
envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/"/g, '');
      envVars[key.trim()] = value.trim();
    }
  }
});

console.log('\n📋 Vercel Environment Variables to Set:');
console.log('Copy these to your Vercel Dashboard → Settings → Environment Variables\n');

Object.entries(envVars).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

console.log('\n🌐 Vercel Dashboard URL:');
console.log('https://vercel.com/dashboard → Your Project → Settings → Environment Variables');

console.log('\n✅ After setting these variables, redeploy your project for changes to take effect.');