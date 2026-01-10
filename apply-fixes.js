#!/usr/bin/env node

/**
 * Direct Database Fix - Creates database if needed and applies all fixes
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== Applying Invoice Fixes ===\n');

// Determine database location based on OS
let dbPath;
const platform = process.platform;

if (platform === 'darwin') {
  // macOS
  dbPath = path.join(os.homedir(), 'Library', 'Application Support', 'invoicepro-desktop', 'invoicepro.db');
} else if (platform === 'win32') {
  // Windows
  dbPath = path.join(process.env.APPDATA, 'invoicepro-desktop', 'invoicepro.db');
} else {
  // Linux
  dbPath = path.join(os.homedir(), '.config', 'invoicepro-desktop', 'invoicepro.db');
}

// Allow override from command line
if (process.argv[2]) {
  dbPath = process.argv[2];
}

console.log(`Database path: ${dbPath}`);

// Create directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  console.log(`Creating directory: ${dbDir}`);
  fs.mkdirSync(dbDir, { recursive: true });
}

// Check if database exists
const dbExists = fs.existsSync(dbPath);
console.log(`Database exists: ${dbExists ? 'Yes' : 'No - will be created'}\n`);

try {
  // Create backup if database exists
  if (dbExists) {
    const backupPath = `${dbPath}.backup-${Date.now()}`;
    fs.copyFileSync(dbPath, backupPath);
    console.log(`✓ Backup created: ${backupPath}\n`);
  }

  // Open/create database
  const db = new Database(dbPath);
  console.log('✓ Database opened\n');

  // Create settings table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      invoice_prefix TEXT DEFAULT 'INV-',
      quote_prefix TEXT DEFAULT 'QUO-',
      tab_configuration TEXT
    )
  `);

  // Check if settings row exists
  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();

  if (!settings) {
    console.log('Creating initial settings...');
    db.prepare(`
      INSERT INTO settings (id, invoice_prefix, quote_prefix)
      VALUES (1, 'INV-', 'QUO-')
    `).run();
    console.log('✓ Initial settings created\n');
  }

  // Fix 1: Update invoice_prefix
  console.log('1. Updating invoice prefix...');
  const currentPrefix = db.prepare('SELECT invoice_prefix FROM settings WHERE id = 1').get();

  if (currentPrefix && currentPrefix.invoice_prefix !== 'INV-') {
    db.prepare('UPDATE settings SET invoice_prefix = ? WHERE id = 1').run('INV-');
    console.log(`   Changed from "${currentPrefix.invoice_prefix}" to "INV-"`);
  } else {
    console.log('   Already set to "INV-"');
  }

  // Fix 2: Remove estimates from navigation
  console.log('\n2. Removing Estimates from navigation...');
  const navConfig = db.prepare('SELECT tab_configuration FROM settings WHERE id = 1').get();

  if (navConfig && navConfig.tab_configuration) {
    try {
      const tabs = JSON.parse(navConfig.tab_configuration);
      const hasEstimates = tabs.some(tab => tab.id === 'estimates');

      if (hasEstimates) {
        const updatedTabs = tabs
          .filter(tab => tab.id !== 'estimates')
          .map((tab, index) => ({ ...tab, order: index }));

        db.prepare('UPDATE settings SET tab_configuration = ? WHERE id = 1')
          .run(JSON.stringify(updatedTabs));

        console.log('   Removed "Estimates" tab');
      } else {
        console.log('   No "Estimates" tab found');
      }
    } catch (e) {
      console.log('   Could not parse navigation config');
    }
  } else {
    console.log('   No custom navigation (will use defaults without Estimates)');
  }

  // Show final settings
  console.log('\n3. Final Configuration:');
  const final = db.prepare('SELECT invoice_prefix, tab_configuration FROM settings WHERE id = 1').get();
  console.log(`   Invoice Prefix: "${final.invoice_prefix}"`);

  if (final.tab_configuration) {
    try {
      const tabs = JSON.parse(final.tab_configuration);
      console.log(`   Navigation Tabs: ${tabs.filter(t => t.enabled !== false).map(t => t.name).join(', ')}`);
    } catch (e) {
      console.log('   Navigation: Using defaults');
    }
  } else {
    console.log('   Navigation: Using defaults (no Estimates)');
  }

  db.close();

  console.log('\n✅ ALL FIXES APPLIED SUCCESSFULLY!\n');
  console.log('Next steps:');
  console.log('1. Restart your app (if running)');
  console.log('2. Create a new invoice - it should show as INV-101001');
  console.log('3. Check Settings → Navigation - Estimates should be gone\n');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
