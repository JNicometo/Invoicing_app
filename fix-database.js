const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

// Find the database file
let dbPath;
if (process.platform === 'darwin') {
  dbPath = path.join(os.homedir(), 'Library/Application Support/InvoicePro/invoices.db');
} else if (process.platform === 'win32') {
  dbPath = path.join(process.env.APPDATA, 'InvoicePro/invoices.db');
} else {
  dbPath = path.join(os.homedir(), '.config/InvoicePro/invoices.db');
}

console.log('Database path:', dbPath);

const db = new Database(dbPath);

console.log('\n=== Checking saved_items table ===');
const savedItemColumns = db.pragma('table_info(saved_items)');
console.log('Existing columns:', savedItemColumns.map(c => c.name).join(', '));

// Add missing columns
const columnsToAdd = [
  { name: 'sku', type: 'TEXT', default: "''" },
  { name: 'barcode', type: 'TEXT', default: "''" },
  { name: 'unit_of_measure', type: 'TEXT', default: "'Each'" },
  { name: 'cost_price', type: 'REAL', default: '0' },
  { name: 'markup_percentage', type: 'REAL', default: '0' },
  { name: 'taxable', type: 'INTEGER', default: '1' },
  { name: 'is_active', type: 'INTEGER', default: '1' },
  { name: 'notes', type: 'TEXT', default: "''" }
];

let added = 0;
columnsToAdd.forEach(column => {
  const exists = savedItemColumns.some(col => col.name === column.name);
  if (!exists) {
    console.log(`Adding ${column.name} column...`);
    db.exec(`ALTER TABLE saved_items ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default}`);
    added++;
  }
});

console.log(`✓ Added ${added} columns to saved_items table`);

console.log('\n=== Checking settings table ===');
const settingsColumns = db.pragma('table_info(settings)');
console.log('Existing columns:', settingsColumns.map(c => c.name).join(', '));

const settingsToAdd = [
  { name: 'next_invoice_number', type: 'TEXT', default: "'INV-0001'" },
  { name: 'next_quote_number', type: 'TEXT', default: "'QUO-0001'" }
];

let settingsAdded = 0;
settingsToAdd.forEach(column => {
  const exists = settingsColumns.some(col => col.name === column.name);
  if (!exists) {
    console.log(`Adding ${column.name} column...`);
    db.exec(`ALTER TABLE settings ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default}`);
    settingsAdded++;
  }
});

console.log(`✓ Added ${settingsAdded} columns to settings table`);

db.close();
console.log('\n✓ Database updated successfully!');
console.log('You can now restart your app.');
