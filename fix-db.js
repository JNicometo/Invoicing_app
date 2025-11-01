// Run this script to manually fix the database
// Usage: npm run fix-db

const path = require('path');
const os = require('os');
const Database = require('better-sqlite3');

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

console.log('===================================');
console.log('Database Fix Script');
console.log('===================================');
console.log('Database path:', dbPath);
console.log('');

try {
  const db = new Database(dbPath);

  // Check clients table
  console.log('1. Checking clients table...');
  const clientColumns = db.pragma('table_info(clients)');
  const hasCustomerNumber = clientColumns.some(col => col.name === 'customer_number');

  if (hasCustomerNumber) {
    console.log('   ✓ customer_number column already exists');
  } else {
    console.log('   → Adding customer_number column...');
    db.exec('ALTER TABLE clients ADD COLUMN customer_number TEXT');
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_customer_number ON clients(customer_number) WHERE customer_number IS NOT NULL');
    console.log('   ✓ customer_number column added successfully!');
  }

  // Check saved_items table
  console.log('');
  console.log('2. Checking saved_items table...');
  const itemColumns = db.pragma('table_info(saved_items)');
  const hasItemNumber = itemColumns.some(col => col.name === 'item_number');

  if (hasItemNumber) {
    console.log('   ✓ item_number column already exists');
  } else {
    console.log('   → Adding item_number column...');
    db.exec('ALTER TABLE saved_items ADD COLUMN item_number TEXT');
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_items_item_number ON saved_items(item_number) WHERE item_number IS NOT NULL');
    console.log('   ✓ item_number column added successfully!');
  }

  // Verify
  console.log('');
  console.log('3. Verifying changes...');
  const newClientColumns = db.pragma('table_info(clients)');
  const newItemColumns = db.pragma('table_info(saved_items)');

  const clientHas = newClientColumns.some(col => col.name === 'customer_number');
  const itemHas = newItemColumns.some(col => col.name === 'item_number');

  if (clientHas && itemHas) {
    console.log('   ✓ All columns verified successfully!');
  } else {
    console.log('   ✗ Verification failed - some columns missing');
  }

  db.close();

  console.log('');
  console.log('===================================');
  console.log('✅ Database fix completed!');
  console.log('You can now restart the application.');
  console.log('===================================');

} catch (error) {
  console.error('');
  console.error('❌ Error fixing database:');
  console.error(error.message);
  console.error('');
  console.error('Full error:');
  console.error(error);
  process.exit(1);
}
