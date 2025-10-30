const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const db = require('./database/db');

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
