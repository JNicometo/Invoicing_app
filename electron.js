const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const db = require('./database/db');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');
const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const log = require('./utils/logger');

let mainWindow;

// Input validation helpers
const validateId = (id, name = 'ID') => {
  if (!id || typeof id !== 'number' || id < 1) {
    throw new Error(`Invalid ${name}: must be a positive number`);
  }
  return id;
};

const validateNonEmpty = (value, name = 'Value') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(`${name} cannot be empty`);
  }
  return value;
};

const validateObject = (obj, name = 'Object') => {
  if (!obj || typeof obj !== 'object') {
    throw new Error(`Invalid ${name}: must be an object`);
  }
  return obj;
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'public', 'icon.png'),
  });

  // Load the app
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, 'build/index.html')}`;

  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize database when app is ready
app.whenReady().then(async () => {
  try {
    // Initialize database first
    await db.initDatabase();
    log.success('Database initialized successfully');

    // Create window after database is ready
    createWindow();

    // Start webhook server after database is initialized
    startWebhookServer();

    // Run initial reminder check after 5 seconds
    setTimeout(() => {
      log.info('Running initial reminder check...');
      checkAndSendReminders();
    }, 5000);

  } catch (error) {
    log.error('Failed to initialize application:', error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for Database Operations

// Settings
ipcMain.handle('db:getSettings', async () => {
  try {
    return db.getSettings();
  } catch (error) {
    console.error('Error getting settings:', error);
    throw error;
  }
});

ipcMain.handle('db:updateSettings', async (event, settings) => {
  try {
    return db.updateSettings(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
});

// Clients
ipcMain.handle('db:getAllClients', async () => {
  try {
    return db.getAllClients();
  } catch (error) {
    console.error('Error getting clients:', error);
    throw error;
  }
});

ipcMain.handle('db:getClient', async (event, id) => {
  try {
    validateId(id, 'Client ID');
    return db.getClient(id);
  } catch (error) {
    log.error('Error getting client:', error);
    throw error;
  }
});

ipcMain.handle('db:getClientByCustomerNumber', async (event, customerNumber) => {
  try {
    return db.getClientByCustomerNumber(customerNumber);
  } catch (error) {
    console.error('Error getting client by customer number:', error);
    throw error;
  }
});

ipcMain.handle('db:createClient', async (event, client) => {
  try {
    validateObject(client, 'Client data');
    validateNonEmpty(client.name, 'Client name');
    validateNonEmpty(client.email, 'Client email');
    return db.createClient(client);
  } catch (error) {
    log.error('Error creating client:', error);
    throw error;
  }
});

ipcMain.handle('db:updateClient', async (event, id, client) => {
  try {
    validateId(id, 'Client ID');
    validateObject(client, 'Client data');
    return db.updateClient(id, client);
  } catch (error) {
    log.error('Error updating client:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteClient', async (event, id) => {
  try {
    return db.deleteClient(id);
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
});

ipcMain.handle('db:getClientStats', async (event, clientId) => {
  try {
    return db.getClientStats(clientId);
  } catch (error) {
    console.error('Error getting client stats:', error);
    throw error;
  }
});

// Invoices
ipcMain.handle('db:getAllInvoices', async () => {
  try {
    return db.getAllInvoices();
  } catch (error) {
    console.error('Error getting invoices:', error);
    throw error;
  }
});

ipcMain.handle('db:getArchivedInvoices', async () => {
  try {
    return db.getArchivedInvoices();
  } catch (error) {
    console.error('Error getting archived invoices:', error);
    throw error;
  }
});

ipcMain.handle('db:getInvoice', async (event, id) => {
  try {
    return db.getInvoice(id);
  } catch (error) {
    console.error('Error getting invoice:', error);
    throw error;
  }
});

ipcMain.handle('db:createInvoice', async (event, invoice, items) => {
  try {
    return db.createInvoice(invoice, items);
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
});

ipcMain.handle('db:updateInvoice', async (event, id, invoice, items) => {
  try {
    return db.updateInvoice(id, invoice, items);
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteInvoice', async (event, id) => {
  try {
    return db.deleteInvoice(id);
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
});

ipcMain.handle('db:archiveInvoice', async (event, id) => {
  try {
    return db.archiveInvoice(id);
  } catch (error) {
    console.error('Error archiving invoice:', error);
    throw error;
  }
});

ipcMain.handle('db:restoreInvoice', async (event, id) => {
  try {
    return db.restoreInvoice(id);
  } catch (error) {
    console.error('Error restoring invoice:', error);
    throw error;
  }
});

ipcMain.handle('db:generateInvoiceNumber', async () => {
  try {
    return db.generateInvoiceNumber();
  } catch (error) {
    console.error('Error generating invoice number:', error);
    throw error;
  }
});

// Saved Items
ipcMain.handle('db:getAllSavedItems', async () => {
  try {
    return db.getAllSavedItems();
  } catch (error) {
    console.error('Error getting saved items:', error);
    throw error;
  }
});

ipcMain.handle('db:getSavedItem', async (event, id) => {
  try {
    return db.getSavedItem(id);
  } catch (error) {
    console.error('Error getting saved item:', error);
    throw error;
  }
});

ipcMain.handle('db:getSavedItemByItemNumber', async (event, itemNumber) => {
  try {
    return db.getSavedItemByItemNumber(itemNumber);
  } catch (error) {
    console.error('Error getting saved item by item number:', error);
    throw error;
  }
});

ipcMain.handle('db:createSavedItem', async (event, item) => {
  try {
    return db.createSavedItem(item);
  } catch (error) {
    console.error('Error creating saved item:', error);
    throw error;
  }
});

ipcMain.handle('db:updateSavedItem', async (event, id, item) => {
  try {
    return db.updateSavedItem(id, item);
  } catch (error) {
    console.error('Error updating saved item:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteSavedItem', async (event, id) => {
  try {
    return db.deleteSavedItem(id);
  } catch (error) {
    console.error('Error deleting saved item:', error);
    throw error;
  }
});

// Dashboard
ipcMain.handle('db:getDashboardStats', async () => {
  try {
    return db.getDashboardStats();
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
});

// PDF Generation
ipcMain.handle('pdf:saveInvoice', async (event, invoiceHtml, invoiceNumber) => {
  let pdfWindow = null;
  try {
    // Show save dialog
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Invoice PDF',
      defaultPath: `Invoice-${invoiceNumber}.pdf`,
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] }
      ]
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    // Create a hidden window to render the invoice
    pdfWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Load the invoice HTML
    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(invoiceHtml)}`);

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate PDF
    const pdfData = await pdfWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: 'Letter',
      margins: {
        top: 0.5,
        bottom: 0.5,
        left: 0.5,
        right: 0.5
      }
    });

    // Save the PDF
    fs.writeFileSync(filePath, pdfData);

    return { success: true, filePath };
  } catch (error) {
    log.error('Error generating PDF:', error);
    throw error;
  } finally {
    // Always close the PDF window, even on error
    if (pdfWindow && !pdfWindow.isDestroyed()) {
      pdfWindow.close();
    }
  }
});

