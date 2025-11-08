const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

let db = null;

// Get the user data path for storing the database
const getUserDataPath = () => {
  return app ? app.getPath('userData') : './';
};

// Initialize database
const initDatabase = () => {
  try {
    const dbPath = path.join(getUserDataPath(), 'invoicepro.db');
    console.log('Initializing database at:', dbPath);

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);

    // Run migrations for existing databases
    runMigrations();

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Run database migrations
const runMigrations = () => {
  try {
    console.log('Running database migrations...');

    // Check if customer_number column exists in clients table
    const clientColumns = db.pragma('table_info(clients)');
    const hasCustomerNumber = clientColumns.some(col => col.name === 'customer_number');

    if (!hasCustomerNumber) {
      console.log('Adding customer_number column to clients table...');
      // Add column without UNIQUE constraint in ALTER TABLE (SQLite limitation)
      db.exec('ALTER TABLE clients ADD COLUMN customer_number TEXT');
      // Create unique index separately
      db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_customer_number ON clients(customer_number) WHERE customer_number IS NOT NULL');
      console.log('✓ customer_number column added');
    } else {
      console.log('✓ customer_number column already exists');
    }

    // Check if item_number column exists in saved_items table
    const savedItemColumns = db.pragma('table_info(saved_items)');
    const hasItemNumber = savedItemColumns.some(col => col.name === 'item_number');

    if (!hasItemNumber) {
      console.log('Adding item_number column to saved_items table...');
      // Add column without UNIQUE constraint in ALTER TABLE (SQLite limitation)
      db.exec('ALTER TABLE saved_items ADD COLUMN item_number TEXT');
      // Create unique index separately
      db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_items_item_number ON saved_items(item_number) WHERE item_number IS NOT NULL');
      console.log('✓ item_number column added');
    } else {
      console.log('✓ item_number column already exists');
    }

    // Add new theme settings columns to settings table
    console.log('Checking for theme customization columns...');
    const settingsColumns = db.pragma('table_info(settings)');
    const columnNames = settingsColumns.map(col => col.name);

    // List of new columns to add
    const newColumns = [
      // Company
      { name: 'company_website', type: 'TEXT', default: "''" },
      { name: 'tax_id', type: 'TEXT', default: "''" },
      { name: 'business_registration', type: 'TEXT', default: "''" },
      { name: 'company_country', type: 'TEXT', default: "''" },

      // Invoice settings
      { name: 'invoice_suffix', type: 'TEXT', default: "''" },
      { name: 'invoice_start_number', type: 'TEXT', default: "'1'" },
      { name: 'quote_prefix', type: 'TEXT', default: "'QUO-'" },
      { name: 'tax_label', type: 'TEXT', default: "'Tax'" },
      { name: 'currency_code', type: 'TEXT', default: "'USD'" },
      { name: 'default_due_days', type: 'TEXT', default: "'30'" },
      { name: 'default_notes', type: 'TEXT', default: "''" },
      { name: 'invoice_footer', type: 'TEXT', default: "'Thank you for your business!'" },

      // Formatting
      { name: 'date_format', type: 'TEXT', default: "'MM/DD/YYYY'" },
      { name: 'number_format', type: 'TEXT', default: "'1,000.00'" },
      { name: 'decimal_separator', type: 'TEXT', default: "'.'" },
      { name: 'thousand_separator', type: 'TEXT', default: "','" },

      // Numbering
      { name: 'customer_number_prefix', type: 'TEXT', default: "'CUST-'" },
      { name: 'item_number_prefix', type: 'TEXT', default: "'ITEM-'" },

      // Email
      { name: 'email_subject_template', type: 'TEXT', default: "'Invoice {invoice_number} from {company_name}'" },
      { name: 'email_body_template', type: 'TEXT', default: "'Dear {client_name},\n\nPlease find attached invoice {invoice_number} for {total}.\n\nThank you for your business!\n\nBest regards,\n{company_name}'" },
      { name: 'email_cc', type: 'TEXT', default: "''" },
      { name: 'email_bcc', type: 'TEXT', default: "''" },

      // Display
      { name: 'show_item_numbers', type: 'INTEGER', default: '1' },
      { name: 'show_customer_numbers', type: 'INTEGER', default: '1' },
      { name: 'show_tax_breakdown', type: 'INTEGER', default: '1' },
      { name: 'show_payment_terms', type: 'INTEGER', default: '1' },

      // Theme - Colors
      { name: 'primary_color', type: 'TEXT', default: "'#3B82F6'" },
      { name: 'secondary_color', type: 'TEXT', default: "'#8B5CF6'" },
      { name: 'accent_color', type: 'TEXT', default: "'#10B981'" },
      { name: 'invoice_header_color', type: 'TEXT', default: "'#1F2937'" },
      { name: 'invoice_accent_color', type: 'TEXT', default: "'#3B82F6'" },
      { name: 'text_primary_color', type: 'TEXT', default: "'#111827'" },
      { name: 'text_secondary_color', type: 'TEXT', default: "'#6B7280'" },

      // Theme - Layout
      { name: 'invoice_template', type: 'TEXT', default: "'modern'" },
      { name: 'invoice_header_style', type: 'TEXT', default: "'left'" },
      { name: 'invoice_border_style', type: 'TEXT', default: "'subtle'" },
      { name: 'invoice_spacing', type: 'TEXT', default: "'normal'" },
      { name: 'invoice_table_style', type: 'TEXT', default: "'striped'" },

      // Theme - Typography
      { name: 'heading_font', type: 'TEXT', default: "'Inter'" },
      { name: 'body_font', type: 'TEXT', default: "'Inter'" },
      { name: 'heading_size', type: 'TEXT', default: "'normal'" },
      { name: 'body_size', type: 'TEXT', default: "'normal'" },

      // Theme - Invoice Elements
      { name: 'show_logo_on_invoice', type: 'INTEGER', default: '1' },
      { name: 'show_company_address_on_invoice', type: 'INTEGER', default: '1' },
      { name: 'show_invoice_border', type: 'INTEGER', default: '1' },
      { name: 'invoice_corner_style', type: 'TEXT', default: "'rounded'" },

      // Theme - PDF
      { name: 'pdf_page_size', type: 'TEXT', default: "'letter'" },
      { name: 'pdf_margin_size', type: 'TEXT', default: "'normal'" },
      { name: 'pdf_header_height', type: 'TEXT', default: "'normal'" },
    ];

    let addedCount = 0;
    newColumns.forEach(column => {
      if (!columnNames.includes(column.name)) {
        console.log(`Adding ${column.name} column...`);
        db.exec(`ALTER TABLE settings ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default}`);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      console.log(`✓ Added ${addedCount} new theme customization columns`);
    } else {
      console.log('✓ All theme customization columns already exist');
    }

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    console.error('Stack trace:', error.stack);
    // Don't throw - let the app continue even if migrations fail
  }
};

// Get database instance
const getDatabase = () => {
  if (!db) {
    initDatabase();
  }
  return db;
};

// Settings operations
const getSettings = () => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM settings WHERE id = 1').get() || {};
};

const updateSettings = (settings) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE settings SET
      company_name = @company_name,
      company_email = @company_email,
      company_phone = @company_phone,
      company_website = @company_website,
      company_address = @company_address,
      company_city = @company_city,
      company_state = @company_state,
      company_zip = @company_zip,
      company_country = @company_country,
      tax_id = @tax_id,
      business_registration = @business_registration,
      logo_url = @logo_url,
      invoice_prefix = @invoice_prefix,
      invoice_suffix = @invoice_suffix,
      invoice_start_number = @invoice_start_number,
      quote_prefix = @quote_prefix,
      tax_rate = @tax_rate,
      tax_label = @tax_label,
      currency_symbol = @currency_symbol,
      currency_code = @currency_code,
      payment_terms = @payment_terms,
      bank_details = @bank_details,
      default_due_days = @default_due_days,
      default_notes = @default_notes,
      invoice_footer = @invoice_footer,
      date_format = @date_format,
      number_format = @number_format,
      decimal_separator = @decimal_separator,
      thousand_separator = @thousand_separator,
      customer_number_prefix = @customer_number_prefix,
      item_number_prefix = @item_number_prefix,
      email_subject_template = @email_subject_template,
      email_body_template = @email_body_template,
      email_cc = @email_cc,
      email_bcc = @email_bcc,
      show_item_numbers = @show_item_numbers,
      show_customer_numbers = @show_customer_numbers,
      show_tax_breakdown = @show_tax_breakdown,
      show_payment_terms = @show_payment_terms,
      theme = @theme,
      primary_color = @primary_color,
      secondary_color = @secondary_color,
      accent_color = @accent_color,
      invoice_header_color = @invoice_header_color,
      invoice_accent_color = @invoice_accent_color,
      text_primary_color = @text_primary_color,
      text_secondary_color = @text_secondary_color,
      invoice_template = @invoice_template,
      invoice_header_style = @invoice_header_style,
      invoice_border_style = @invoice_border_style,
      invoice_spacing = @invoice_spacing,
      invoice_table_style = @invoice_table_style,
      heading_font = @heading_font,
      body_font = @body_font,
      heading_size = @heading_size,
      body_size = @body_size,
      show_logo_on_invoice = @show_logo_on_invoice,
      show_company_address_on_invoice = @show_company_address_on_invoice,
      show_invoice_border = @show_invoice_border,
      invoice_corner_style = @invoice_corner_style,
      pdf_page_size = @pdf_page_size,
      pdf_margin_size = @pdf_margin_size,
      pdf_header_height = @pdf_header_height,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `);
  return stmt.run(settings);
};

// Client operations
const getAllClients = () => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM clients ORDER BY name').all();
};

const getClient = (id) => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
};

const createClient = (client) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO clients (customer_number, name, email, phone, address, city, state, zip, notes)
    VALUES (@customer_number, @name, @email, @phone, @address, @city, @state, @zip, @notes)
  `);
  return stmt.run(client);
};

