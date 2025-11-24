const mysql = require('mysql2/promise');
const { Client: PgClient } = require('pg');
const { Connection: MsSqlConnection, Request: MsSqlRequest } = require('tedious');
const fs = require('fs');
const path = require('path');

/**
 * SQL Server Adapter
 * Supports MySQL, PostgreSQL, and MS SQL Server
 */
class SQLServerAdapter {
  constructor(config) {
    this.config = config;
    this.connection = null;
    this.type = config.type; // 'mysql', 'postgres', 'mssql'
  }

  /**
   * Test connection to SQL server
   */
  async testConnection() {
    try {
      await this.connect();
      await this.disconnect();
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Connect to SQL server
   */
  async connect() {
    if (this.connection) {
      return this.connection;
    }

    try {
      if (this.type === 'mysql') {
        this.connection = await mysql.createConnection({
          host: this.config.host,
          port: parseInt(this.config.port) || 3306,
          user: this.config.username,
          password: this.config.password,
          database: this.config.database,
          ssl: this.config.ssl ? {} : false
        });
      } else if (this.type === 'postgres') {
        this.connection = new PgClient({
          host: this.config.host,
          port: parseInt(this.config.port) || 5432,
          user: this.config.username,
          password: this.config.password,
          database: this.config.database,
          ssl: this.config.ssl ? { rejectUnauthorized: false } : false
        });
        await this.connection.connect();
      } else if (this.type === 'mssql') {
        return new Promise((resolve, reject) => {
          // Use 'master' database if no database specified (needed for creating databases)
          const targetDatabase = this.config.database || 'master';

          const config = {
            server: this.config.host,
            authentication: {
              type: 'default',
              options: {
                userName: this.config.username,
                password: this.config.password
              }
            },
            options: {
              database: targetDatabase,
              port: parseInt(this.config.port) || 1433,
              encrypt: !!this.config.ssl,
              trustServerCertificate: true, // Always trust for local/internal servers
              connectTimeout: 30000, // 30 second timeout
              requestTimeout: 30000,
              rowCollectionOnDone: true,
              useColumnNames: true
            }
          };

          console.log(`MSSQL connecting to ${this.config.host}:${config.options.port}, database: ${targetDatabase}`);

          this.connection = new MsSqlConnection(config);

          this.connection.on('connect', (err) => {
            if (err) {
              console.error('MSSQL connection error:', err);
              reject(err);
            } else {
              console.log('MSSQL connected successfully');
              resolve(this.connection);
            }
          });

          this.connection.on('error', (err) => {
            console.error('MSSQL error event:', err);
          });

          this.connection.connect();
        });
      }

      return this.connection;
    } catch (error) {
      console.error('Error connecting to SQL server:', error);
      throw error;
    }
  }

  /**
   * Disconnect from SQL server
   */
  async disconnect() {
    if (!this.connection) {
      return;
    }

    try {
      if (this.type === 'mysql') {
        await this.connection.end();
      } else if (this.type === 'postgres') {
        await this.connection.end();
      } else if (this.type === 'mssql') {
        this.connection.close();
      }
      this.connection = null;
    } catch (error) {
      console.error('Error disconnecting from SQL server:', error);
    }
  }

  /**
   * Check if database exists
   */
  async databaseExists() {
    try {
      const tempConfig = { ...this.config };

      // For MSSQL, connect to 'master' database to check if target database exists
      if (this.type === 'mssql') {
        tempConfig.database = 'master';
      } else {
        delete tempConfig.database;
      }

      // Explicitly ensure type is set
      tempConfig.type = this.type;

      console.log(`Checking if database "${this.config.database}" exists (type: ${this.type})...`);

      const tempAdapter = new SQLServerAdapter(tempConfig);
      await tempAdapter.connect();

      let exists = false;

      if (this.type === 'mysql') {
        const [rows] = await tempAdapter.connection.query(
          'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
          [this.config.database]
        );
        exists = rows.length > 0;
      } else if (this.type === 'postgres') {
        const result = await tempAdapter.connection.query(
          'SELECT 1 FROM pg_database WHERE datname = $1',
          [this.config.database]
        );
        exists = result.rows.length > 0;
      } else if (this.type === 'mssql') {
        exists = await new Promise((resolve, reject) => {
          const request = new MsSqlRequest(
            `SELECT name FROM sys.databases WHERE name = '${this.config.database}'`,
            (err, rowCount) => {
              if (err) {
                console.error('Error checking database:', err);
                reject(err);
              } else {
                console.log(`Database check result: ${rowCount} rows found`);
                resolve(rowCount > 0);
              }
            }
          );
          tempAdapter.connection.execSql(request);
        });
      }

      await tempAdapter.disconnect();
      console.log(`Database "${this.config.database}" exists: ${exists}`);
      return exists;
    } catch (error) {
      console.error('Error checking if database exists:', error);
      throw error; // Re-throw so caller knows it failed
    }
  }

  /**
   * Create database
   */
  async createDatabase() {
    try {
      const tempConfig = { ...this.config };

      // For MSSQL, connect to 'master' database to create new databases
      if (this.type === 'mssql') {
        tempConfig.database = 'master';
      } else {
        delete tempConfig.database;
      }

      // Explicitly ensure type is set
      tempConfig.type = this.type;

      console.log(`Creating database "${this.config.database}" (type: ${this.type})...`);

      const tempAdapter = new SQLServerAdapter(tempConfig);
      await tempAdapter.connect();

      if (this.type === 'mysql') {
        await tempAdapter.connection.query(
          `CREATE DATABASE IF NOT EXISTS \`${this.config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );
      } else if (this.type === 'postgres') {
        // PostgreSQL doesn't support IF NOT EXISTS before version 9.1
        try {
          await tempAdapter.connection.query(`CREATE DATABASE "${this.config.database}"`);
        } catch (error) {
          if (!error.message.includes('already exists')) {
            throw error;
          }
        }
      } else if (this.type === 'mssql') {
        await new Promise((resolve, reject) => {
          const sql = `IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '${this.config.database}') CREATE DATABASE [${this.config.database}]`;
          console.log('Executing SQL:', sql);

          const request = new MsSqlRequest(sql, (err) => {
            if (err) {
              console.error('Error creating database:', err);
              reject(err);
            } else {
              console.log('Database CREATE command completed');
              resolve();
            }
          });
          tempAdapter.connection.execSql(request);
        });

        // Wait for database to be ready (MSSQL needs time to initialize the database)
        console.log('Waiting for database to be ready...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      await tempAdapter.disconnect();
      console.log(`Database "${this.config.database}" created successfully`);
      return { success: true, message: 'Database created successfully' };
    } catch (error) {
      console.error('Error creating database:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Execute SQL query
   */
  async query(sql, params = []) {
    await this.connect();

    try {
      if (this.type === 'mysql') {
        const [rows] = await this.connection.query(sql, params);
        return rows;
      } else if (this.type === 'postgres') {
        const result = await this.connection.query(sql, params);
        return result.rows;
      } else if (this.type === 'mssql') {
        return new Promise((resolve, reject) => {
          const rows = [];
          const request = new MsSqlRequest(sql, (err) => {
            if (err) reject(err);
            else resolve(rows);
          });

          request.on('row', (columns) => {
            const row = {};
            columns.forEach(column => {
              row[column.metadata.colName] = column.value;
            });
            rows.push(row);
          });

          this.connection.execSql(request);
        });
      }
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  /**
   * Create all tables from schema
   */
  async createSchema() {
    try {
      console.log(`Creating schema in database "${this.config.database}" (type: ${this.type})...`);

      await this.connect();
      console.log('Connected to database for schema creation');

      // Read SQLite schema and convert to SQL server schema
      const schemaPath = path.join(__dirname, 'schema.sql');
      let schema = fs.readFileSync(schemaPath, 'utf8');

      // Remove single-line comments BEFORE splitting (they cause issues when attached to statements)
      schema = schema.replace(/--.*$/gm, '');

      // Convert SQLite schema to target SQL server schema
      schema = this.convertSchema(schema);

      // Split into individual statements
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      console.log(`Found ${statements.length} SQL statements to execute`);

      let successCount = 0;
      let errorCount = 0;

      // Execute each statement
      for (const statement of statements) {
        if (statement.length > 0) {
          try {
            await this.query(statement);
            successCount++;
            console.log('Executed:', statement.substring(0, 80) + '...');
          } catch (error) {
            errorCount++;
            console.error('Error executing statement:', statement.substring(0, 80));
            console.error('Error:', error.message);
            // Continue with next statement
          }
        }
      }

      console.log(`Schema creation complete: ${successCount} succeeded, ${errorCount} failed`);
      await this.disconnect();

      return { success: true, message: `Schema created: ${successCount} statements executed` };
    } catch (error) {
      console.error('Error creating schema:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Convert SQLite schema to target SQL server schema
   */
  convertSchema(sqliteSchema) {
    let schema = sqliteSchema;

    if (this.type === 'mysql') {
      // Convert SQLite to MySQL
      schema = schema.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'INT AUTO_INCREMENT PRIMARY KEY');
      schema = schema.replace(/TEXT/g, 'VARCHAR(255)');
      schema = schema.replace(/REAL/g, 'DECIMAL(10,2)');
      schema = schema.replace(/CURRENT_TIMESTAMP/g, 'CURRENT_TIMESTAMP()');
      schema = schema.replace(/IF NOT EXISTS/g, ''); // MySQL CREATE TABLE IF NOT EXISTS is supported
      schema = schema.replace(/CREATE TABLE /g, 'CREATE TABLE IF NOT EXISTS ');
    } else if (this.type === 'postgres') {
      // Convert SQLite to PostgreSQL
      schema = schema.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY');
      schema = schema.replace(/AUTOINCREMENT/g, '');
      schema = schema.replace(/INTEGER/g, 'INT');
      schema = schema.replace(/REAL/g, 'DECIMAL(10,2)');
    } else if (this.type === 'mssql') {
      // Convert SQLite to MS SQL Server
      schema = schema.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'INT IDENTITY(1,1) PRIMARY KEY');
      schema = schema.replace(/AUTOINCREMENT/g, '');
      schema = schema.replace(/INTEGER/g, 'INT');
      schema = schema.replace(/REAL/g, 'DECIMAL(10,2)');

      // MSSQL: Use NVARCHAR(255) for most TEXT columns (can be indexed/unique)
      // Only use NVARCHAR(MAX) for large text fields like notes, body, details, address, etc.
      // First, convert all TEXT to NVARCHAR(255)
      schema = schema.replace(/TEXT/g, 'NVARCHAR(255)');

      // Then convert specific large text columns back to NVARCHAR(MAX)
      // These are columns that might contain large amounts of text
      // Note: email, customer_number, item_number must stay NVARCHAR(255) for indexing
      const largeTextColumns = [
        'notes', 'body', 'details', 'address', 'terms',
        'payment_terms', 'bank_details', 'logo_url', 'receipt_url',
        'user_agent', 'password_hash', 'tab_configuration',
        'email_subject_template', 'email_body_template', 'default_notes',
        'invoice_footer'
      ];
      for (const col of largeTextColumns) {
        // Match column definitions like: column_name NVARCHAR(255)
        const regex = new RegExp(`(${col}\\s+)NVARCHAR\\(255\\)`, 'gi');
        schema = schema.replace(regex, '$1NVARCHAR(MAX)');
      }

      // MSSQL doesn't support IF NOT EXISTS for CREATE TABLE - wrap in conditional
      // First remove any existing IF NOT EXISTS (from SQLite)
      schema = schema.replace(/IF NOT EXISTS\s*/gi, '');

      // Replace CREATE TABLE with IF NOT EXISTS wrapper using sysobjects
      schema = schema.replace(/CREATE TABLE\s+(\w+)\s*\(/gi, (match, tableName) => {
        return `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='${tableName}' AND xtype='U') CREATE TABLE ${tableName} (`;
      });

      // Remove ALL INSERT statements FIRST (including INSERT OR IGNORE)
      // They cause IDENTITY_INSERT issues and duplicate key errors
      schema = schema.replace(/INSERT\s+OR\s+IGNORE\s+INTO\s+\w+[\s\S]*?;/gi, '');
      schema = schema.replace(/INSERT\s+INTO\s+\w+[\s\S]*?;/gi, '');

      // Remove indexes on expenses table (table was removed from schema)
      schema = schema.replace(/CREATE\s+(?:UNIQUE\s+)?INDEX.*?ON\s+expenses\s*\([^)]+\).*?;/gi, '');

      // Remove indexes on columns that may be NVARCHAR(MAX) in existing databases
      // These will fail if the table already exists with wrong column types
      const problematicIndexes = [
        'idx_clients_email',
        'idx_clients_customer_number',
        'idx_saved_items_item_number'
      ];
      for (const idx of problematicIndexes) {
        const regex = new RegExp(`CREATE\\s+(?:UNIQUE\\s+)?INDEX.*?${idx}.*?;`, 'gi');
        schema = schema.replace(regex, '');
      }

      // MSSQL doesn't support UNIQUE INDEX with WHERE clause the same way
      // Convert partial unique indexes to regular indexes with IF NOT EXISTS
      schema = schema.replace(/CREATE UNIQUE INDEX\s+(\w+)\s+ON\s+(\w+)\((\w+)\)\s+WHERE\s+\w+\s+IS\s+NOT\s+NULL/gi,
        "IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='$1') CREATE INDEX $1 ON $2($3)");

      // Wrap regular CREATE INDEX with IF NOT EXISTS
      schema = schema.replace(/CREATE INDEX\s+(\w+)\s+ON\s+(\w+)\((\w+)\)/gi, (match, indexName, tableName, columnName) => {
        return `IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='${indexName}') CREATE INDEX ${indexName} ON ${tableName}(${columnName})`;
      });

      // MSSQL uses different default timestamp syntax
      schema = schema.replace(/DEFAULT CURRENT_TIMESTAMP/g, 'DEFAULT GETDATE()');
    }

    // Remove SQLite-specific pragmas
    schema = schema.replace(/PRAGMA.*/g, '');

    // Handle INSERT statements for non-MSSQL databases
    if (this.type === 'mysql') {
      schema = schema.replace(/INSERT OR IGNORE/g, 'INSERT IGNORE');
    } else if (this.type === 'postgres') {
      // For Postgres, just use INSERT (will fail on duplicates but that's ok)
      schema = schema.replace(/INSERT OR IGNORE/g, 'INSERT');
    }

    return schema;
  }

  // ==================== CRUD Operations ====================

  /**
   * Get all rows from a table
   */
  async getAll(table, orderBy = 'id') {
    await this.connect();
    return this.query(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
  }

  /**
   * Get a single row by ID
   */
  async getById(table, id) {
    await this.connect();
    const rows = await this.query(`SELECT * FROM ${table} WHERE id = ${id}`);
    return rows[0] || null;
  }

  /**
   * Insert a row into a table
   */
  async insert(table, data) {
    await this.connect();
    const columns = Object.keys(data).filter(k => data[k] !== undefined);
    const values = columns.map(k => {
      const v = data[k];
      if (v === null) return 'NULL';
      if (typeof v === 'number') return v;
      return `'${String(v).replace(/'/g, "''")}'`;
    });

    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')})`;
    await this.query(sql);