// Email Sending
ipcMain.handle('email:sendInvoice', async (event, emailData) => {
  let pdfWindow = null;
  try {
    const { settings, recipient, subject, body, invoiceHtml, invoiceNumber, cc, bcc } = emailData;

    // Validate SMTP settings
    if (!settings.smtp_host || !settings.smtp_user || !settings.smtp_password) {
      throw new Error('SMTP settings are not configured. Please configure email settings first.');
    }

    // Create a transporter
    const transporter = nodemailer.createTransporter({
      host: settings.smtp_host,
      port: parseInt(settings.smtp_port) || 587,
      secure: settings.smtp_secure === true || settings.smtp_secure === 1, // true for 465, false for other ports
      auth: {
        user: settings.smtp_user,
        pass: settings.smtp_password,
      },
      tls: {
        // Allow configuration of TLS verification (default: true for security)
        rejectUnauthorized: settings.smtp_verify_tls !== false
      }
    });

    // Verify connection configuration
    await transporter.verify();

    // Generate PDF in memory for attachment
    pdfWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(invoiceHtml)}`);
    await new Promise(resolve => setTimeout(resolve, 500));

    const pdfData = await pdfWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: 'Letter',
      margins: {
        top: 0.5,
        bottom: 0.5,
        left: 0.5,
        right: 0.5
      }
    });

    // Prepare email options
    const mailOptions = {
      from: settings.smtp_from_email
        ? `"${settings.smtp_from_name || settings.company_name}" <${settings.smtp_from_email}>`
        : settings.smtp_user,
      to: recipient,
      subject: subject,
      text: body, // Plain text body
      html: `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${body}</pre>`, // HTML body
      attachments: [
        {
          filename: `Invoice-${invoiceNumber}.pdf`,
          content: pdfData,
          contentType: 'application/pdf'
        }
      ]
    };

    // Add CC and BCC if provided
    if (cc && cc.trim()) {
      mailOptions.cc = cc;
    }
    if (bcc && bcc.trim()) {
      mailOptions.bcc = bcc;
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    log.success('Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      message: 'Invoice sent successfully!'
    };

  } catch (error) {
    log.error('Error sending email:', error);

    // Provide user-friendly error messages
    let errorMessage = error.message;
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Please check your SMTP username and password.';
    } else if (error.code === 'ESOCKET') {
      errorMessage = 'Could not connect to email server. Please check your SMTP host and port.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Connection failed. Please check your internet connection and SMTP settings.';
    }

    throw new Error(errorMessage);
  } finally {
    // Always close the PDF window, even on error
    if (pdfWindow && !pdfWindow.isDestroyed()) {
      pdfWindow.close();
    }
  }
});

// Payments
ipcMain.handle('db:createPayment', async (event, payment) => {
  try {
    return db.createPayment(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
});

ipcMain.handle('db:getPaymentsByInvoice', async (event, invoiceId) => {
  try {
    return db.getPaymentsByInvoice(invoiceId);
  } catch (error) {
    console.error('Error getting payments:', error);
    throw error;
  }
});

ipcMain.handle('db:deletePayment', async (event, id) => {
  try {
    return db.deletePayment(id);
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
});

// Recurring Invoices
ipcMain.handle('db:createRecurringInvoice', async (event, recurringInvoice, items) => {
  try {
    return db.createRecurringInvoice(recurringInvoice, items);
  } catch (error) {
    console.error('Error creating recurring invoice:', error);
    throw error;
  }
});

ipcMain.handle('db:getAllRecurringInvoices', async () => {
  try {
    return db.getAllRecurringInvoices();
  } catch (error) {
    console.error('Error getting recurring invoices:', error);
    throw error;
  }
});

ipcMain.handle('db:getRecurringInvoice', async (event, id) => {
  try {
    return db.getRecurringInvoice(id);
  } catch (error) {
    console.error('Error getting recurring invoice:', error);
    throw error;
  }
});

ipcMain.handle('db:updateRecurringInvoice', async (event, id, recurringInvoice, items) => {
  try {
    return db.updateRecurringInvoice(id, recurringInvoice, items);
  } catch (error) {
    console.error('Error updating recurring invoice:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteRecurringInvoice', async (event, id) => {
  try {
    return db.deleteRecurringInvoice(id);
  } catch (error) {
    console.error('Error deleting recurring invoice:', error);
    throw error;
  }
});

ipcMain.handle('db:generateInvoiceFromRecurring', async (event, recurringInvoiceId) => {
  try {
    return db.generateInvoiceFromRecurring(recurringInvoiceId);
  } catch (error) {
    console.error('Error generating invoice from recurring:', error);
    throw error;
  }
});

// Estimates
ipcMain.handle('db:generateEstimateNumber', async () => {
  try {
    return db.generateEstimateNumber();
  } catch (error) {
    console.error('Error generating estimate number:', error);
    throw error;
  }
});

ipcMain.handle('db:createEstimate', async (event, estimate, items) => {
  try {
    return db.createEstimate(estimate, items);
  } catch (error) {
    console.error('Error creating estimate:', error);
    throw error;
  }
});

ipcMain.handle('db:getAllEstimates', async () => {
  try {
    return db.getAllEstimates();
  } catch (error) {
    console.error('Error getting estimates:', error);
    throw error;
  }
});

ipcMain.handle('db:getArchivedEstimates', async () => {
  try {
    return db.getArchivedEstimates();
  } catch (error) {
    console.error('Error getting archived estimates:', error);
    throw error;
  }
});

ipcMain.handle('db:getEstimate', async (event, id) => {
  try {
    return db.getEstimate(id);
  } catch (error) {
    console.error('Error getting estimate:', error);
    throw error;
  }
});

ipcMain.handle('db:updateEstimate', async (event, id, estimate, items) => {
  try {
    return db.updateEstimate(id, estimate, items);
  } catch (error) {
    console.error('Error updating estimate:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteEstimate', async (event, id) => {
  try {
    return db.deleteEstimate(id);
  } catch (error) {
    console.error('Error deleting estimate:', error);
    throw error;
  }
});

ipcMain.handle('db:archiveEstimate', async (event, id) => {
  try {
    return db.archiveEstimate(id);
  } catch (error) {
    console.error('Error archiving estimate:', error);
    throw error;
  }
});

ipcMain.handle('db:restoreEstimate', async (event, id) => {
  try {
    return db.restoreEstimate(id);
  } catch (error) {
    console.error('Error restoring estimate:', error);
    throw error;
  }
});

ipcMain.handle('db:convertEstimateToInvoice', async (event, estimateId) => {
  try {
    return db.convertEstimateToInvoice(estimateId);
  } catch (error) {
    console.error('Error converting estimate to invoice:', error);
    throw error;
  }
});

// Credit Notes
ipcMain.handle('db:generateCreditNoteNumber', async () => {
  try {
    return db.generateCreditNoteNumber();
  } catch (error) {
    console.error('Error generating credit note number:', error);
    throw error;
  }
});

ipcMain.handle('db:createCreditNote', async (event, creditNote, items) => {
  try {
    return db.createCreditNote(creditNote, items);
  } catch (error) {
    console.error('Error creating credit note:', error);
    throw error;
  }
});

ipcMain.handle('db:getAllCreditNotes', async () => {
  try {
    return db.getAllCreditNotes();
  } catch (error) {
    console.error('Error getting credit notes:', error);
    throw error;
  }
});

ipcMain.handle('db:getCreditNote', async (event, id) => {
  try {
    return db.getCreditNote(id);
  } catch (error) {
    console.error('Error getting credit note:', error);
    throw error;
  }
});

ipcMain.handle('db:getCreditNotesByInvoice', async (event, invoiceId) => {
  try {
    return db.getCreditNotesByInvoice(invoiceId);
  } catch (error) {
    console.error('Error getting credit notes by invoice:', error);
    throw error;
  }
});

ipcMain.handle('db:updateCreditNote', async (event, id, creditNote, items) => {
  try {
    return db.updateCreditNote(id, creditNote, items);
  } catch (error) {
    console.error('Error updating credit note:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteCreditNote', async (event, id) => {
  try {
    return db.deleteCreditNote(id);
  } catch (error) {
    console.error('Error deleting credit note:', error);
    throw error;
  }
});

ipcMain.handle('db:archiveCreditNote', async (event, id) => {
  try {
    return db.archiveCreditNote(id);
  } catch (error) {
    console.error('Error archiving credit note:', error);
    throw error;
  }
});

// Expenses
ipcMain.handle('db:generateExpenseNumber', async () => {
  try {
    return db.generateExpenseNumber();
  } catch (error) {
    console.error('Error generating expense number:', error);
    throw error;
  }
});

ipcMain.handle('db:createExpense', async (event, expense) => {
  try {
    return db.createExpense(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
});

ipcMain.handle('db:getAllExpenses', async () => {
  try {
    return db.getAllExpenses();
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
});

ipcMain.handle('db:getExpense', async (event, id) => {
  try {
    return db.getExpense(id);
  } catch (error) {
    console.error('Error getting expense:', error);
    throw error;
  }
});

ipcMain.handle('db:updateExpense', async (event, id, expense) => {
  try {
    return db.updateExpense(id, expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteExpense', async (event, id) => {
  try {
    return db.deleteExpense(id);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
});

ipcMain.handle('db:getExpensesByClient', async (event, clientId) => {
  try {
    return db.getExpensesByClient(clientId);
  } catch (error) {
    console.error('Error getting expenses by client:', error);
    throw error;
  }
});

ipcMain.handle('db:getBillableExpenses', async () => {
  try {
    return db.getBillableExpenses();
  } catch (error) {
    console.error('Error getting billable expenses:', error);
    throw error;
  }
});

// Expense Categories
ipcMain.handle('db:getAllExpenseCategories', async () => {
  try {
    return db.getAllExpenseCategories();
  } catch (error) {
    console.error('Error getting expense categories:', error);
    throw error;
  }
});

ipcMain.handle('db:createExpenseCategory', async (event, category) => {
  try {
    return db.createExpenseCategory(category);
  } catch (error) {
    console.error('Error creating expense category:', error);
    throw error;
  }
});

ipcMain.handle('db:updateExpenseCategory', async (event, id, category) => {
  try {
    return db.updateExpenseCategory(id, category);
  } catch (error) {
    console.error('Error updating expense category:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteExpenseCategory', async (event, id) => {
  try {
    return db.deleteExpenseCategory(id);
  } catch (error) {
    console.error('Error deleting expense category:', error);
    throw error;
  }
});

// Reminder Templates
ipcMain.handle('db:getAllReminderTemplates', async () => {
  try {
    return db.getAllReminderTemplates();
  } catch (error) {
    console.error('Error getting reminder templates:', error);
    throw error;
  }
});

ipcMain.handle('db:getReminderTemplate', async (event, id) => {
  try {
    return db.getReminderTemplate(id);
  } catch (error) {
    console.error('Error getting reminder template:', error);
    throw error;
  }
});

ipcMain.handle('db:createReminderTemplate', async (event, template) => {
  try {
    return db.createReminderTemplate(template);
  } catch (error) {
    console.error('Error creating reminder template:', error);
    throw error;
  }
});

ipcMain.handle('db:updateReminderTemplate', async (event, id, template) => {
  try {
    return db.updateReminderTemplate(id, template);
  } catch (error) {
    console.error('Error updating reminder template:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteReminderTemplate', async (event, id) => {
  try {
    return db.deleteReminderTemplate(id);
  } catch (error) {
    console.error('Error deleting reminder template:', error);
    throw error;
  }
});

// Invoice Reminders
ipcMain.handle('db:createInvoiceReminder', async (event, reminder) => {
  try {
    return db.createInvoiceReminder(reminder);
  } catch (error) {
    console.error('Error creating invoice reminder:', error);
    throw error;
  }
});

ipcMain.handle('db:getInvoiceReminders', async (event, invoiceId) => {
  try {
    return db.getInvoiceReminders(invoiceId);
  } catch (error) {
    console.error('Error getting invoice reminders:', error);
    throw error;
  }
});

ipcMain.handle('db:getAllInvoiceReminders', async () => {
  try {
    return db.getAllInvoiceReminders();
  } catch (error) {
    console.error('Error getting all invoice reminders:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteInvoiceReminder', async (event, id) => {
  try {
    return db.deleteInvoiceReminder(id);
  } catch (error) {
    console.error('Error deleting invoice reminder:', error);
    throw error;
  }
});

ipcMain.handle('db:getInvoicesNeedingReminders', async () => {
  try {
    return db.getInvoicesNeedingReminders();
  } catch (error) {
    console.error('Error getting invoices needing reminders:', error);
    throw error;
  }
});

// Batch Operations
ipcMain.handle('db:batchUpdateInvoiceStatus', async (event, invoiceIds, status) => {
  try {
    return db.batchUpdateInvoiceStatus(invoiceIds, status);
  } catch (error) {
    console.error('Error batch updating invoice status:', error);
    throw error;
  }
});

ipcMain.handle('db:batchArchiveInvoices', async (event, invoiceIds) => {
  try {
    return db.batchArchiveInvoices(invoiceIds);
  } catch (error) {
    console.error('Error batch archiving invoices:', error);
    throw error;
  }
});

ipcMain.handle('db:batchDeleteInvoices', async (event, invoiceIds) => {
  try {
    return db.batchDeleteInvoices(invoiceIds);
  } catch (error) {
    console.error('Error batch deleting invoices:', error);
    throw error;
  }
});

// Backup and Restore
const backup = require('./database/backup');

ipcMain.handle('backup:create', async (event, customPath) => {
  try {
    const backupDir = backup.getDefaultBackupDir();
    const filename = backup.generateBackupFilename();
    const backupPath = customPath || path.join(backupDir, filename);

    await backup.createBackup(backupPath);

    return {
      success: true,
      path: backupPath,
      filename: path.basename(backupPath)
    };
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
});

ipcMain.handle('backup:restore', async (event, backupPath) => {
  try {
    const stats = await backup.restoreBackup(backupPath);

    return {
      success: true,
      stats
    };
  } catch (error) {
    console.error('Error restoring backup:', error);
    throw error;
  }
});

ipcMain.handle('backup:list', async () => {
  try {
    return backup.listBackups();
  } catch (error) {
    console.error('Error listing backups:', error);
    throw error;
  }
});

ipcMain.handle('backup:selectFile', async (event, mode) => {
  try {
    const options = mode === 'save' ? {
      title: 'Save Backup',
      defaultPath: path.join(app.getPath('documents'), backup.generateBackupFilename()),
      filters: [
        { name: 'Backup Files', extensions: ['zip'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    } : {
      title: 'Select Backup File',
      filters: [
        { name: 'Backup Files', extensions: ['zip'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    };

    const result = mode === 'save'
      ? await dialog.showSaveDialog(mainWindow, options)
      : await dialog.showOpenDialog(mainWindow, options);

    if (result.canceled) {
      return { canceled: true };
    }

    return {
      canceled: false,
      path: mode === 'save' ? result.filePath : result.filePaths[0]
    };
  } catch (error) {
    console.error('Error selecting file:', error);
    throw error;
  }
});

// CSV Restore - Select multiple CSV files
ipcMain.handle('backup:selectCSVFiles', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select CSV Files to Restore',
      filters: [
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile', 'multiSelections']
    });

    if (result.canceled) {
      return { canceled: true };
    }

    return {
      canceled: false,
      paths: result.filePaths
    };
  } catch (error) {
    console.error('Error selecting CSV files:', error);
    throw error;
  }
});

// Restore from CSV files
ipcMain.handle('backup:restoreFromCSV', async (event, csvFilePaths) => {
  try {
    const stats = await backup.restoreFromCSV(csvFilePaths);

    return {
      success: true,
      stats
    };
  } catch (error) {
    console.error('Error restoring from CSV:', error);
    throw error;
  }
});

// Get supported tables for CSV import
ipcMain.handle('backup:getSupportedTables', async () => {
  try {
    return backup.getSupportedTables();
  } catch (error) {
    console.error('Error getting supported tables:', error);
    throw error;
  }
});

// SQL Server Connection (lazy-loaded to avoid crashes if packages not installed)
ipcMain.handle('sqlserver:testConnection', async (event, config) => {
  try {
    const SQLServerAdapter = require('./database/sqlServerAdapter');
    const adapter = new SQLServerAdapter({
      type: config.type,
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,
      ssl: config.ssl
    });

    const result = await adapter.testConnection();
    return result;
  } catch (error) {
    console.error('Error testing SQL server connection:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('sqlserver:checkDatabase', async (event, config) => {
  try {
    const SQLServerAdapter = require('./database/sqlServerAdapter');
    const adapter = new SQLServerAdapter({
      type: config.type,
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,
      ssl: config.ssl
    });

    const exists = await adapter.databaseExists();
    return { success: true, exists };
  } catch (error) {
    console.error('Error checking database:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('sqlserver:createDatabase', async (event, config) => {
  try {
    const SQLServerAdapter = require('./database/sqlServerAdapter');
    const adapter = new SQLServerAdapter({
      type: config.type,
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,
      ssl: config.ssl
    });

    const result = await adapter.createDatabase();
    return result;
  } catch (error) {
    console.error('Error creating database:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('sqlserver:createSchema', async (event, config) => {
  try {
    const SQLServerAdapter = require('./database/sqlServerAdapter');
    const adapter = new SQLServerAdapter({
      type: config.type,
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,
      ssl: config.ssl
    });

    const result = await adapter.createSchema();
    return result;
  } catch (error) {
    console.error('Error creating schema:', error);
    return { success: false, message: error.message };
  }
});

// Payment Gateway - Stripe
ipcMain.handle('payment:createStripePaymentLink', async (event, paymentData) => {
  try {
    const { settings, invoice, client } = paymentData;

    // Validate Stripe settings
    if (!settings.stripe_enabled || !settings.stripe_secret_key) {
      throw new Error('Stripe is not configured. Please configure Stripe settings first.');
    }

    // Initialize Stripe with the secret key
    const stripe = Stripe(settings.stripe_secret_key);

    // Create a payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: (settings.currency_code || 'USD').toLowerCase(),
            product_data: {
              name: `Invoice ${invoice.invoice_number}`,
              description: `Payment for ${settings.company_name || 'Invoice'}`,
            },
            unit_amount: Math.round(invoice.total * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoice_id: invoice.id.toString(),
        invoice_number: invoice.invoice_number,
        client_id: client.id.toString(),
        client_name: client.name,
      },
      after_completion: {
        type: 'hosted_confirmation',
        hosted_confirmation: {
          custom_message: `Thank you! Payment for Invoice ${invoice.invoice_number} has been received. You will receive a confirmation email shortly.`,
        },
      },
    });

    console.log('Stripe payment link created:', paymentLink.id);
    return {
      success: true,
      paymentLink: paymentLink.url,
      paymentLinkId: paymentLink.id,
      message: 'Payment link created successfully!'
    };

  } catch (error) {
    console.error('Error creating Stripe payment link:', error);

    let errorMessage = error.message;
    if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Stripe authentication failed. Please check your API key.';
    } else if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid request to Stripe. Please check your settings.';
    }

    throw new Error(errorMessage);
  }
});

// Create a Payment Intent for direct card payment
ipcMain.handle('payment:createPaymentIntent', async (event, paymentData) => {
  try {
    const { settings, invoice, client, amount } = paymentData;

    // Validate Stripe settings
    if (!settings.stripe_enabled || !settings.stripe_secret_key) {
      throw new Error('Stripe is not configured. Please configure Stripe settings first.');
    }

    // Initialize Stripe with the secret key
    const stripe = Stripe(settings.stripe_secret_key);

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round((amount || invoice.total) * 100), // Stripe uses cents
      currency: (settings.currency_code || 'USD').toLowerCase(),
      metadata: {
        invoice_id: invoice.id.toString(),
        invoice_number: invoice.invoice_number,
        client_id: client.id.toString(),
        client_name: client.name,
      },
      description: `Payment for Invoice ${invoice.invoice_number}`,
    });

    console.log('Stripe payment intent created:', paymentIntent.id);
    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };

  } catch (error) {
    console.error('Error creating Stripe payment intent:', error);
    let errorMessage = error.message;
    if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Stripe authentication failed. Please check your API key.';
    } else if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid request to Stripe. Please check your settings.';
    }
    throw new Error(errorMessage);
  }
});

// Process a card payment
ipcMain.handle('payment:processCardPayment', async (event, paymentData) => {
  try {
    const { settings, cardDetails, clientSecret } = paymentData;

    // Validate Stripe settings
    if (!settings.stripe_enabled || !settings.stripe_secret_key) {
      throw new Error('Stripe is not configured. Please configure Stripe settings first.');
    }

    // Initialize Stripe with the secret key
    const stripe = Stripe(settings.stripe_secret_key);

    // Create a payment method from card details
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: cardDetails.number.replace(/\s/g, ''),
        exp_month: parseInt(cardDetails.expMonth),
        exp_year: parseInt(cardDetails.expYear),
        cvc: cardDetails.cvc,
      },
      billing_details: {
        name: cardDetails.name,
      },
    });

    // Confirm the payment intent with the payment method
    const paymentIntent = await stripe.paymentIntents.confirm(
      clientSecret.split('_secret_')[0], // Extract payment intent ID from client secret
      {
        payment_method: paymentMethod.id,
      }
    );

    console.log('Payment processed:', paymentIntent.id, paymentIntent.status);

    if (paymentIntent.status === 'succeeded') {
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        message: 'Payment successful!',
      };
    } else if (paymentIntent.status === 'requires_action') {
      return {
        success: false,
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        message: 'Additional authentication required.',
      };
    } else {
      return {
        success: false,
        message: `Payment ${paymentIntent.status}. Please try again.`,
      };
    }

  } catch (error) {
    console.error('Error processing card payment:', error);
    let errorMessage = error.message;

    if (error.type === 'StripeCardError') {
      errorMessage = error.message; // User-friendly message from Stripe
    } else if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Stripe authentication failed. Please check your API key.';
    } else if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid payment information. Please check your card details.';
    }

    throw new Error(errorMessage);
  }
});

// Send email with payment link
ipcMain.handle('email:sendInvoiceWithPayment', async (event, emailData) => {
  try {
    const { settings, recipient, subject, body, invoiceHtml, invoiceNumber, paymentLink, cc, bcc } = emailData;

    // Validate SMTP settings
    if (!settings.smtp_host || !settings.smtp_user || !settings.smtp_password) {
      throw new Error('SMTP settings are not configured. Please configure email settings first.');
    }

    // Create a transporter
    const transporter = nodemailer.createTransporter({
      host: settings.smtp_host,
      port: parseInt(settings.smtp_port) || 587,
      secure: settings.smtp_secure === true || settings.smtp_secure === 1,
      auth: {
        user: settings.smtp_user,
        pass: settings.smtp_password,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection configuration
    await transporter.verify();

    // Generate PDF in memory for attachment
    const pdfWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(invoiceHtml)}`);
    await new Promise(resolve => setTimeout(resolve, 500));

    const pdfData = await pdfWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: 'Letter',
      margins: {
        top: 0.5,
        bottom: 0.5,
        left: 0.5,
        right: 0.5
      }
    });

    pdfWindow.close();

    // Add payment link to email body
    const bodyWithPayment = `${body}\n\n--\n\nPay Online: ${paymentLink}\n\nClick the link above to securely pay this invoice with your credit or debit card.`;

    // Prepare email options
    const mailOptions = {
      from: settings.smtp_from_email
        ? `"${settings.smtp_from_name || settings.company_name}" <${settings.smtp_from_email}>`
        : settings.smtp_user,
      to: recipient,
      subject: subject,
      text: bodyWithPayment,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <pre style="white-space: pre-wrap;">${body}</pre>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
          <div style="text-align: center; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
            <p style="margin: 0 0 15px 0; font-size: 16px; color: #333;">Pay this invoice securely online:</p>
            <a href="${paymentLink}"
               style="display: inline-block; padding: 12px 30px; background-color: #635BFF; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Pay Now
            </a>
            <p style="margin: 15px 0 0 0; font-size: 12px; color: #666;">
              Secure payment powered by Stripe
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice-${invoiceNumber}.pdf`,
          content: pdfData,
          contentType: 'application/pdf'
        }
      ]
    };

    // Add CC and BCC if provided
    if (cc && cc.trim()) {
      mailOptions.cc = cc;
    }
    if (bcc && bcc.trim()) {
      mailOptions.bcc = bcc;
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email with payment link sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      message: 'Invoice with payment link sent successfully!'
    };

  } catch (error) {
    console.error('Error sending email with payment:', error);

    let errorMessage = error.message;
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Please check your SMTP username and password.';
    } else if (error.code === 'ESOCKET') {
      errorMessage = 'Could not connect to email server. Please check your SMTP host and port.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Connection failed. Please check your internet connection and SMTP settings.';
    }

    throw new Error(errorMessage);
  }
});

// ========================================
// Stripe Webhook Server
// ========================================

let webhookServer = null;

function startWebhookServer() {
  try {
    const settings = db.getSettings();
    // Make webhook port configurable via settings (default: 3001)
    const WEBHOOK_PORT = parseInt(settings.webhook_port) || 3001;

    const webhookApp = express();

    // Webhook endpoint needs raw body for signature verification
    webhookApp.post('/webhook/stripe',
      bodyParser.raw({ type: 'application/json' }),
      async (req, res) => {
        const sig = req.headers['stripe-signature'];

        try {
          const settings = db.getSettings();

          if (!settings.stripe_enabled || !settings.stripe_secret_key) {
            log.warn('Stripe not configured, ignoring webhook');
            return res.status(400).send('Stripe not configured');
          }

          const stripe = Stripe(settings.stripe_secret_key);

          // Verify webhook signature
          let event;
          try {
            // Use webhook secret if configured for proper signature verification
            if (settings.stripe_webhook_secret) {
              event = stripe.webhooks.constructEvent(req.body, sig, settings.stripe_webhook_secret);
              log.debug('Webhook signature verified successfully');
            } else {
              // Fallback: parse without verification (only for development/testing)
              log.warn('Stripe webhook secret not configured - signature verification skipped (INSECURE)');
              event = JSON.parse(req.body.toString());
            }
          } catch (err) {
            log.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
          }

          log.info('Received Stripe webhook event:', event.type);

          // Handle payment success events
          if (event.type === 'checkout.session.completed' ||
              event.type === 'payment_intent.succeeded') {

            const session = event.data.object;
            const metadata = session.metadata;

            if (metadata && metadata.invoice_id) {
              const invoiceId = parseInt(metadata.invoice_id);
              const invoice = db.getInvoice(invoiceId);

              if (invoice) {
                // Create payment record
                const payment = {
                  invoice_id: invoiceId,
                  amount: session.amount_total / 100, // Convert from cents
                  payment_date: new Date().toISOString().split('T')[0],
                  payment_method: 'Stripe',
                  reference_number: session.id,
                  notes: 'Automatic payment via Stripe webhook'
                };

                db.createPayment(payment);

                // Update invoice status (will auto-set to 'paid' if fully paid)
                db.updateInvoiceStatusAfterPayment(invoiceId);

                console.log(`Invoice #${invoice.invoice_number} marked as paid via Stripe webhook`);

                // Notify the renderer process if window exists
                if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.webContents.send('invoice-payment-received', {
                    invoiceId,
                    invoiceNumber: invoice.invoice_number,
                    amount: payment.amount
                  });
                }
              } else {
                console.warn(`Invoice with ID ${invoiceId} not found`);
              }
            }
          }

          res.json({ received: true });
        } catch (err) {
          console.error('Error processing webhook:', err);
          res.status(500).send('Webhook processing failed');
        }
      }
    );

    webhookServer = webhookApp.listen(WEBHOOK_PORT, () => {
      log.success(`Stripe webhook server listening on port ${WEBHOOK_PORT}`);
      log.info(`Webhook endpoint: http://localhost:${WEBHOOK_PORT}/webhook/stripe`);
      log.info('Configure this URL in your Stripe Dashboard webhook settings');
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        log.warn(`Port ${WEBHOOK_PORT} is already in use. Webhook server will not start.`);
        log.warn('Another instance of the application may be running, or another process is using this port.');
        log.warn('Change the webhook_port in settings to use a different port.');
        webhookServer = null;
      } else {
        log.error('Webhook server error:', err);
      }
    });

  } catch (error) {
    log.error('Failed to start webhook server:', error);
  }
}

