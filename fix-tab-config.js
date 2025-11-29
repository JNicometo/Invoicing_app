#!/usr/bin/env node
/**
 * Script to manually update tab configuration from 'estimates' to 'quotes'
 * Run this if the automatic migration didn't update your tabs
 */

const Database = require('better-sqlite3');
const path = require('path');

// Determine the database path
const dbPath = process.env.DB_PATH || path.join(__dirname, 'invoicepro.db');

console.log('Opening database at:', dbPath);
const db = new Database(dbPath);

try {
  // Get current settings
  const settings = db.prepare('SELECT tab_configuration FROM settings WHERE id = 1').get();

  if (!settings || !settings.tab_configuration) {
    console.log('No tab configuration found. Using default with quotes.');
    const defaultConfig = JSON.stringify([
      { id: 'dashboard', name: 'Dashboard', enabled: true, order: 0 },
      { id: 'invoices', name: 'Invoices', enabled: true, order: 1 },
      { id: 'quotes', name: 'Quotes', enabled: true, order: 2 },
      { id: 'credit-notes', name: 'Credit Notes', enabled: true, order: 3 },
      { id: 'recurring', name: 'Recurring', enabled: true, order: 4 },
      { id: 'clients', name: 'Clients', enabled: true, order: 5 },
      { id: 'reminders', name: 'Reminders', enabled: true, order: 6 },
      { id: 'reports', name: 'Reports', enabled: true, order: 7 },
      { id: 'saved-items', name: 'Saved Items', enabled: true, order: 8 },
      { id: 'archive', name: 'Archive', enabled: true, order: 9 },
      { id: 'settings', name: 'Settings', enabled: true, order: 10 }
    ]);
    db.prepare('UPDATE settings SET tab_configuration = ? WHERE id = 1').run(defaultConfig);
    console.log('✓ Set default tab configuration with quotes');
  } else {
    // Parse and update
    const tabConfig = JSON.parse(settings.tab_configuration);
    const estimatesTab = tabConfig.find(tab => tab.id === 'estimates');

    if (estimatesTab) {
      console.log('Found estimates tab, updating to quotes...');
      estimatesTab.id = 'quotes';
      estimatesTab.name = 'Quotes';

      const updatedConfig = JSON.stringify(tabConfig);
      db.prepare('UPDATE settings SET tab_configuration = ? WHERE id = 1').run(updatedConfig);
      console.log('✓ Updated tab configuration: estimates -> quotes');
    } else {
      console.log('✓ Tab configuration already uses quotes (no update needed)');
    }
  }

  // Verify the update
  const updated = db.prepare('SELECT tab_configuration FROM settings WHERE id = 1').get();
  const parsedConfig = JSON.parse(updated.tab_configuration);
  const quotesTab = parsedConfig.find(tab => tab.id === 'quotes');

  if (quotesTab) {
    console.log('✓ Verified: Quotes tab is now configured');
    console.log('  Tab details:', quotesTab);
  } else {
    console.error('✗ Error: Quotes tab not found after update!');
  }

} catch (error) {
  console.error('Error updating tab configuration:', error);
  process.exit(1);
} finally {
  db.close();
  console.log('\nDone! Restart your app to see the changes.');
}
