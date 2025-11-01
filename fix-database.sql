-- Add missing columns to existing database
-- Run this with: sqlite3 /path/to/invoicepro.db < fix-database.sql

-- Add customer_number column to clients table
ALTER TABLE clients ADD COLUMN customer_number TEXT;

-- Add item_number column to saved_items table
ALTER TABLE saved_items ADD COLUMN item_number TEXT;

-- Create unique indexes (only enforce uniqueness when value is not NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_customer_number ON clients(customer_number) WHERE customer_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_items_item_number ON saved_items(item_number) WHERE item_number IS NOT NULL;

-- Verify the changes
SELECT 'Columns added successfully!' as result;