// Stop webhook server when app quits
app.on('before-quit', () => {
  if (webhookServer) {
    webhookServer.close();
    log.info('Webhook server stopped');
  }
});

// ========================================
// Automated Reminder Scheduler
// ========================================

async function sendReminderEmail(invoice, template, client) {
  try {
    const settings = db.getSettings();

    // Check if SMTP is configured
    if (!settings.smtp_host || !settings.smtp_user || !settings.smtp_password) {
      console.error('SMTP not configured, cannot send reminder');
      return false;
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: settings.smtp_host,
      port: settings.smtp_port || 587,
      secure: settings.smtp_secure || false,
      auth: {
        user: settings.smtp_user,
        pass: settings.smtp_password
      }
    });

    // Replace template variables
    const subject = template.subject
      .replace('{invoice_number}', invoice.invoice_number)
      .replace('{company_name}', settings.company_name || 'InvoicePro')
      .replace('{client_name}', client.name);

    const body = template.body
      .replace('{invoice_number}', invoice.invoice_number)
      .replace('{client_name}', client.name)
      .replace('{total}', invoice.total.toFixed(2))
      .replace('{due_date}', invoice.due_date)
      .replace('{company_name}', settings.company_name || 'InvoicePro');

    const mailOptions = {
      from: `"${settings.smtp_from_name || 'InvoicePro'}" <${settings.smtp_from_email || settings.smtp_user}>`,
      to: client.email,
      subject: subject,
      html: body.replace(/\n/g, '<br>')
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reminder sent for invoice #${invoice.invoice_number} to ${client.email}`);

    return true;
  } catch (error) {
    console.error(`Error sending reminder for invoice #${invoice.invoice_number}:`, error);
    return false;
  }
}

