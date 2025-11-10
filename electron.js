const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const db = require('./database/db');
const nodemailer = require('nodemailer');

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
