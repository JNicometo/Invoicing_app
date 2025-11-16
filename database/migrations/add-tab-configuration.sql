-- Add tab configuration and stripe settings to settings table
-- Run this with: sqlite3 /path/to/invoicepro.db < add-tab-configuration.sql

-- Add tab_configuration column to settings table
ALTER TABLE settings ADD COLUMN tab_configuration TEXT DEFAULT NULL;

-- Add stripe settings columns
ALTER TABLE settings ADD COLUMN stripe_secret_key TEXT DEFAULT '';
ALTER TABLE settings ADD COLUMN stripe_publishable_key TEXT DEFAULT '';
ALTER TABLE settings ADD COLUMN stripe_enabled INTEGER DEFAULT 0;

-- Set default tab configuration (all tabs enabled in default order)
UPDATE settings
SET tab_configuration = '[{"id":"dashboard","name":"Dashboard","enabled":true,"order":0},{"id":"invoices","name":"Invoices","enabled":true,"order":1},{"id":"estimates","name":"Estimates","enabled":true,"order":2},{"id":"credit-notes","name":"Credit Notes","enabled":true,"order":3},{"id":"recurring","name":"Recurring","enabled":true,"order":4},{"id":"clients","name":"Clients","enabled":true,"order":5},{"id":"reminders","name":"Reminders","enabled":true,"order":6},{"id":"reports","name":"Reports","enabled":true,"order":7},{"id":"saved-items","name":"Saved Items","enabled":true,"order":8},{"id":"archive","name":"Archive","enabled":true,"order":9},{"id":"settings","name":"Settings","enabled":true,"order":10}]'
WHERE id = 1;

-- Verify the changes
SELECT 'Tab configuration and Stripe settings added successfully!' as result;
