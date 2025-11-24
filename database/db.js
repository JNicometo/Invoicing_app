const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

let db = null;

// Get the user data path for storing the database
const getUserDataPath = () => {
  return app ? app.getPath('userData') : './';
};

// Get database filename (configurable via environment variable)
const getDbFilename = () => {
  return process.env.DB_FILENAME || 'invoicepro.db';
};

// Initialize database
const initDatabase = () => {
  try {
    const dbFilename = getDbFilename();
    const dbPath = path.join(getUserDataPath(), dbFilename);
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

    // Create backup before running migrations
    try {
      const dbFilename = getDbFilename();
      const dbPath = path.join(getUserDataPath(), dbFilename);
      const backupPath = path.join(
        getUserDataPath(),
        `${dbFilename.replace('.db', '')}-backup-${Date.now()}.db`
      );

      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, backupPath);
        console.log(`Database backed up to: ${backupPath}`);
      }
    } catch (backupError) {
      console.warn('Could not create backup before migrations:', backupError.message);
      // Continue with migrations even if backup fails
    }

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

      // SMTP
      { name: 'smtp_host', type: 'TEXT', default: "''" },
      { name: 'smtp_port', type: 'TEXT', default: "'587'" },
      { name: 'smtp_secure', type: 'INTEGER', default: '0' },
      { name: 'smtp_user', type: 'TEXT', default: "''" },
      { name: 'smtp_password', type: 'TEXT', default: "''" },
      { name: 'smtp_from_name', type: 'TEXT', default: "''" },
      { name: 'smtp_from_email', type: 'TEXT', default: "''" },

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

      // Tab Configuration
      { name: 'tab_configuration', type: 'TEXT', default: "NULL" },

      // Stripe Integration
      { name: 'stripe_secret_key', type: 'TEXT', default: "''" },
      { name: 'stripe_publishable_key', type: 'TEXT', default: "''" },
      { name: 'stripe_enabled', type: 'INTEGER', default: '0' },
      { name: 'stripe_webhook_secret', type: 'TEXT', default: "''" },
      { name: 'webhook_port', type: 'TEXT', default: "'3001'" },

      // SMTP Security
      { name: 'smtp_verify_tls', type: 'INTEGER', default: '1' }, // 1 = verify TLS (secure), 0 = skip verification

      // Network Mode Settings
      { name: 'network_mode_enabled', type: 'INTEGER', default: '0' },
      { name: 'network_api_port', type: 'TEXT', default: "'3100'" },
      { name: 'network_require_auth', type: 'INTEGER', default: '1' },
      { name: 'network_session_timeout', type: 'TEXT', default: "'24'" }, // hours

      // SQL Server Settings
      { name: 'use_sql_server', type: 'INTEGER', default: '0' },
      { name: 'sql_server_type', type: 'TEXT', default: "'mysql'" }, // mysql, postgres, mssql
      { name: 'sql_server_host', type: 'TEXT', default: "'localhost'" },
      { name: 'sql_server_port', type: 'TEXT', default: "'3306'" },
      { name: 'sql_server_database', type: 'TEXT', default: "'invoicepro'" },
      { name: 'sql_server_username', type: 'TEXT', default: "''" },
      { name: 'sql_server_password', type: 'TEXT', default: "''" },
      { name: 'sql_server_ssl', type: 'INTEGER', default: '0' },
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

    // Add discount and adjustment columns to invoices table
    console.log('Checking for invoice discount/adjustment columns...');
    const invoiceColumns = db.pragma('table_info(invoices)');
    const invoiceColumnNames = invoiceColumns.map(col => col.name);

    const invoiceNewColumns = [
      { name: 'discount_type', type: 'TEXT', default: "'none'" },
      { name: 'discount_value', type: 'REAL', default: '0' },
      { name: 'discount_amount', type: 'REAL', default: '0' },
      { name: 'shipping', type: 'REAL', default: '0' },
      { name: 'adjustment', type: 'REAL', default: '0' },
      { name: 'adjustment_label', type: 'TEXT', default: "''" }
    ];

    let invoiceAddedCount = 0;
    invoiceNewColumns.forEach(column => {
      if (!invoiceColumnNames.includes(column.name)) {
        console.log(`Adding ${column.name} column to invoices table...`);
        db.exec(`ALTER TABLE invoices ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default}`);
        invoiceAddedCount++;
      }
    });

    if (invoiceAddedCount > 0) {
      console.log(`✓ Added ${invoiceAddedCount} new columns to invoices table`);
    } else {
      console.log('✓ All invoice discount/adjustment columns already exist');
    }

    // Add discount columns to invoice_items table
    console.log('Checking for invoice item discount columns...');
    const itemColumns = db.pragma('table_info(invoice_items)');
    const itemColumnNames = itemColumns.map(col => col.name);

    const itemNewColumns = [
      { name: 'discount_type', type: 'TEXT', default: "'none'" },
      { name: 'discount_value', type: 'REAL', default: '0' },
      { name: 'discount_amount', type: 'REAL', default: '0' }
    ];

    let itemAddedCount = 0;
    itemNewColumns.forEach(column => {
      if (!itemColumnNames.includes(column.name)) {
        console.log(`Adding ${column.name} column to invoice_items table...`);
        db.exec(`ALTER TABLE invoice_items ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default}`);
        itemAddedCount++;
      }
    });

    if (itemAddedCount > 0) {
      console.log(`✓ Added ${itemAddedCount} new columns to invoice_items table`);
    } else {
      console.log('✓ All invoice item discount columns already exist');
    }

    // Set default tab configuration if null
    console.log('Checking tab configuration...');
    const settings = db.prepare('SELECT tab_configuration FROM settings WHERE id = 1').get();
    if (!settings || !settings.tab_configuration) {
      console.log('Setting default tab configuration...');
      const defaultTabConfig = JSON.stringify([
        { id: 'dashboard', name: 'Dashboard', enabled: true, order: 0 },
        { id: 'invoices', name: 'Invoices', enabled: true, order: 1 },
        { id: 'estimates', name: 'Estimates', enabled: true, order: 2 },
        { id: 'credit-notes', name: 'Credit Notes', enabled: true, order: 3 },
        { id: 'recurring', name: 'Recurring', enabled: true, order: 4 },
        { id: 'clients', name: 'Clients', enabled: true, order: 5 },
        { id: 'reminders', name: 'Reminders', enabled: true, order: 6 },
        { id: 'reports', name: 'Reports', enabled: true, order: 7 },
        { id: 'saved-items', name: 'Saved Items', enabled: true, order: 8 },
        { id: 'archive', name: 'Archive', enabled: true, order: 9 },
        { id: 'settings', name: 'Settings', enabled: true, order: 10 }
      ]);
      db.prepare('UPDATE settings SET tab_configuration = ? WHERE id = 1').run(defaultTabConfig);
      console.log('✓ Default tab configuration set');
    } else {
      console.log('✓ Tab configuration already exists');
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

  // Sanitize settings: convert booleans to integers and undefined to null
  const sanitized = {};
  for (const [key, value] of Object.entries(settings)) {
    if (typeof value === 'boolean') {
      sanitized[key] = value ? 1 : 0;
    } else if (value === undefined) {
      sanitized[key] = null;
    } else {
      sanitized[key] = value;
    }
  }

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
      smtp_host = @smtp_host,
      smtp_port = @smtp_port,
      smtp_secure = @smtp_secure,
      smtp_user = @smtp_user,
      smtp_password = @smtp_password,
      smtp_from_name = @smtp_from_name,
      smtp_from_email = @smtp_from_email,
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
      tab_configuration = @tab_configuration,
      stripe_secret_key = @stripe_secret_key,
      stripe_publishable_key = @stripe_publishable_key,
      stripe_enabled = @stripe_enabled,
      use_sql_server = @use_sql_server,
      sql_server_type = @sql_server_type,
      sql_server_host = @sql_server_host,
      sql_server_port = @sql_server_port,
      sql_server_database = @sql_server_database,
      sql_server_username = @sql_server_username,
      sql_server_password = @sql_server_password,
      sql_server_ssl = @sql_server_ssl,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `);
  return stmt.run(sanitized);
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
    INSERT INTO invoices (invoice_number, client_id, date, due_date, status, subtotal, tax,
      discount_type, discount_value, discount_amount, shipping, adjustment, adjustment_label,
      total, notes, payment_terms)
    VALUES (@invoice_number, @client_id, @date, @due_date, @status, @subtotal, @tax,
      @discount_type, @discount_value, @discount_amount, @shipping, @adjustment, @adjustment_label,
      @total, @notes, @payment_terms)
  `);

  const itemStmt = db.prepare(`
    INSERT INTO invoice_items (invoice_id, description, quantity, rate, discount_type, discount_value, discount_amount, amount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((invoice, items) => {
    const result = invoiceStmt.run(invoice);
    const invoiceId = result.lastInsertRowid;

    for (const item of items) {
      itemStmt.run(
        invoiceId,
        item.description,
        item.quantity,
        item.rate,
        item.discount_type || 'none',
        item.discount_value || 0,
        item.discount_amount || 0,
        item.amount
      );
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
      discount_type = @discount_type,
      discount_value = @discount_value,
      discount_amount = @discount_amount,
      shipping = @shipping,
      adjustment = @adjustment,
      adjustment_label = @adjustment_label,
      total = @total,
      notes = @notes,
      payment_terms = @payment_terms,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  const deleteItemsStmt = db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?');
  const itemStmt = db.prepare(`
    INSERT INTO invoice_items (invoice_id, description, quantity, rate, discount_type, discount_value, discount_amount, amount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((id, invoice, items) => {
    invoiceStmt.run({ ...invoice, id });
    deleteItemsStmt.run(id);

    for (const item of items) {
      itemStmt.run(
        id,
        item.description,
        item.quantity,
        item.rate,
        item.discount_type || 'none',
        item.discount_value || 0,
        item.discount_amount || 0,
        item.amount
      );
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

// Payment operations
const createPayment = (payment) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO payments (invoice_id, amount, payment_date, payment_method, reference_number, notes)
    VALUES (@invoice_id, @amount, @payment_date, @payment_method, @reference_number, @notes)
  `);

  const result = stmt.run(payment);

  // Update invoice status based on total payments
  updateInvoiceStatusAfterPayment(payment.invoice_id);

  return result;
};

const getPaymentsByInvoice = (invoiceId) => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC').all(invoiceId);
};

const deletePayment = (id) => {
  const db = getDatabase();

  // Get the invoice_id before deleting
  const payment = db.prepare('SELECT invoice_id FROM payments WHERE id = ?').get(id);

  const result = db.prepare('DELETE FROM payments WHERE id = ?').run(id);

  // Update invoice status after deleting payment
  if (payment) {
    updateInvoiceStatusAfterPayment(payment.invoice_id);
  }

  return result;
};

const updateInvoiceStatusAfterPayment = (invoiceId) => {
  const db = getDatabase();

  // Get invoice total and sum of payments
  const invoice = db.prepare('SELECT total FROM invoices WHERE id = ?').get(invoiceId);
  const paymentsSum = db.prepare('SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE invoice_id = ?').get(invoiceId);

  if (!invoice) return;

  const totalPaid = paymentsSum.total_paid || 0;
  const invoiceTotal = invoice.total || 0;

  let newStatus = 'pending';

  if (totalPaid >= invoiceTotal && totalPaid > 0) {
    newStatus = 'paid';
  } else if (totalPaid > 0 && totalPaid < invoiceTotal) {
    newStatus = 'partial';
  }

  // Update the invoice status
  db.prepare('UPDATE invoices SET status = ? WHERE id = ?').run(newStatus, invoiceId);
};

// Recurring invoice operations
const createRecurringInvoice = (recurringInvoice, items) => {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO recurring_invoices (client_id, frequency, start_date, end_date, next_generation,
      template_name, subtotal, tax, total, notes, payment_terms, active)
    VALUES (@client_id, @frequency, @start_date, @end_date, @next_generation,
      @template_name, @subtotal, @tax, @total, @notes, @payment_terms, @active)
  `);

  const result = stmt.run(recurringInvoice);
  const recurringInvoiceId = result.lastInsertRowid;

  // Insert items
  const itemStmt = db.prepare(`
    INSERT INTO recurring_invoice_items (recurring_invoice_id, description, quantity, rate, amount)
    VALUES (?, ?, ?, ?, ?)
  `);

  items.forEach(item => {
    itemStmt.run(recurringInvoiceId, item.description, item.quantity, item.rate, item.amount);
  });

  return result;
};

const getAllRecurringInvoices = () => {
  const db = getDatabase();
  return db.prepare(`
    SELECT r.*, c.name as client_name, c.email as client_email
    FROM recurring_invoices r
    LEFT JOIN clients c ON r.client_id = c.id
    ORDER BY r.active DESC, r.next_generation ASC
  `).all();
};

const getRecurringInvoice = (id) => {
  const db = getDatabase();
  const recurringInvoice = db.prepare(`
    SELECT r.*, c.name as client_name, c.email as client_email, c.phone as client_phone,
           c.address as client_address, c.city as client_city, c.state as client_state, c.zip as client_zip
    FROM recurring_invoices r
    LEFT JOIN clients c ON r.client_id = c.id
    WHERE r.id = ?
  `).get(id);

  if (recurringInvoice) {
    recurringInvoice.items = db.prepare('SELECT * FROM recurring_invoice_items WHERE recurring_invoice_id = ?').all(id);
  }

  return recurringInvoice;
};

const updateRecurringInvoice = (id, recurringInvoice, items) => {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE recurring_invoices SET
      client_id = @client_id,
      frequency = @frequency,
      start_date = @start_date,
      end_date = @end_date,
      next_generation = @next_generation,
      template_name = @template_name,
      subtotal = @subtotal,
      tax = @tax,
      total = @total,
      notes = @notes,
      payment_terms = @payment_terms,
      active = @active,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  const result = stmt.run({ ...recurringInvoice, id });

  // Delete existing items and insert new ones
  db.prepare('DELETE FROM recurring_invoice_items WHERE recurring_invoice_id = ?').run(id);

  const itemStmt = db.prepare(`
    INSERT INTO recurring_invoice_items (recurring_invoice_id, description, quantity, rate, amount)
    VALUES (?, ?, ?, ?, ?)
  `);

  items.forEach(item => {
    itemStmt.run(id, item.description, item.quantity, item.rate, item.amount);
  });

  return result;
};

const deleteRecurringInvoice = (id) => {
  const db = getDatabase();
  return db.prepare('DELETE FROM recurring_invoices WHERE id = ?').run(id);
};

const generateInvoiceFromRecurring = (recurringInvoiceId) => {
  const db = getDatabase();

  // Get the recurring invoice
  const recurring = getRecurringInvoice(recurringInvoiceId);
  if (!recurring || !recurring.active) return null;

  // Generate new invoice number
  const invoiceNumber = generateInvoiceNumber();

  // Calculate next generation date based on frequency
  const today = new Date();
  const nextDate = new Date(recurring.next_generation);

  let futureDate = new Date(nextDate);
  switch (recurring.frequency) {
    case 'weekly':
      futureDate.setDate(futureDate.getDate() + 7);
      break;
    case 'biweekly':
      futureDate.setDate(futureDate.getDate() + 14);
      break;
    case 'monthly':
      futureDate.setMonth(futureDate.getMonth() + 1);
      break;
    case 'quarterly':
      futureDate.setMonth(futureDate.getMonth() + 3);
      break;
    case 'yearly':
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      break;
  }

  // Calculate due date (30 days from today)
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 30);

  // Create the invoice
  const invoice = {
    invoice_number: invoiceNumber,
    client_id: recurring.client_id,
    date: today.toISOString().split('T')[0],
    due_date: dueDate.toISOString().split('T')[0],
    status: 'pending',
    subtotal: recurring.subtotal,
    tax: recurring.tax,
    total: recurring.total,
    notes: recurring.notes,
    payment_terms: recurring.payment_terms,
    archived: 0
  };

  const result = createInvoice(invoice, recurring.items);

  // Update recurring invoice
  db.prepare(`
    UPDATE recurring_invoices SET
      last_generated = ?,
      next_generation = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(today.toISOString().split('T')[0], futureDate.toISOString().split('T')[0], recurringInvoiceId);

  return result;
};

// Estimate operations
const generateEstimateNumber = () => {
  const db = getDatabase();
  const settings = getSettings();
  const prefix = settings.quote_prefix || 'EST-';

  const lastEstimate = db.prepare('SELECT estimate_number FROM estimates ORDER BY id DESC LIMIT 1').get();

  if (!lastEstimate) {
    return `${prefix}0001`;
  }

  const lastNumber = parseInt(lastEstimate.estimate_number.replace(prefix, ''));
  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');

  return `${prefix}${nextNumber}`;
};

const createEstimate = (estimate, items) => {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO estimates (estimate_number, client_id, date, expiry_date, status, subtotal, tax, total, notes, terms)
    VALUES (@estimate_number, @client_id, @date, @expiry_date, @status, @subtotal, @tax, @total, @notes, @terms)
  `);

  const result = stmt.run(estimate);
  const estimateId = result.lastInsertRowid;

  // Insert items
  const itemStmt = db.prepare(`
    INSERT INTO estimate_items (estimate_id, description, quantity, rate, amount)
    VALUES (?, ?, ?, ?, ?)
  `);

  items.forEach(item => {
    itemStmt.run(estimateId, item.description, item.quantity, item.rate, item.amount);
  });

  return result;
};

const getAllEstimates = () => {
  const db = getDatabase();
  return db.prepare(`
    SELECT e.*, c.name as client_name, c.email as client_email
    FROM estimates e
    LEFT JOIN clients c ON e.client_id = c.id
    WHERE e.archived = 0
    ORDER BY e.created_at DESC
  `).all();
};

const getArchivedEstimates = () => {
  const db = getDatabase();
  return db.prepare(`
    SELECT e.*, c.name as client_name, c.email as client_email
    FROM estimates e
    LEFT JOIN clients c ON e.client_id = c.id
    WHERE e.archived = 1
    ORDER BY e.created_at DESC
  `).all();
};

const getEstimate = (id) => {
  const db = getDatabase();
  const estimate = db.prepare(`
    SELECT e.*, c.name as client_name, c.email as client_email, c.phone as client_phone,
           c.address as client_address, c.city as client_city, c.state as client_state, c.zip as client_zip
    FROM estimates e
    LEFT JOIN clients c ON e.client_id = c.id
    WHERE e.id = ?
  `).get(id);

  if (estimate) {
    estimate.items = db.prepare('SELECT * FROM estimate_items WHERE estimate_id = ?').all(id);
  }

  return estimate;
};

const updateEstimate = (id, estimate, items) => {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE estimates SET
      client_id = @client_id,
      date = @date,
      expiry_date = @expiry_date,
      status = @status,
      subtotal = @subtotal,
      tax = @tax,
      total = @total,
      notes = @notes,
      terms = @terms,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  const result = stmt.run({ ...estimate, id });

  // Delete existing items and insert new ones
  db.prepare('DELETE FROM estimate_items WHERE estimate_id = ?').run(id);

  const itemStmt = db.prepare(`
    INSERT INTO estimate_items (estimate_id, description, quantity, rate, amount)
    VALUES (?, ?, ?, ?, ?)
  `);

  items.forEach(item => {
    itemStmt.run(id, item.description, item.quantity, item.rate, item.amount);
  });

  return result;
};

const deleteEstimate = (id) => {
  const db = getDatabase();
  return db.prepare('DELETE FROM estimates WHERE id = ?').run(id);
};

const archiveEstimate = (id) => {
  const db = getDatabase();
  return db.prepare('UPDATE estimates SET archived = 1 WHERE id = ?').run(id);
};

const restoreEstimate = (id) => {
  const db = getDatabase();
  return db.prepare('UPDATE estimates SET archived = 0 WHERE id = ?').run(id);
};

const convertEstimateToInvoice = (estimateId) => {
  const db = getDatabase();

  // Get the estimate
  const estimate = getEstimate(estimateId);
  if (!estimate) return null;

  // Generate new invoice number
  const invoiceNumber = generateInvoiceNumber();

  // Create the invoice from estimate
  const invoice = {
    invoice_number: invoiceNumber,
    client_id: estimate.client_id,
    date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    status: 'pending',
    subtotal: estimate.subtotal,
    tax: estimate.tax,
    discount_type: estimate.discount_type || null,
    discount_value: estimate.discount_value || 0,
    discount_amount: estimate.discount_amount || 0,
    shipping: estimate.shipping || 0,
    adjustment: estimate.adjustment || 0,
    adjustment_label: estimate.adjustment_label || null,
    total: estimate.total,
    notes: estimate.notes,
    payment_terms: estimate.terms,
    archived: 0
  };

  const result = createInvoice(invoice, estimate.items);
  const invoiceId = result.lastInsertRowid;

  // Update estimate to mark as converted
  db.prepare(`
    UPDATE estimates SET
      status = 'converted',
      converted_to_invoice_id = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(invoiceId, estimateId);

  return { invoiceId, invoiceNumber };
};

// Credit Note operations
const generateCreditNoteNumber = () => {
  const db = getDatabase();
  const prefix = 'CN-';

  const lastCreditNote = db.prepare('SELECT credit_note_number FROM credit_notes ORDER BY id DESC LIMIT 1').get();

  if (!lastCreditNote) {
    return `${prefix}0001`;
  }

  const lastNumber = parseInt(lastCreditNote.credit_note_number.replace(prefix, ''));
  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `${prefix}${nextNumber}`;
};

const createCreditNote = (creditNote, items) => {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO credit_notes (credit_note_number, invoice_id, client_id, date, reason, subtotal, tax, total, status, notes)
    VALUES (@credit_note_number, @invoice_id, @client_id, @date, @reason, @subtotal, @tax, @total, @status, @notes)
  `);

  const result = stmt.run(creditNote);
  const creditNoteId = result.lastInsertRowid;

  // Insert items
  const itemStmt = db.prepare(`
    INSERT INTO credit_note_items (credit_note_id, description, quantity, rate, amount)
    VALUES (?, ?, ?, ?, ?)
  `);

  items.forEach(item => {
    itemStmt.run(creditNoteId, item.description, item.quantity, item.rate, item.amount);
  });

  return result;
};

const getAllCreditNotes = () => {
  const db = getDatabase();
  return db.prepare(`
    SELECT cn.*, c.name as client_name, c.email as client_email, i.invoice_number
    FROM credit_notes cn
    LEFT JOIN clients c ON cn.client_id = c.id
    LEFT JOIN invoices i ON cn.invoice_id = i.id
    WHERE cn.archived = 0
    ORDER BY cn.created_at DESC
  `).all();
};

const getCreditNote = (id) => {
  const db = getDatabase();
  const creditNote = db.prepare(`
    SELECT cn.*, c.name as client_name, c.email as client_email, c.phone as client_phone,
           c.address as client_address, c.city as client_city, c.state as client_state, c.zip as client_zip,
           i.invoice_number
    FROM credit_notes cn
    LEFT JOIN clients c ON cn.client_id = c.id
    LEFT JOIN invoices i ON cn.invoice_id = i.id
    WHERE cn.id = ?
  `).get(id);

  if (creditNote) {
    creditNote.items = db.prepare('SELECT * FROM credit_note_items WHERE credit_note_id = ?').all(id);
  }

  return creditNote;
};

const getCreditNotesByInvoice = (invoiceId) => {
  const db = getDatabase();
  return db.prepare(`
    SELECT cn.*, c.name as client_name
    FROM credit_notes cn
    LEFT JOIN clients c ON cn.client_id = c.id
    WHERE cn.invoice_id = ? AND cn.archived = 0
    ORDER BY cn.created_at DESC
  `).all(invoiceId);
};

const updateCreditNote = (id, creditNote, items) => {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE credit_notes SET
      date = @date,
      reason = @reason,
      subtotal = @subtotal,
      tax = @tax,
      total = @total,
      status = @status,
      notes = @notes,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  const result = stmt.run({ ...creditNote, id });

  // Delete existing items and insert new ones
  db.prepare('DELETE FROM credit_note_items WHERE credit_note_id = ?').run(id);

  const itemStmt = db.prepare(`
    INSERT INTO credit_note_items (credit_note_id, description, quantity, rate, amount)
    VALUES (?, ?, ?, ?, ?)
  `);

  items.forEach(item => {
    itemStmt.run(id, item.description, item.quantity, item.rate, item.amount);
  });

  return result;
};

const deleteCreditNote = (id) => {
  const db = getDatabase();
  return db.prepare('DELETE FROM credit_notes WHERE id = ?').run(id);
};

const archiveCreditNote = (id) => {
  const db = getDatabase();
  return db.prepare('UPDATE credit_notes SET archived = 1 WHERE id = ?').run(id);
};

// Reminder Template operations
const getAllReminderTemplates = () => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM reminder_templates ORDER BY days_before_due DESC').all();
};

const getReminderTemplate = (id) => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM reminder_templates WHERE id = ?').get(id);
};