    // Get the last inserted ID
    const result = await this.query('SELECT SCOPE_IDENTITY() as id');
    return { lastInsertRowid: result[0]?.id || 0 };
  }

  /**
   * Update a row in a table
   */
  async update(table, id, data) {
    await this.connect();
    const updates = Object.keys(data)
      .filter(k => data[k] !== undefined && k !== 'id')
      .map(k => {
        const v = data[k];
        if (v === null) return `${k} = NULL`;
        if (typeof v === 'number') return `${k} = ${v}`;
        return `${k} = '${String(v).replace(/'/g, "''")}'`;
      });

    if (updates.length === 0) return { changes: 0 };

    const sql = `UPDATE ${table} SET ${updates.join(', ')} WHERE id = ${id}`;
    await this.query(sql);
    return { changes: 1 };
  }

  /**
   * Delete a row from a table
   */
  async delete(table, id) {
    await this.connect();
    await this.query(`DELETE FROM ${table} WHERE id = ${id}`);
    return { changes: 1 };
  }

  /**
   * Execute a custom query with parameters
   */
  async queryWithParams(sql, params = []) {
    await this.connect();
    // Simple parameter replacement (not ideal for production, but works for this use case)
    let processedSql = sql;
    params.forEach((param, index) => {
      const placeholder = `@p${index}`;
      const value = param === null ? 'NULL' :
                    typeof param === 'number' ? param :
                    `'${String(param).replace(/'/g, "''")}'`;
      processedSql = processedSql.replace('?', value);
    });
    return this.query(processedSql);
  }

  // ==================== Client Operations ====================

  async getAllClients() {
    return this.getAll('clients', 'name');
  }

  async getClient(id) {
    return this.getById('clients', id);
  }

  async createClient(client) {
    return this.insert('clients', client);
  }

  async updateClient(id, client) {
    return this.update('clients', id, client);
  }

  async deleteClient(id) {
    return this.delete('clients', id);
  }

  // ==================== Invoice Operations ====================

  async getAllInvoices() {
    await this.connect();
    return this.query(`
      SELECT i.*, c.name as client_name, c.email as client_email
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.archived = 0
      ORDER BY i.created_at DESC
    `);
  }

  async getArchivedInvoices() {
    await this.connect();
    return this.query(`
      SELECT i.*, c.name as client_name, c.email as client_email
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.archived = 1
      ORDER BY i.created_at DESC
    `);
  }

  async getInvoice(id) {
    return this.getById('invoices', id);
  }

  async createInvoice(invoice) {
    return this.insert('invoices', invoice);
  }

  async updateInvoice(id, invoice) {
    return this.update('invoices', id, invoice);
  }

  async deleteInvoice(id) {
    await this.connect();
    await this.query(`DELETE FROM invoice_items WHERE invoice_id = ${id}`);
    return this.delete('invoices', id);
  }

  async archiveInvoice(id) {
    return this.update('invoices', id, { archived: 1 });
  }

  async restoreInvoice(id) {
    return this.update('invoices', id, { archived: 0 });
  }

  // ==================== Invoice Items Operations ====================

  async getInvoiceItems(invoiceId) {
    await this.connect();
    return this.query(`SELECT * FROM invoice_items WHERE invoice_id = ${invoiceId}`);
  }

  async createInvoiceItem(item) {
    return this.insert('invoice_items', item);
  }

  async deleteInvoiceItems(invoiceId) {
    await this.connect();
    await this.query(`DELETE FROM invoice_items WHERE invoice_id = ${invoiceId}`);
    return { changes: 1 };
  }

  // ==================== Saved Items Operations ====================

  async getAllSavedItems() {
    return this.getAll('saved_items', 'description');
  }

  async getSavedItem(id) {
    return this.getById('saved_items', id);
  }

  async createSavedItem(item) {
    return this.insert('saved_items', item);
  }

  async updateSavedItem(id, item) {
    return this.update('saved_items', id, item);
  }

  async deleteSavedItem(id) {
    return this.delete('saved_items', id);
  }

  // ==================== Payment Operations ====================

  async getPaymentsByInvoice(invoiceId) {
    await this.connect();
    return this.query(`SELECT * FROM payments WHERE invoice_id = ${invoiceId} ORDER BY payment_date DESC`);
  }

  async createPayment(payment) {
    return this.insert('payments', payment);
  }

  async deletePayment(id) {
    return this.delete('payments', id);
  }

  // ==================== Estimate Operations ====================

  async getAllEstimates() {
    await this.connect();
    return this.query(`
      SELECT e.*, c.name as client_name, c.email as client_email
      FROM estimates e
      LEFT JOIN clients c ON e.client_id = c.id
      WHERE e.archived = 0
      ORDER BY e.created_at DESC
    `);
  }

  async getEstimate(id) {
    return this.getById('estimates', id);
  }

  async createEstimate(estimate) {
    return this.insert('estimates', estimate);
  }

  async updateEstimate(id, estimate) {
    return this.update('estimates', id, estimate);
  }

  async deleteEstimate(id) {
    await this.connect();
    await this.query(`DELETE FROM estimate_items WHERE estimate_id = ${id}`);
    return this.delete('estimates', id);
  }

  // ==================== Credit Note Operations ====================

  async getAllCreditNotes() {
    await this.connect();
    return this.query(`
      SELECT cn.*, c.name as client_name, i.invoice_number
      FROM credit_notes cn
      LEFT JOIN clients c ON cn.client_id = c.id
      LEFT JOIN invoices i ON cn.invoice_id = i.id
      WHERE cn.archived = 0
      ORDER BY cn.created_at DESC
    `);
  }

  async getCreditNote(id) {
    return this.getById('credit_notes', id);
  }

  async createCreditNote(creditNote) {
    return this.insert('credit_notes', creditNote);
  }

  async updateCreditNote(id, creditNote) {
    return this.update('credit_notes', id, creditNote);
  }

  async deleteCreditNote(id) {
    await this.connect();
    await this.query(`DELETE FROM credit_note_items WHERE credit_note_id = ${id}`);
    return this.delete('credit_notes', id);
  }
}

module.exports = SQLServerAdapter;
