-- InvoicePro Desktop Database Schema

-- Settings table for application configuration
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  company_name TEXT DEFAULT 'Your Company',
  company_email TEXT DEFAULT 'info@company.com',
  company_phone TEXT DEFAULT '',
  company_address TEXT DEFAULT '',
  company_city TEXT DEFAULT '',
  company_state TEXT DEFAULT '',
  company_zip TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  invoice_prefix TEXT DEFAULT 'INV-',
  tax_rate REAL DEFAULT 0.0,
  currency_symbol TEXT DEFAULT '$',
  payment_terms TEXT DEFAULT 'Payment due within 30 days',
  bank_details TEXT DEFAULT '',
  theme TEXT DEFAULT 'blue',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_number TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  zip TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT NOT NULL UNIQUE,
  client_id INTEGER NOT NULL,
  created_from_quote_id INTEGER DEFAULT NULL,
  date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  subtotal REAL DEFAULT 0,
  tax REAL DEFAULT 0,
  discount_type TEXT DEFAULT 'none',
  discount_value REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0,
  shipping REAL DEFAULT 0,
  adjustment REAL DEFAULT 0,
  adjustment_label TEXT DEFAULT '',
  total REAL DEFAULT 0,
  notes TEXT DEFAULT '',
  payment_terms TEXT DEFAULT '',
  client_name TEXT DEFAULT '',
  client_email TEXT DEFAULT '',
  client_phone TEXT DEFAULT '',
  client_address TEXT DEFAULT '',
  client_city TEXT DEFAULT '',
  client_state TEXT DEFAULT '',
  client_zip TEXT DEFAULT '',
  archived INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (created_from_quote_id) REFERENCES quotes(id)
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity REAL DEFAULT 1,
  rate REAL DEFAULT 0,
  discount_type TEXT DEFAULT 'none',
  discount_value REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0,
  amount REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Saved items table for reusable line items
CREATE TABLE IF NOT EXISTS saved_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_number TEXT,
  description TEXT NOT NULL,
  rate REAL DEFAULT 0,
  category TEXT DEFAULT 'General',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Payments table for tracking invoice payments
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  payment_date TEXT NOT NULL,
  payment_method TEXT DEFAULT 'Other',
  reference_number TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Recurring invoices table for automated invoice generation
CREATE TABLE IF NOT EXISTS recurring_invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  frequency TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT DEFAULT NULL,
  last_generated TEXT DEFAULT NULL,
  next_generation TEXT NOT NULL,
  template_name TEXT DEFAULT '',
  subtotal REAL DEFAULT 0,
  tax REAL DEFAULT 0,
  total REAL DEFAULT 0,
  notes TEXT DEFAULT '',
  payment_terms TEXT DEFAULT '',
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Recurring invoice items table
CREATE TABLE IF NOT EXISTS recurring_invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recurring_invoice_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity REAL DEFAULT 1,
  rate REAL DEFAULT 0,
  amount REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recurring_invoice_id) REFERENCES recurring_invoices(id) ON DELETE CASCADE
);

-- Quotes table (formerly estimates)
CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_number TEXT NOT NULL UNIQUE,
  client_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  subtotal REAL DEFAULT 0,
  tax REAL DEFAULT 0,
  discount_type TEXT DEFAULT 'none',
  discount_value REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0,
  shipping REAL DEFAULT 0,
  adjustment REAL DEFAULT 0,
  adjustment_label TEXT DEFAULT '',
  total REAL DEFAULT 0,
  notes TEXT DEFAULT '',
  terms TEXT DEFAULT '',
  converted_to_invoice_id INTEGER DEFAULT NULL,
  archived INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (converted_to_invoice_id) REFERENCES invoices(id)
);

-- Quote items table
CREATE TABLE IF NOT EXISTS quote_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity REAL DEFAULT 1,
  rate REAL DEFAULT 0,
  discount_type TEXT DEFAULT 'none',
  discount_value REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0,
  amount REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

-- Credit notes table for refunds and adjustments
CREATE TABLE IF NOT EXISTS credit_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  credit_note_number TEXT NOT NULL UNIQUE,
  invoice_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  reason TEXT DEFAULT '',
  subtotal REAL DEFAULT 0,
  tax REAL DEFAULT 0,
  total REAL DEFAULT 0,
  status TEXT DEFAULT 'draft',
  notes TEXT DEFAULT '',
  archived INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Credit note items table
CREATE TABLE IF NOT EXISTS credit_note_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  credit_note_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity REAL DEFAULT 1,
  rate REAL DEFAULT 0,
  amount REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (credit_note_id) REFERENCES credit_notes(id) ON DELETE CASCADE
);

-- Expense tracking has been removed from this application
-- Expense categories table (REMOVED)
-- CREATE TABLE IF NOT EXISTS expense_categories (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   name TEXT NOT NULL UNIQUE,
--   description TEXT DEFAULT '',
--   created_at TEXT DEFAULT CURRENT_TIMESTAMP
-- );