const createReminderTemplate = (template) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO reminder_templates (name, subject, body, days_before_due, active)
    VALUES (@name, @subject, @body, @days_before_due, @active)
  `);
  return stmt.run(template);
};

const updateReminderTemplate = (id, template) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE reminder_templates SET
      name = @name,
      subject = @subject,
      body = @body,
      days_before_due = @days_before_due,
      active = @active,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);
  return stmt.run({ ...template, id });
};

const deleteReminderTemplate = (id) => {
  const db = getDatabase();
  return db.prepare('DELETE FROM reminder_templates WHERE id = ?').run(id);
};

// Invoice Reminder operations
const createInvoiceReminder = (reminder) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO invoice_reminders (invoice_id, template_id, sent_date, reminder_type, days_overdue, status, notes)
    VALUES (@invoice_id, @template_id, @sent_date, @reminder_type, @days_overdue, @status, @notes)
  `);
  return stmt.run(reminder);
};

const getInvoiceReminders = (invoiceId) => {
  const db = getDatabase();
  return db.prepare(`
    SELECT ir.*, rt.name as template_name
    FROM invoice_reminders ir
    LEFT JOIN reminder_templates rt ON ir.template_id = rt.id
    WHERE ir.invoice_id = ?
    ORDER BY ir.sent_date DESC
  `).all(invoiceId);
};

