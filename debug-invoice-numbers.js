/**
 * Debug script to check invoice numbering
 * Run this with: node debug-invoice-numbers.js
 */

const Database = require('better-sqlite3');
const path = require('path');

// Update this path to your database location
const dbPath = path.join(process.env.HOME || process.env.USERPROFILE, '.invoicepro', 'invoicepro.db');

console.log('Database path:', dbPath);
console.log('=====================================\n');

try {
  const db = new Database(dbPath, { readonly: true });

  // Check settings
  console.log('1. CURRENT SETTINGS:');
  console.log('--------------------');
  const settings = db.prepare('SELECT invoice_prefix, next_invoice_number FROM settings WHERE id = 1').get();
  console.log('Invoice Prefix:', settings.invoice_prefix || '(not set)');
  console.log('Next Invoice Number:', settings.next_invoice_number || '(not set)');
  console.log('');

  // Check last 5 invoices
  console.log('2. LAST 5 INVOICES:');
  console.log('-------------------');
  const invoices = db.prepare(`
    SELECT id, invoice_number, date, total
    FROM invoices
    ORDER BY id DESC
    LIMIT 5
  `).all();

  if (invoices.length === 0) {
    console.log('No invoices found in database');
  } else {
    invoices.reverse().forEach((inv, idx) => {
      console.log(`${idx + 1}. ID: ${inv.id} | Number: ${inv.invoice_number} | Date: ${inv.date} | Total: $${inv.total}`);
    });
  }
  console.log('');

  // Test increment function
  console.log('3. INCREMENT FUNCTION TEST:');
  console.log('---------------------------');
  const testNumbers = [
    'int-120000',
    'INV-0001',
    'QUO-2024-0099',
    settings.next_invoice_number
  ].filter(Boolean);

  const incrementNumberString = (numberString) => {
    const match = numberString.match(/^(.*?)(\d+)([^\d]*)$/);
    if (!match) {
      return numberString + '0001';
    }
    const prefix = match[1];
    const number = match[2];
    const suffix = match[3];
    const padding = number.length;
    const nextNumber = (parseInt(number, 10) + 1).toString().padStart(padding, '0');
    return prefix + nextNumber + suffix;
  };

  testNumbers.forEach(num => {
    const next = incrementNumberString(num);
    console.log(`${num} → ${next}`);
  });
  console.log('');

  // Check if there's a schema issue
  console.log('4. SETTINGS TABLE SCHEMA:');
  console.log('-------------------------');
  const columns = db.prepare("PRAGMA table_info(settings)").all();
  const hasNextInvoiceNumber = columns.some(col => col.name === 'next_invoice_number');
  console.log('Has next_invoice_number column:', hasNextInvoiceNumber ? 'YES ✓' : 'NO ✗');
  if (!hasNextInvoiceNumber) {
    console.log('\n⚠️  WARNING: The next_invoice_number column is missing!');
    console.log('This column is required for custom invoice numbering.');
    console.log('Run the migration to add it.');
  }
  console.log('');

  db.close();

  console.log('=====================================');
  console.log('DIAGNOSIS COMPLETE');
  console.log('=====================================\n');

  console.log('WHAT TO DO NEXT:');
  console.log('----------------');
  console.log('1. Check the "Next Invoice Number" value above');
  console.log('2. If it\'s "(not set)", go to Settings and set it to: int-120000');
  console.log('3. Create a new invoice and check if the number increments');
  console.log('4. Run this script again to see if the number changed');
  console.log('\nIf the problem persists, please share the output above.');

} catch (error) {
  console.error('Error:', error.message);
  console.log('\nPossible issues:');
  console.log('- Database file not found at:', dbPath);
  console.log('- Database is locked (close the app first)');
  console.log('- Database path is different on your system');
}
