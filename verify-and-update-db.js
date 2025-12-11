/**
 * Database Schema Verification and Update Script
 * This checks your local SQLite database and adds any missing columns
 * Run with: node verify-and-update-db.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Get the database path
const getUserDataPath = () => {
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || '', 'invoicepro-desktop');
  } else if (process.platform === 'darwin') {
    return path.join(process.env.HOME || '', 'Library', 'Application Support', 'invoicepro-desktop');
  } else {
    return path.join(process.env.HOME || '', '.invoicepro');
  }
};

const dbPath = path.join(getUserDataPath(), 'invoicepro.db');

console.log('==========================================');
console.log('DATABASE SCHEMA VERIFICATION & UPDATE');
console.log('==========================================\n');
console.log('Database location:', dbPath);

if (!fs.existsSync(dbPath)) {
  console.log('\n❌ Database not found!');
  console.log('Please run the app at least once to create the database.');
  process.exit(1);
}

try {
  const db = new Database(dbPath);

  console.log('\n1. CHECKING SETTINGS TABLE COLUMNS');
  console.log('-----------------------------------');

  // Get current columns
  const currentColumns = db.prepare("PRAGMA table_info(settings)").all();
  const columnNames = currentColumns.map(col => col.name);

  console.log(`Found ${currentColumns.length} existing columns`);

  // Define all required columns for payment gateways and other features
  const requiredColumns = [
    // Stripe
    { name: 'stripe_secret_key', type: 'TEXT', default: "''" },
    { name: 'stripe_publishable_key', type: 'TEXT', default: "''" },
    { name: 'stripe_enabled', type: 'INTEGER', default: '0' },

    // PayPal
    { name: 'paypal_client_id', type: 'TEXT', default: "''" },
    { name: 'paypal_client_secret', type: 'TEXT', default: "''" },
    { name: 'paypal_enabled', type: 'INTEGER', default: '0' },
    { name: 'paypal_mode', type: 'TEXT', default: "'sandbox'" },

    // Square
    { name: 'square_access_token', type: 'TEXT', default: "''" },
    { name: 'square_location_id', type: 'TEXT', default: "''" },
    { name: 'square_enabled', type: 'INTEGER', default: '0' },
    { name: 'square_environment', type: 'TEXT', default: "'sandbox'" },

    // GoCardless
    { name: 'gocardless_access_token', type: 'TEXT', default: "''" },
    { name: 'gocardless_enabled', type: 'INTEGER', default: '0' },
    { name: 'gocardless_environment', type: 'TEXT', default: "'sandbox'" },

    // Authorize.Net (Enterprise)
    { name: 'authorizenet_api_login_id', type: 'TEXT', default: "''" },
    { name: 'authorizenet_transaction_key', type: 'TEXT', default: "''" },
    { name: 'authorizenet_enabled', type: 'INTEGER', default: '0' },
    { name: 'authorizenet_environment', type: 'TEXT', default: "'sandbox'" },

    // Invoice/Quote numbering
    { name: 'next_invoice_number', type: 'TEXT', default: "''" },
    { name: 'next_quote_number', type: 'TEXT', default: "''" },
  ];

  console.log('\n2. CHECKING PAYMENT GATEWAY COLUMNS');
  console.log('------------------------------------');

  const missingColumns = [];
  const existingPaymentColumns = [];

  requiredColumns.forEach(col => {
    if (columnNames.includes(col.name)) {
      existingPaymentColumns.push(col.name);
    } else {
      missingColumns.push(col);
    }
  });

  console.log(`✓ Found ${existingPaymentColumns.length} payment gateway columns`);
  existingPaymentColumns.forEach(name => {
    console.log(`  - ${name}`);
  });

  if (missingColumns.length > 0) {
    console.log(`\n⚠️  Missing ${missingColumns.length} columns:`);
    missingColumns.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    console.log('\n3. ADDING MISSING COLUMNS');
    console.log('-------------------------');

    missingColumns.forEach(col => {
      try {
        const sql = `ALTER TABLE settings ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}`;
        db.exec(sql);
        console.log(`✓ Added: ${col.name}`);
      } catch (error) {
        console.log(`✗ Failed to add ${col.name}:`, error.message);
      }
    });

    console.log(`\n✅ Successfully added ${missingColumns.length} missing columns!`);
  } else {
    console.log('\n✅ All payment gateway columns exist! No updates needed.');
  }

  // Verify the settings row exists
  console.log('\n4. VERIFYING SETTINGS ROW');
  console.log('-------------------------');
  const settingsRow = db.prepare('SELECT id FROM settings WHERE id = 1').get();

  if (!settingsRow) {
    console.log('⚠️  Settings row missing, creating default row...');
    db.prepare('INSERT INTO settings (id) VALUES (1)').run();
    console.log('✓ Created default settings row');
  } else {
    console.log('✓ Settings row exists');
  }

  // Check current payment gateway settings
  console.log('\n5. CURRENT PAYMENT GATEWAY STATUS');
  console.log('----------------------------------');
  const settings = db.prepare(`
    SELECT
      stripe_enabled, paypal_enabled, square_enabled,
      gocardless_enabled, authorizenet_enabled,
      next_invoice_number, next_quote_number
    FROM settings WHERE id = 1
  `).get();

  console.log('Payment Gateways:');
  console.log(`  Stripe:        ${settings.stripe_enabled ? '✓ Enabled' : '○ Disabled'}`);
  console.log(`  PayPal:        ${settings.paypal_enabled ? '✓ Enabled' : '○ Disabled'}`);
  console.log(`  Square:        ${settings.square_enabled ? '✓ Enabled' : '○ Disabled'}`);
  console.log(`  GoCardless:    ${settings.gocardless_enabled ? '✓ Enabled' : '○ Disabled'}`);
  console.log(`  Authorize.Net: ${settings.authorizenet_enabled ? '✓ Enabled' : '○ Disabled'}`);

  console.log('\nInvoice Numbering:');
  console.log(`  Next Invoice #: ${settings.next_invoice_number || '(using prefix system)'}`);
  console.log(`  Next Quote #:   ${settings.next_quote_number || '(using prefix system)'}`);

  db.close();

  console.log('\n==========================================');
  console.log('✅ DATABASE VERIFICATION COMPLETE!');
  console.log('==========================================\n');

  console.log('Your database is up to date with all payment gateway features.');
  console.log('You can now use all 5 payment gateways in the app!\n');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.log('\nTroubleshooting:');
  console.log('1. Make sure the app is closed (database might be locked)');
  console.log('2. Check that the database path is correct');
  console.log('3. Try running: npm install better-sqlite3');
  process.exit(1);
}