const getAllInvoiceReminders = () => {
  const db = getDatabase();
  return db.prepare(`
    SELECT ir.*, i.invoice_number, c.name as client_name, rt.name as template_name
    FROM invoice_reminders ir
    LEFT JOIN invoices i ON ir.invoice_id = i.id
    LEFT JOIN clients c ON i.client_id = c.id
    LEFT JOIN reminder_templates rt ON ir.template_id = rt.id
    ORDER BY ir.sent_date DESC
  `).all();
};

const deleteInvoiceReminder = (id) => {
  const db = getDatabase();
  return db.prepare('DELETE FROM invoice_reminders WHERE id = ?').run(id);
};

// Get invoices that need reminders
const getInvoicesNeedingReminders = () => {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];

  return db.prepare(`
    SELECT i.*, c.name as client_name, c.email as client_email
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    WHERE i.status IN ('pending', 'overdue', 'partial')
      AND i.archived = 0
      AND (
        (i.status = 'overdue' AND date(i.due_date) < date(?))
        OR (i.status = 'pending' AND date(i.due_date) <= date(?, '+3 days'))
      )
    ORDER BY i.due_date ASC
  `).all(today, today);
};

// Batch operations for invoices
const batchUpdateInvoiceStatus = (invoiceIds, status) => {
  const db = getDatabase();
  const placeholders = invoiceIds.map(() => '?').join(',');
  const stmt = db.prepare(`
    UPDATE invoices SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id IN (${placeholders})
  `);
  return stmt.run(status, ...invoiceIds);
};