const updateClient = (id, client) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE clients SET
      customer_number = @customer_number,
      name = @name,
      email = @email,
      phone = @phone,
      address = @address,
      city = @city,
      state = @state,
      zip = @zip,
      notes = @notes,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);
  return stmt.run({ ...client, id });
};

const deleteClient = (id) => {
  const db = getDatabase();
  return db.prepare('DELETE FROM clients WHERE id = ?').run(id);
};

const getClientByCustomerNumber = (customerNumber) => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM clients WHERE customer_number = ?').get(customerNumber);
};

const getClientStats = (clientId) => {
  const db = getDatabase();
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_invoices,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0) as total_paid,
      COALESCE(SUM(CASE WHEN status != 'paid' AND archived = 0 THEN total ELSE 0 END), 0) as total_outstanding
    FROM invoices
    WHERE client_id = ?
  `).get(clientId);
  return stats;
};

// Helper function to update overdue invoices
const updateOverdueInvoices = () => {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  // Update invoices to 'overdue' if due date has passed and status is not 'paid'
  const stmt = db.prepare(`
    UPDATE invoices
    SET status = 'overdue'
    WHERE date(due_date) < date(?)
      AND status != 'paid'
      AND status != 'overdue'
      AND archived = 0
  `);

  stmt.run(today);
};

// Invoice operations
const getAllInvoices = () => {
  const db = getDatabase();

  // Update overdue invoices before fetching
  updateOverdueInvoices();

  return db.prepare(`
    SELECT i.*, c.name as client_name, c.email as client_email
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    WHERE i.archived = 0
    ORDER BY i.created_at DESC
  `).all();
};

const getArchivedInvoices = () => {
  const db = getDatabase();
  return db.prepare(`
    SELECT i.*, c.name as client_name, c.email as client_email
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    WHERE i.archived = 1
    ORDER BY i.created_at DESC
  `).all();
};

const getInvoice = (id) => {
  const db = getDatabase();

  // Update overdue invoices before fetching
  updateOverdueInvoices();

  const invoice = db.prepare(`
    SELECT i.*, c.name as client_name, c.email as client_email,
           c.phone as client_phone, c.address as client_address,
           c.city as client_city, c.state as client_state, c.zip as client_zip
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    WHERE i.id = ?
  `).get(id);

  if (invoice) {
    invoice.items = getInvoiceItems(id);
  }

  return invoice;
};

const getInvoiceItems = (invoiceId) => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoiceId);
};

const createInvoice = (invoice, items) => {
  const db = getDatabase();

  const invoiceStmt = db.prepare(`
    INSERT INTO invoices (invoice_number, client_id, date, due_date, status, subtotal, tax, total, notes, payment_terms)
    VALUES (@invoice_number, @client_id, @date, @due_date, @status, @subtotal, @tax, @total, @notes, @payment_terms)
  `);

  const itemStmt = db.prepare(`
    INSERT INTO invoice_items (invoice_id, description, quantity, rate, amount)
    VALUES (?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((invoice, items) => {
    const result = invoiceStmt.run(invoice);
    const invoiceId = result.lastInsertRowid;

    for (const item of items) {
      itemStmt.run(invoiceId, item.description, item.quantity, item.rate, item.amount);
    }

    return invoiceId;
  });

  return transaction(invoice, items);
};

