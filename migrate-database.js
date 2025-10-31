#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

// Get the user data path
const getUserDataPath = () => {
  const platform = os.platform();
  const homeDir = os.homedir();

  if (platform === 'darwin') {
    return path.join(homeDir, 'Library', 'Application Support', 'invoicepro-desktop');
  } else if (platform === 'win32') {
    return path.join(homeDir, 'AppData', 'Roaming', 'invoicepro-desktop');
  } else {
    return path.join(homeDir, '.config', 'invoicepro-desktop');
  }
};

const dbPath = path.join(getUserDataPath(), 'invoicepro.db');

console.log('Database Migration Script');
console.log('=========================');
console.log('Database path:', dbPath);
console.log('');

try {
  const db = new Database(dbPath);

  console.log('Checking clients table...');
  const clientColumns = db.pragma('table_info(clients)');
  const hasCustomerNumber = clientColumns.some(col => col.name === 'customer_number');

  if (!hasCustomerNumber) {
    console.log('Adding customer_number column to clients table...');
    db.exec('ALTER TABLE clients ADD COLUMN customer_number TEXT');
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_customer_number ON clients(customer_number) WHERE customer_number IS NOT NULL');
    console.log('✓ customer_number column added successfully');
  } else {
    console.log('✓ customer_number column already exists');
  }

  console.log('');
  console.log('Checking saved_items table...');
  const savedItemColumns = db.pragma('table_info(saved_items)');
  const hasItemNumber = savedItemColumns.some(col => col.name === 'item_number');

  if (!hasItemNumber) {
    console.log('Adding item_number column to saved_items table...');
    db.exec('ALTER TABLE saved_items ADD COLUMN item_number TEXT');
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_items_item_number ON saved_items(item_number) WHERE item_number IS NOT NULL');
    console.log('✓ item_number column added successfully');
  } else {
    console.log('✓ item_number column already exists');
  }

  db.close();

  console.log('');
  console.log('=========================');
  console.log('Migration completed successfully!');
  console.log('You can now restart the application.');

} catch (error) {
  console.error('Migration failed:', error.message);
  console.error('');
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