const batchArchiveInvoices = (invoiceIds) => {
  const db = getDatabase();
  const placeholders = invoiceIds.map(() => '?').join(',');
  const stmt = db.prepare(`
    UPDATE invoices SET archived = 1, updated_at = CURRENT_TIMESTAMP
    WHERE id IN (${placeholders})
  `);
  return stmt.run(...invoiceIds);
};

const batchDeleteInvoices = (invoiceIds) => {
  const db = getDatabase();
  const placeholders = invoiceIds.map(() => '?').join(',');
  const stmt = db.prepare(`DELETE FROM invoices WHERE id IN (${placeholders})`);
  return stmt.run(...invoiceIds);
};

// ==================== User Management ====================

const getAllUsers = () => {
  const db = getDatabase();
  return db.prepare('SELECT id, username, email, full_name, role, active, created_at, last_login FROM users ORDER BY created_at DESC').all();
};

const getUser = (id) => {
  const db = getDatabase();
  return db.prepare('SELECT id, username, email, full_name, role, active, created_at, last_login FROM users WHERE id = ?').get(id);
};

const getUserByUsername = (username) => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
};

const getUserByEmail = (email) => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
};

const createUser = ({ username, email, password_hash, full_name, role, created_by }) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO users (username, email, password_hash, full_name, role, created_by)
    VALUES (@username, @email, @password_hash, @full_name, @role, @created_by)
  `);
  const result = stmt.run({ username, email, password_hash, full_name, role, created_by });
  return result.lastInsertRowid;
};

const updateUser = (id, { email, full_name, role, active }) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE users
    SET email = @email,
        full_name = @full_name,
        role = @role,
        active = @active
    WHERE id = @id
  `);
  return stmt.run({ id, email, full_name, role, active });
};