async function checkAndSendReminders() {
  try {
    console.log('Checking for invoices needing reminders...');

    const invoicesNeedingReminders = db.getInvoicesNeedingReminders();

    if (invoicesNeedingReminders.length === 0) {
      console.log('No invoices need reminders at this time');
      return;
    }

    console.log(`Found ${invoicesNeedingReminders.length} invoice(s) needing reminders`);

    for (const needsReminder of invoicesNeedingReminders) {
      const invoice = db.getInvoice(needsReminder.invoice_id);
      const client = db.getClient(invoice.client_id);
      const template = db.getReminderTemplate(needsReminder.template_id);

      if (!invoice || !client || !template) {
        console.warn(`Missing data for reminder: invoice=${!!invoice}, client=${!!client}, template=${!!template}`);
        continue;
      }

      if (!client.email) {
        console.warn(`Client ${client.name} has no email address, skipping reminder`);
        continue;
      }

      // Send the reminder
      const sent = await sendReminderEmail(invoice, template, client);

      if (sent) {
        // Record the reminder
        db.createInvoiceReminder({
          invoice_id: invoice.id,
          template_id: template.id,
          sent_date: new Date().toISOString(),
          recipient_email: client.email
        });

        console.log(`Reminder recorded for invoice #${invoice.invoice_number}`);
      }
    }
  } catch (error) {
    console.error('Error in reminder scheduler:', error);
  }
}