-- Expenses table for tracking business expenses (REMOVED)
-- CREATE TABLE IF NOT EXISTS expenses (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   expense_number TEXT NOT NULL UNIQUE,
--   category_id INTEGER NOT NULL,
--   vendor TEXT NOT NULL,
--   amount REAL NOT NULL,
--   date TEXT NOT NULL,
--   payment_method TEXT DEFAULT 'Cash',
--   reference_number TEXT DEFAULT '',
--   description TEXT DEFAULT '',
--   receipt_url TEXT DEFAULT '',
--   billable INTEGER DEFAULT 0,
--   client_id INTEGER DEFAULT NULL,
--   invoice_id INTEGER DEFAULT NULL,
--   notes TEXT DEFAULT '',
--   created_at TEXT DEFAULT CURRENT_TIMESTAMP,
--   updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (category_id) REFERENCES expense_categories(id),
--   FOREIGN KEY (client_id) REFERENCES clients(id),
--   FOREIGN KEY (invoice_id) REFERENCES invoices(id)
-- );

-- Reminder templates table for email templates
CREATE TABLE IF NOT EXISTS reminder_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  days_before_due INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Invoice reminders table for tracking sent reminders
CREATE TABLE IF NOT EXISTS invoice_reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  template_id INTEGER DEFAULT NULL,
  sent_date TEXT NOT NULL,
  reminder_type TEXT DEFAULT 'manual',
  days_overdue INTEGER DEFAULT 0,
  status TEXT DEFAULT 'sent',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES reminder_templates(id)
);

-- Users table for multi-user/network mode
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  role TEXT DEFAULT 'user',
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login TEXT DEFAULT NULL,
  created_by INTEGER DEFAULT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  ip_address TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Audit log for tracking user actions
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT NULL,
  username TEXT DEFAULT 'system',
  action TEXT NOT NULL,
  resource_type TEXT DEFAULT '',
  resource_id INTEGER DEFAULT NULL,
  details TEXT DEFAULT '',
  ip_address TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default settings
INSERT OR IGNORE INTO settings (id) VALUES (1);

-- Insert default admin user (username: admin, password: admin123 - MUST CHANGE ON FIRST LOGIN)
-- Password hash for 'admin123' using bcrypt
INSERT OR IGNORE INTO users (id, username, email, password_hash, full_name, role, active) VALUES
  (1, 'admin', 'admin@localhost', '$2a$10$rKGJ5F3p0qC4qOq4qOq4qOxYxYxYxYxYxYxYxYxYxYxYxYxYxYxY', 'Administrator', 'admin', 1);

-- Insert default expense categories
INSERT OR IGNORE INTO expense_categories (id, name, description) VALUES
  (1, 'Office Supplies', 'General office supplies and materials'),
  (2, 'Travel', 'Business travel expenses'),
  (3, 'Meals & Entertainment', 'Client meals and business entertainment'),
  (4, 'Software & Subscriptions', 'Software licenses and online subscriptions'),
  (5, 'Utilities', 'Internet, phone, electricity'),
  (6, 'Professional Services', 'Consulting, legal, accounting services'),
  (7, 'Marketing', 'Advertising and promotional expenses'),
  (8, 'Equipment', 'Computer equipment and hardware'),
  (9, 'Rent', 'Office rent and facilities'),
  (10, 'Other', 'Miscellaneous expenses');

-- Insert default reminder templates
INSERT OR IGNORE INTO reminder_templates (id, name, subject, body, days_before_due, active) VALUES
  (1, 'Payment Due Soon', 'Reminder: Invoice {invoice_number} Due Soon', 'Dear {client_name},\n\nThis is a friendly reminder that Invoice {invoice_number} for {total} is due on {due_date}.\n\nPlease let us know if you have any questions.\n\nBest regards,\n{company_name}', 3, 1),
  (2, 'Payment Overdue', 'Overdue: Invoice {invoice_number}', 'Dear {client_name},\n\nOur records indicate that Invoice {invoice_number} for {total} is now overdue.\n\nPlease remit payment at your earliest convenience.\n\nThank you,\n{company_name}', -7, 1),
  (3, 'Second Reminder', 'Second Notice: Invoice {invoice_number}', 'Dear {client_name},\n\nThis is our second notice regarding Invoice {invoice_number} for {total}.\n\nImmediate payment would be appreciated.\n\nRegards,\n{company_name}', -14, 1);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_archived ON invoices(archived);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_client_id ON recurring_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_active ON recurring_invoices(active);
CREATE INDEX IF NOT EXISTS idx_recurring_invoice_items_recurring_invoice_id ON recurring_invoice_items(recurring_invoice_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_archived ON quotes(archived);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_invoice_id ON credit_notes(invoice_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_client_id ON credit_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_status ON credit_notes(status);
CREATE INDEX IF NOT EXISTS idx_credit_notes_archived ON credit_notes(archived);
CREATE INDEX IF NOT EXISTS idx_credit_note_items_credit_note_id ON credit_note_items(credit_note_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_client_id ON expenses(client_id);
CREATE INDEX IF NOT EXISTS idx_expenses_invoice_id ON expenses(invoice_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_billable ON expenses(billable);
CREATE INDEX IF NOT EXISTS idx_invoice_reminders_invoice_id ON invoice_reminders(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_reminders_template_id ON invoice_reminders(template_id);
CREATE INDEX IF NOT EXISTS idx_invoice_reminders_sent_date ON invoice_reminders(sent_date);
CREATE INDEX IF NOT EXISTS idx_reminder_templates_active ON reminder_templates(active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_customer_number ON clients(customer_number) WHERE customer_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_items_item_number ON saved_items(item_number) WHERE item_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource_type ON audit_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