const updateUserPassword = (id, password_hash) => {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
  return stmt.run(password_hash, id);
};

const updateUserLastLogin = (id) => {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
  return stmt.run(id);
};

const deleteUser = (id) => {
  const db = getDatabase();
  // Don't allow deleting user ID 1 (admin)
  if (id === 1) {
    throw new Error('Cannot delete the default admin user');
  }
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  return stmt.run(id);
};

// ==================== Session Management ====================

const createSession = ({ user_id, token, expires_at, ip_address, user_agent }) => {
  const db = getDatabase();
  const id = require('crypto').randomBytes(16).toString('hex');
  const stmt = db.prepare(`
    INSERT INTO sessions (id, user_id, token, expires_at, ip_address, user_agent)
    VALUES (@id, @user_id, @token, @expires_at, @ip_address, @user_agent)
  `);
  stmt.run({ id, user_id, token, expires_at, ip_address, user_agent });
  return id;
};

const getSessionByToken = (token) => {
  const db = getDatabase();
  return db.prepare(`
    SELECT s.*, u.username, u.email, u.full_name, u.role, u.active
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).get(token);
};

const deleteSession = (token) => {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
  return stmt.run(token);
};

const deleteExpiredSessions = () => {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')");
  return stmt.run();
};

const deleteUserSessions = (user_id) => {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM sessions WHERE user_id = ?');
  return stmt.run(user_id);
};

// ==================== Audit Log ====================

const createAuditLog = ({ user_id, username, action, resource_type, resource_id, details, ip_address }) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO audit_log (user_id, username, action, resource_type, resource_id, details, ip_address)
    VALUES (@user_id, @username, @action, @resource_type, @resource_id, @details, @ip_address)
  `);
  return stmt.run({ user_id, username, action, resource_type, resource_id, details, ip_address });
};

