/**
 * Fix Puppeteer Chrome Installation
 * Run this script if you get Chrome/Chromium not found errors
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

console.log('🔍 Checking Puppeteer configuration...');

// Check if bundled Chromium exists
try {
  const browser = await puppeteer.launch({ headless: true });
  const version = await browser.version();
  console.log('✅ Puppeteer works! Chrome version:', version);
  await browser.close();
  process.exit(0);
} catch (error) {
  console.log('❌ Puppeteer launch failed:', error.message);
}

// Try to find system Chrome installations
const possibleChromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Chromium\\Application\\chromium.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

console.log('\n🔍 Searching for system Chrome installations...');
let systemChromeFound = false;

for (const chromePath of possibleChromePaths) {
  try {
    if (fs.existsSync(chromePath)) {
      console.log('✅ Found Chrome at:', chromePath);
      systemChromeFound = true;
      
      // Test this Chrome path
      try {
        const browser = await puppeteer.launch({ 
          executablePath: chromePath,
          headless: true 
        });
        const version = await browser.version();
        console.log('✅ This Chrome works! Version:', version);
        await browser.close();
        
        console.log('\n💡 Solution: Set this environment variable:');
        console.log(`   $env:CHROME_PATH = "${chromePath}"`);
        console.log('   Then restart your server.');
        process.exit(0);
      } catch (err) {
        console.log('❌ This Chrome path failed:', err.message);
      }
    }
  } catch (err) {
    // Skip this path
  }
}

if (!systemChromeFound) {
  console.log('\n❌ No system Chrome found.');
}

console.log('\n📋 Recommendations:');
console.log('1. Install Google Chrome from: https://www.google.com/chrome/');
console.log('2. Or reinstall Puppeteer with Chromium:');
console.log('   npm uninstall puppeteer');
console.log('   npm install puppeteer');
console.log('3. Or use system Chrome by setting CHROME_PATH environment variable');

process.exit(1);