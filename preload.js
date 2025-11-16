const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, ...args) => {
      // Whitelist of allowed channels for invoke
      const validChannels = [
        // Settings
        'db:getSettings',
        'db:updateSettings',
        // Clients
        'db:getAllClients',
        'db:getClient',
        'db:getClientByCustomerNumber',
        'db:createClient',
        'db:updateClient',
        'db:deleteClient',
        'db:getClientStats',
        // Invoices
        'db:getAllInvoices',
        'db:getArchivedInvoices',
        'db:getInvoice',
        'db:createInvoice',
        'db:updateInvoice',
        'db:deleteInvoice',
        'db:archiveInvoice',
        'db:restoreInvoice',
        'db:generateInvoiceNumber',
        // Saved Items
        'db:getAllSavedItems',
        'db:getSavedItem',
        'db:getSavedItemByItemNumber',
        'db:createSavedItem',
        'db:updateSavedItem',
        'db:deleteSavedItem',
        // Dashboard
        'db:getDashboardStats',
        // Payments
        'db:createPayment',
        'db:getPaymentsByInvoice',
        'db:deletePayment',
        // Recurring Invoices
        'db:createRecurringInvoice',
        'db:getAllRecurringInvoices',
        'db:getRecurringInvoice',
        'db:updateRecurringInvoice',
        'db:deleteRecurringInvoice',
        'db:generateInvoiceFromRecurring',
        // Estimates
        'db:generateEstimateNumber',
        'db:createEstimate',
        'db:getAllEstimates',
        'db:getArchivedEstimates',
        'db:getEstimate',
        'db:updateEstimate',
        'db:deleteEstimate',
        'db:archiveEstimate',
        'db:restoreEstimate',
        'db:convertEstimateToInvoice',
        // Credit Notes
        'db:generateCreditNoteNumber',
        'db:createCreditNote',
        'db:getAllCreditNotes',
        'db:getCreditNote',
        'db:getCreditNotesByInvoice',
        'db:updateCreditNote',
        'db:deleteCreditNote',
        'db:archiveCreditNote',
        // Expenses
        'db:generateExpenseNumber',
        'db:createExpense',
        'db:getAllExpenses',
        'db:getExpense',
        'db:updateExpense',
        'db:deleteExpense',
        'db:getExpensesByClient',
        'db:getBillableExpenses',
        // Expense Categories
        'db:getAllExpenseCategories',
        'db:createExpenseCategory',
        'db:updateExpenseCategory',
        'db:deleteExpenseCategory',
        // Reminder Templates
        'db:getAllReminderTemplates',
        'db:getReminderTemplate',
        'db:createReminderTemplate',
        'db:updateReminderTemplate',
        'db:deleteReminderTemplate',
        // Invoice Reminders
        'db:createInvoiceReminder',
        'db:getInvoiceReminders',
        'db:getAllInvoiceReminders',
        'db:deleteInvoiceReminder',
        'db:getInvoicesNeedingReminders',
        'reminders:checkAndSend',
        // Batch Operations
        'db:batchUpdateInvoiceStatus',
        'db:batchArchiveInvoices',
        'db:batchDeleteInvoices',
        // PDF & Email
        'pdf:saveInvoice',
        'email:sendInvoice',
        'email:sendInvoiceWithPayment',
        // Payment Gateway
        'payment:createStripePaymentLink',
        'payment:createPaymentIntent',
        'payment:processCardPayment',
        // Backup & Restore
        'backup:create',
        'backup:restore',
        'backup:list',
        'backup:selectFile',
      ];

      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }

      throw new Error(`Invalid IPC channel: ${channel}`);
    },
    on: (channel, callback) => {
      // Whitelist of allowed channels for events
      const validEventChannels = [
        'invoice-payment-received',
      ];

      if (validEventChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
      } else {
        throw new Error(`Invalid event channel: ${channel}`);
      }
    },
    removeAllListeners: (channel) => {
      const validEventChannels = [
        'invoice-payment-received',
      ];

      if (validEventChannels.includes(channel)) {
        ipcRenderer.removeAllListeners(channel);
      }
    },
  },
});