const getAuditLogs = (limit = 100, offset = 0) => {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM audit_log
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);
};

const getAuditLogsByUser = (user_id, limit = 100) => {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM audit_log
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(user_id, limit);
};

const getAuditLogsByResource = (resource_type, resource_id) => {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM audit_log
    WHERE resource_type = ? AND resource_id = ?
    ORDER BY created_at DESC
  `).all(resource_type, resource_id);
};

// ==================== SQL Server Support ====================

let sqlServerAdapter = null;

/**
 * Check if SQL Server is enabled and return the adapter
 * Always reads settings from SQLite to determine if SQL Server should be used
 */
const getSqlServerAdapter = () => {
  const settings = getSettings();

  if (!settings.use_sql_server) {
    sqlServerAdapter = null;
    return null;
  }

  // Create or reuse SQL Server adapter
  if (!sqlServerAdapter) {
    const SQLServerAdapter = require('./sqlServerAdapter');
    sqlServerAdapter = new SQLServerAdapter({
      type: settings.sql_server_type || 'mssql',
      host: settings.sql_server_host || 'localhost',
      port: settings.sql_server_port || '1433',
      database: settings.sql_server_database || 'invoicepro',
      username: settings.sql_server_username || '',
      password: settings.sql_server_password || '',
      ssl: !!settings.sql_server_ssl
    });
  }

  return sqlServerAdapter;
};

/**
 * Reset SQL Server adapter (call when settings change)
 */
const resetSqlServerAdapter = () => {
  if (sqlServerAdapter) {
    sqlServerAdapter.disconnect().catch(() => {});
    sqlServerAdapter = null;
  }
};

/**
 * Check if using SQL Server
 */
const isUsingSqlServer = () => {
  const settings = getSettings();
  return !!settings.use_sql_server;
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
  getDashboardStats,
  // Payments
  createPayment,
  getPaymentsByInvoice,
  deletePayment,
  updateInvoiceStatusAfterPayment,
  // Recurring Invoices
  createRecurringInvoice,
  getAllRecurringInvoices,
  getRecurringInvoice,
  updateRecurringInvoice,
  deleteRecurringInvoice,
  generateInvoiceFromRecurring,
  // Estimates
  generateEstimateNumber,
  createEstimate,
  getAllEstimates,
  getArchivedEstimates,
  getEstimate,
  updateEstimate,
  deleteEstimate,
  archiveEstimate,
  restoreEstimate,
  convertEstimateToInvoice,
  // Credit Notes
  generateCreditNoteNumber,
  createCreditNote,
  getAllCreditNotes,
  getCreditNote,
  getCreditNotesByInvoice,
  updateCreditNote,
  deleteCreditNote,
  archiveCreditNote,
  // Reminder Templates
  getAllReminderTemplates,
  getReminderTemplate,
  createReminderTemplate,
  updateReminderTemplate,
  deleteReminderTemplate,
  // Invoice Reminders
  createInvoiceReminder,
  getInvoiceReminders,
  getAllInvoiceReminders,
  deleteInvoiceReminder,
  getInvoicesNeedingReminders,
  // Batch Operations
  batchUpdateInvoiceStatus,
  batchArchiveInvoices,
  batchDeleteInvoices,
  // User Management
  getAllUsers,
  getUser,
  getUserByUsername,
  getUserByEmail,
  createUser,
  updateUser,
  updateUserPassword,
  updateUserLastLogin,
  deleteUser,
  // Session Management
  createSession,
  getSessionByToken,
  deleteSession,
  deleteExpiredSessions,
  deleteUserSessions,
  // Audit Log
  createAuditLog,
  getAuditLogs,
  getAuditLogsByUser,
  getAuditLogsByResource,
  // SQL Server Support
  getSqlServerAdapter,
  resetSqlServerAdapter,
  isUsingSqlServer
};
