#!/usr/bin/env node

/**
 * Manual Database Fix Script
 * This script manually updates the database settings to apply the invoice prefix and navigation changes
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

console.log('=== Manual Database Fix Script ===\n');

// Possible database locations
const possiblePaths = [
  './invoicepro.db',
  './invoicing.db',
  './database/invoicepro.db',
  path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'invoicepro-desktop', 'invoicepro.db'),
  path.join(process.env.HOME || process.env.USERPROFILE, 'Library', 'Application Support', 'invoicepro-desktop', 'invoicepro.db'),
  path.join(process.env.APPDATA || '', 'invoicepro-desktop', 'invoicepro.db'),
  path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'Electron', 'invoicepro.db'),
  path.join(process.env.HOME || process.env.USERPROFILE, 'Library', 'Application Support', 'Electron', 'invoicepro.db'),
];

// Find the database
let dbPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    dbPath = p;
    break;
  }
}

if (!dbPath) {
  console.log('❌ Could not find database file.');
  console.log('\nSearched in:');
  possiblePaths.forEach(p => console.log(`  - ${p}`));
  console.log('\nPlease specify the database path:');
  console.log('  node manual-db-fix.js /path/to/your/database.db');
  process.exit(1);
}

// Allow manual path override
if (process.argv[2]) {
  dbPath = process.argv[2];
  if (!fs.existsSync(dbPath)) {
    console.log(`❌ Database file not found at: ${dbPath}`);
    process.exit(1);
  }
}

console.log(`✓ Found database at: ${dbPath}\n`);

try {
  const db = new Database(dbPath);

  // Create backup
  const backupPath = `${dbPath}.backup-${Date.now()}`;
  fs.copyFileSync(dbPath, backupPath);
  console.log(`✓ Created backup at: ${backupPath}\n`);

  // Fix 1: Update invoice_prefix
  console.log('1. Checking invoice prefix...');
  const settings = db.prepare('SELECT invoice_prefix FROM settings WHERE id = 1').get();

  if (settings) {
    console.log(`   Current prefix: "${settings.invoice_prefix}"`);

    if (settings.invoice_prefix === 'invoice' || !settings.invoice_prefix) {
      db.prepare('UPDATE settings SET invoice_prefix = ? WHERE id = 1').run('INV-');
      console.log('   ✓ Updated invoice_prefix to "INV-"');
    } else if (settings.invoice_prefix === 'INV-') {
      console.log('   ✓ Invoice prefix already set to "INV-"');
    } else {
      console.log(`   ⚠ Invoice prefix is "${settings.invoice_prefix}" - not changing`);
    }
  } else {
    console.log('   ⚠ No settings found - creating default settings');
    db.prepare('INSERT INTO settings (id, invoice_prefix) VALUES (1, ?)').run('INV-');
    console.log('   ✓ Created settings with "INV-" prefix');
  }

  // Fix 2: Remove estimates from navigation
  console.log('\n2. Checking navigation configuration...');
  const navSettings = db.prepare('SELECT tab_configuration FROM settings WHERE id = 1').get();

  if (navSettings && navSettings.tab_configuration) {
    try {
      const tabs = JSON.parse(navSettings.tab_configuration);
      const hasEstimates = tabs.some(tab => tab.id === 'estimates');

      if (hasEstimates) {
        console.log('   Found estimates tab in navigation');
        const updatedTabs = tabs
          .filter(tab => tab.id !== 'estimates')
          .map((tab, index) => ({ ...tab, order: index }));

        db.prepare('UPDATE settings SET tab_configuration = ? WHERE id = 1')
          .run(JSON.stringify(updatedTabs));

        console.log('   ✓ Removed estimates tab from navigation');
      } else {
        console.log('   ✓ No estimates tab found in navigation');
      }
    } catch (e) {
      console.log('   ⚠ Could not parse navigation config:', e.message);
    }
  } else {
    console.log('   ✓ No custom navigation configuration (will use defaults)');
  }

  // Show final settings
  console.log('\n3. Final settings:');
  const finalSettings = db.prepare('SELECT invoice_prefix, tab_configuration FROM settings WHERE id = 1').get();
  console.log(`   Invoice Prefix: "${finalSettings.invoice_prefix}"`);

  if (finalSettings.tab_configuration) {
    try {
      const tabs = JSON.parse(finalSettings.tab_configuration);
      console.log(`   Navigation Tabs: ${tabs.map(t => t.name).join(', ')}`);
    } catch (e) {
      console.log('   Navigation Tabs: (using defaults)');
    }
  } else {
    console.log('   Navigation Tabs: (using defaults)');
  }

  db.close();

  console.log('\n✅ Database updated successfully!');
  console.log('\nNow restart your application to see the changes.');

} catch (error) {
  console.error('\n❌ Error updating database:', error.message);
  console.error(error.stack);
  process.exit(1);
}
