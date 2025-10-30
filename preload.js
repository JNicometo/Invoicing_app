const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, ...args) => {
      // Whitelist of allowed channels
      const validChannels = [
        'db:getSettings',
        'db:updateSettings',
        'db:getAllClients',
        'db:getClient',
        'db:createClient',
        'db:updateClient',
        'db:deleteClient',
        'db:getClientStats',
        'db:getAllInvoices',
        'db:getArchivedInvoices',
        'db:getInvoice',
        'db:createInvoice',
        'db:updateInvoice',
        'db:deleteInvoice',
        'db:archiveInvoice',
        'db:restoreInvoice',
        'db:generateInvoiceNumber',
        'db:getAllSavedItems',
        'db:getSavedItem',
        'db:createSavedItem',
        'db:updateSavedItem',
        'db:deleteSavedItem',
        'db:getDashboardStats',
      ];

      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }

      throw new Error(`Invalid IPC channel: ${channel}`);
    },
  },
});
