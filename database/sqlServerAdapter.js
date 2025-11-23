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

      console.log(`Checking if database "${this.config.database}" exists...`);

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
      return false;
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

      console.log(`Creating database "${this.config.database}"...`);

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
              console.log('Database created successfully');
              resolve();
            }
          });
          tempAdapter.connection.execSql(request);
        });
      }

      await tempAdapter.disconnect();
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
      await this.connect();

      // Read SQLite schema and convert to SQL server schema
      const schemaPath = path.join(__dirname, 'schema.sql');
      let schema = fs.readFileSync(schemaPath, 'utf8');

      // Convert SQLite schema to target SQL server schema
      schema = this.convertSchema(schema);

      // Split into individual statements
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      // Execute each statement
      for (const statement of statements) {
        if (statement.length > 0) {
          try {
            await this.query(statement);
            console.log('Executed:', statement.substring(0, 100) + '...');
          } catch (error) {
            console.error('Error executing statement:', statement);
            console.error(error.message);
            // Continue with next statement
          }
        }
      }

      return { success: true, message: 'Schema created successfully' };
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
      schema = schema.replace(/TEXT/g, 'NVARCHAR(MAX)');
      schema = schema.replace(/REAL/g, 'DECIMAL(10,2)');
      schema = schema.replace(/IF NOT EXISTS/g, '');
    }

    // Remove SQLite-specific pragmas
    schema = schema.replace(/PRAGMA.*/g, '');

    // Remove INSERT OR IGNORE (need to handle differently)
    schema = schema.replace(/INSERT OR IGNORE/g, 'INSERT IGNORE'); // MySQL
    if (this.type === 'postgres' || this.type === 'mssql') {
      schema = schema.replace(/INSERT IGNORE/g, 'INSERT');
    }

    return schema;
  }
}

module.exports = SQLServerAdapter;
