const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const db = require('./database/db');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');

let mainWindow;

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

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize database when app is ready
app.whenReady().then(() => {
  try {
    db.initDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }

  createWindow();

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
    return db.getClient(id);
  } catch (error) {
    console.error('Error getting client:', error);
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
    return db.createClient(client);
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
});

ipcMain.handle('db:updateClient', async (event, id, client) => {
  try {
    return db.updateClient(id, client);
  } catch (error) {
    console.error('Error updating client:', error);
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
    const pdfWindow = new BrowserWindow({
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

    // Close the hidden window
    pdfWindow.close();

    return { success: true, filePath };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
});

// Email Sending
ipcMain.handle('email:sendInvoice', async (event, emailData) => {
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
        rejectUnauthorized: false // Allow self-signed certificates (for development)
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

    console.log('Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      message: 'Invoice sent successfully!'
    };

  } catch (error) {
    console.error('Error sending email:', error);

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
        type: 'redirect',
        redirect: {
          url: `https://example.com/payment-success?invoice=${invoice.invoice_number}`,
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