// Reminder check timing protection
let lastReminderCheck = null;
const MIN_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

// Enhanced check function with duplicate prevention
const checkAndSendRemindersWithProtection = async () => {
  const now = Date.now();
  if (lastReminderCheck && (now - lastReminderCheck) < MIN_CHECK_INTERVAL) {
    log.debug('Skipping reminder check - too soon since last check');
    return;
  }
  lastReminderCheck = now;
  await checkAndSendReminders();
};

// Schedule reminder checks - runs every 6 hours (more reasonable interval)
cron.schedule('0 */6 * * *', () => {
  log.info('Running scheduled reminder check (every 6 hours)...');
  checkAndSendRemindersWithProtection();
});

// Initial check is handled in app.whenReady()

// Automatic backup scheduler - runs daily at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running scheduled automatic backup...');
  try {
    const backupPath = await backup.createAutoBackup();
    console.log(`Automatic backup created successfully: ${backupPath}`);
  } catch (error) {
    console.error('Error creating automatic backup:', error);
  }
});

// IPC handler to manually trigger reminder check
ipcMain.handle('reminders:checkAndSend', async () => {
  try {
    await checkAndSendReminders();
    return { success: true, message: 'Reminder check completed' };
  } catch (error) {
    console.error('Error triggering manual reminder check:', error);
    throw error;
  }
});