const updateInvoice = (id, invoice, items) => {
  const db = getDatabase();

  const invoiceStmt = db.prepare(`
    UPDATE invoices SET
      invoice_number = @invoice_number,
      client_id = @client_id,
      date = @date,
      due_date = @due_date,
      status = @status,
      subtotal = @subtotal,
      tax = @tax,
      total = @total,
      notes = @notes,
      payment_terms = @payment_terms,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  const deleteItemsStmt = db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?');
  const itemStmt = db.prepare(`
    INSERT INTO invoice_items (invoice_id, description, quantity, rate, amount)
    VALUES (?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((id, invoice, items) => {
    invoiceStmt.run({ ...invoice, id });
    deleteItemsStmt.run(id);

    for (const item of items) {
      itemStmt.run(id, item.description, item.quantity, item.rate, item.amount);
    }
  });

  transaction(id, invoice, items);
};

const deleteInvoice = (id) => {
  const db = getDatabase();
  return db.prepare('DELETE FROM invoices WHERE id = ?').run(id);
};

const archiveInvoice = (id) => {
  const db = getDatabase();
  return db.prepare('UPDATE invoices SET archived = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
};

const restoreInvoice = (id) => {
  const db = getDatabase();
  return db.prepare('UPDATE invoices SET archived = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
};

const generateInvoiceNumber = () => {
  const db = getDatabase();
  const settings = getSettings();
  const prefix = settings.invoice_prefix || 'INV-';

  const lastInvoice = db.prepare(`
    SELECT invoice_number FROM invoices
    WHERE invoice_number LIKE ?
    ORDER BY id DESC
    LIMIT 1
  `).get(`${prefix}%`);

  if (!lastInvoice) {
    return `${prefix}0001`;
  }

  const lastNumber = parseInt(lastInvoice.invoice_number.replace(prefix, ''));
  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `${prefix}${nextNumber}`;
};

// Saved items operations
const getAllSavedItems = () => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM saved_items ORDER BY description').all();
};

const getSavedItem = (id) => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM saved_items WHERE id = ?').get(id);
};

const createSavedItem = (item) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO saved_items (item_number, description, rate, category)
    VALUES (@item_number, @description, @rate, @category)
  `);
  return stmt.run(item);
};

const updateSavedItem = (id, item) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE saved_items SET
      item_number = @item_number,
      description = @description,
      rate = @rate,
      category = @category,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);
  return stmt.run({ ...item, id });
};

const deleteSavedItem = (id) => {
  const db = getDatabase();
  return db.prepare('DELETE FROM saved_items WHERE id = ?').run(id);
};

const getSavedItemByItemNumber = (itemNumber) => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM saved_items WHERE item_number = ?').get(itemNumber);
};

// Dashboard stats
const getDashboardStats = () => {
  const db = getDatabase();

  // Update overdue invoices before fetching stats
  updateOverdueInvoices();

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_invoices,
      COALESCE(SUM(total), 0) as total_revenue,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0) as paid_amount,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN total ELSE 0 END), 0) as pending_amount,
      COALESCE(SUM(CASE WHEN status = 'overdue' THEN total ELSE 0 END), 0) as overdue_amount
    FROM invoices
    WHERE archived = 0
  `).get();

  return stats;
};

module.exports = {
  initDatabase,
  getDatabase,
  getSettings,
  updateSettings,
  getAllClients,
  getClient,
  getClientByCustomerNumber,
  createClient,
  updateClient,
  deleteClient,
  getClientStats,
  getAllInvoices,
  getArchivedInvoices,
  getInvoice,
  getInvoiceItems,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  archiveInvoice,
  restoreInvoice,
  generateInvoiceNumber,
  getAllSavedItems,
  getSavedItem,
  getSavedItemByItemNumber,
  createSavedItem,
  updateSavedItem,
  deleteSavedItem,
  getDashboardStats
};
