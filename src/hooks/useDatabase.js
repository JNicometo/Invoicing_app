import { useState, useEffect, useCallback } from 'react';

const { ipcRenderer } = window.electron;

export const useDatabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to handle IPC calls
  const ipcCall = useCallback(async (channel, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ipcRenderer.invoke(channel, ...args);
      setLoading(false);
      return result;
    } catch (err) {
      console.error(`Error calling ${channel}:`, err);
      setError(err.message || 'An error occurred');
      setLoading(false);
      throw err;
    }
  }, []);

  // Settings
  const getSettings = useCallback(async () => {
    return await ipcCall('db:getSettings');
  }, [ipcCall]);

  const updateSettings = useCallback(async (settings) => {
    return await ipcCall('db:updateSettings', settings);
  }, [ipcCall]);

  // Clients
  const getAllClients = useCallback(async () => {
    return await ipcCall('db:getAllClients');
  }, [ipcCall]);

  const getClient = useCallback(async (id) => {
    return await ipcCall('db:getClient', id);
  }, [ipcCall]);

  const getClientByCustomerNumber = useCallback(async (customerNumber) => {
    return await ipcCall('db:getClientByCustomerNumber', customerNumber);
  }, [ipcCall]);

  const createClient = useCallback(async (client) => {
    return await ipcCall('db:createClient', client);
  }, [ipcCall]);

  const updateClient = useCallback(async (id, client) => {
    return await ipcCall('db:updateClient', id, client);
  }, [ipcCall]);

  const deleteClient = useCallback(async (id) => {
    return await ipcCall('db:deleteClient', id);
  }, [ipcCall]);

  const getClientStats = useCallback(async (clientId) => {
    return await ipcCall('db:getClientStats', clientId);
  }, [ipcCall]);

  // Invoices
  const getAllInvoices = useCallback(async () => {
    return await ipcCall('db:getAllInvoices');
  }, [ipcCall]);

  const getArchivedInvoices = useCallback(async () => {
    return await ipcCall('db:getArchivedInvoices');
  }, [ipcCall]);

  const getInvoice = useCallback(async (id) => {
    return await ipcCall('db:getInvoice', id);
  }, [ipcCall]);

  const createInvoice = useCallback(async (invoice, items) => {
    return await ipcCall('db:createInvoice', invoice, items);
  }, [ipcCall]);

  const updateInvoice = useCallback(async (id, invoice, items) => {
    return await ipcCall('db:updateInvoice', id, invoice, items);
  }, [ipcCall]);

  const deleteInvoice = useCallback(async (id) => {
    return await ipcCall('db:deleteInvoice', id);
  }, [ipcCall]);

  const archiveInvoice = useCallback(async (id) => {
    return await ipcCall('db:archiveInvoice', id);
  }, [ipcCall]);

  const restoreInvoice = useCallback(async (id) => {
    return await ipcCall('db:restoreInvoice', id);
  }, [ipcCall]);

  const generateInvoiceNumber = useCallback(async () => {
    return await ipcCall('db:generateInvoiceNumber');
  }, [ipcCall]);

  // Saved Items
  const getAllSavedItems = useCallback(async () => {
    return await ipcCall('db:getAllSavedItems');
  }, [ipcCall]);

  const getSavedItem = useCallback(async (id) => {
    return await ipcCall('db:getSavedItem', id);
  }, [ipcCall]);

  const getSavedItemByItemNumber = useCallback(async (itemNumber) => {
    return await ipcCall('db:getSavedItemByItemNumber', itemNumber);
  }, [ipcCall]);

  const createSavedItem = useCallback(async (item) => {
    return await ipcCall('db:createSavedItem', item);
  }, [ipcCall]);

  const updateSavedItem = useCallback(async (id, item) => {
    return await ipcCall('db:updateSavedItem', id, item);
  }, [ipcCall]);

  const deleteSavedItem = useCallback(async (id) => {
    return await ipcCall('db:deleteSavedItem', id);
  }, [ipcCall]);

  // Dashboard
  const getDashboardStats = useCallback(async () => {
    return await ipcCall('db:getDashboardStats');
  }, [ipcCall]);

  // PDF Generation
  const saveInvoiceAsPDF = useCallback(async (invoiceHtml, invoiceNumber) => {
    return await ipcCall('pdf:saveInvoice', invoiceHtml, invoiceNumber);
  }, [ipcCall]);

  // Email Sending
  const sendInvoiceEmail = useCallback(async (emailData) => {
    return await ipcCall('email:sendInvoice', emailData);
  }, [ipcCall]);

  // Payments
  const createPayment = useCallback(async (payment) => {
    return await ipcCall('db:createPayment', payment);
  }, [ipcCall]);

  const getPaymentsByInvoice = useCallback(async (invoiceId) => {
    return await ipcCall('db:getPaymentsByInvoice', invoiceId);
  }, [ipcCall]);

  const deletePayment = useCallback(async (id) => {
    return await ipcCall('db:deletePayment', id);
  }, [ipcCall]);

  // Recurring Invoices
  const createRecurringInvoice = useCallback(async (recurringInvoice, items) => {
    return await ipcCall('db:createRecurringInvoice', recurringInvoice, items);
  }, [ipcCall]);

  const getAllRecurringInvoices = useCallback(async () => {
    return await ipcCall('db:getAllRecurringInvoices');
  }, [ipcCall]);

  const getRecurringInvoice = useCallback(async (id) => {
    return await ipcCall('db:getRecurringInvoice', id);
  }, [ipcCall]);

  const updateRecurringInvoice = useCallback(async (id, recurringInvoice, items) => {
    return await ipcCall('db:updateRecurringInvoice', id, recurringInvoice, items);
  }, [ipcCall]);

  const deleteRecurringInvoice = useCallback(async (id) => {
    return await ipcCall('db:deleteRecurringInvoice', id);
  }, [ipcCall]);

  const generateInvoiceFromRecurring = useCallback(async (recurringInvoiceId) => {
    return await ipcCall('db:generateInvoiceFromRecurring', recurringInvoiceId);
  }, [ipcCall]);

  // Quotes
  const generateQuoteNumber = useCallback(async () => {
    return await ipcCall('db:generateQuoteNumber');
  }, [ipcCall]);

  const createQuote = useCallback(async (quote, items) => {
    return await ipcCall('db:createQuote', quote, items);
  }, [ipcCall]);

  const getAllQuotes = useCallback(async () => {
    return await ipcCall('db:getAllQuotes');
  }, [ipcCall]);

  const getArchivedQuotes = useCallback(async () => {
    return await ipcCall('db:getArchivedQuotes');
  }, [ipcCall]);

  const getQuote = useCallback(async (id) => {
    return await ipcCall('db:getQuote', id);
  }, [ipcCall]);

  const updateQuote = useCallback(async (id, quote, items) => {
    return await ipcCall('db:updateQuote', id, quote, items);
  }, [ipcCall]);

  const deleteQuote = useCallback(async (id) => {
    return await ipcCall('db:deleteQuote', id);
  }, [ipcCall]);

  const archiveQuote = useCallback(async (id) => {
    return await ipcCall('db:archiveQuote', id);
  }, [ipcCall]);

  const restoreQuote = useCallback(async (id) => {
    return await ipcCall('db:restoreQuote', id);
  }, [ipcCall]);

  const convertQuoteToInvoice = useCallback(async (quoteId) => {
    return await ipcCall('db:convertQuoteToInvoice', quoteId);
  }, [ipcCall]);

  // Credit Notes
  const generateCreditNoteNumber = useCallback(async () => {
    return await ipcCall('db:generateCreditNoteNumber');
  }, [ipcCall]);

  const createCreditNote = useCallback(async (creditNote, items) => {
    return await ipcCall('db:createCreditNote', creditNote, items);
  }, [ipcCall]);

  const getAllCreditNotes = useCallback(async () => {
    return await ipcCall('db:getAllCreditNotes');
  }, [ipcCall]);

  const getCreditNote = useCallback(async (id) => {
    return await ipcCall('db:getCreditNote', id);
  }, [ipcCall]);

  const getCreditNotesByInvoice = useCallback(async (invoiceId) => {
    return await ipcCall('db:getCreditNotesByInvoice', invoiceId);
  }, [ipcCall]);

  const updateCreditNote = useCallback(async (id, creditNote, items) => {
    return await ipcCall('db:updateCreditNote', id, creditNote, items);
  }, [ipcCall]);

  const deleteCreditNote = useCallback(async (id) => {
    return await ipcCall('db:deleteCreditNote', id);
  }, [ipcCall]);

  const archiveCreditNote = useCallback(async (id) => {
    return await ipcCall('db:archiveCreditNote', id);
  }, [ipcCall]);

  // Expenses
  const generateExpenseNumber = useCallback(async () => {
    return await ipcCall('db:generateExpenseNumber');
  }, [ipcCall]);

  const createExpense = useCallback(async (expense) => {
    return await ipcCall('db:createExpense', expense);
  }, [ipcCall]);

  const getAllExpenses = useCallback(async () => {
    return await ipcCall('db:getAllExpenses');
  }, [ipcCall]);

  const getExpense = useCallback(async (id) => {
    return await ipcCall('db:getExpense', id);
  }, [ipcCall]);

  const updateExpense = useCallback(async (id, expense) => {
    return await ipcCall('db:updateExpense', id, expense);
  }, [ipcCall]);

  const deleteExpense = useCallback(async (id) => {
    return await ipcCall('db:deleteExpense', id);
  }, [ipcCall]);

  const getExpensesByClient = useCallback(async (clientId) => {
    return await ipcCall('db:getExpensesByClient', clientId);
  }, [ipcCall]);

  const getBillableExpenses = useCallback(async () => {
    return await ipcCall('db:getBillableExpenses');
  }, [ipcCall]);

  // Expense Categories
  const getAllExpenseCategories = useCallback(async () => {
    return await ipcCall('db:getAllExpenseCategories');
  }, [ipcCall]);

  const createExpenseCategory = useCallback(async (category) => {
    return await ipcCall('db:createExpenseCategory', category);
  }, [ipcCall]);

  const updateExpenseCategory = useCallback(async (id, category) => {
    return await ipcCall('db:updateExpenseCategory', id, category);
  }, [ipcCall]);

  const deleteExpenseCategory = useCallback(async (id) => {
    return await ipcCall('db:deleteExpenseCategory', id);
  }, [ipcCall]);

  // Reminder Templates
  const getAllReminderTemplates = useCallback(async () => {
    return await ipcCall('db:getAllReminderTemplates');
  }, [ipcCall]);

  const getReminderTemplate = useCallback(async (id) => {
    return await ipcCall('db:getReminderTemplate', id);
  }, [ipcCall]);

  const createReminderTemplate = useCallback(async (template) => {
    return await ipcCall('db:createReminderTemplate', template);
  }, [ipcCall]);

  const updateReminderTemplate = useCallback(async (id, template) => {
    return await ipcCall('db:updateReminderTemplate', id, template);
  }, [ipcCall]);

  const deleteReminderTemplate = useCallback(async (id) => {
    return await ipcCall('db:deleteReminderTemplate', id);
  }, [ipcCall]);

  // Invoice Reminders
  const createInvoiceReminder = useCallback(async (reminder) => {
    return await ipcCall('db:createInvoiceReminder', reminder);
  }, [ipcCall]);

  const getInvoiceReminders = useCallback(async (invoiceId) => {
    return await ipcCall('db:getInvoiceReminders', invoiceId);
  }, [ipcCall]);

  const getAllInvoiceReminders = useCallback(async () => {
    return await ipcCall('db:getAllInvoiceReminders');
  }, [ipcCall]);

  const deleteInvoiceReminder = useCallback(async (id) => {
    return await ipcCall('db:deleteInvoiceReminder', id);
  }, [ipcCall]);

  const getInvoicesNeedingReminders = useCallback(async () => {
    return await ipcCall('db:getInvoicesNeedingReminders');
  }, [ipcCall]);

  // Batch Operations
  const batchUpdateInvoiceStatus = useCallback(async (invoiceIds, status) => {
    return await ipcCall('db:batchUpdateInvoiceStatus', invoiceIds, status);
  }, [ipcCall]);

  const batchArchiveInvoices = useCallback(async (invoiceIds) => {
    return await ipcCall('db:batchArchiveInvoices', invoiceIds);
  }, [ipcCall]);

  const batchDeleteInvoices = useCallback(async (invoiceIds) => {
    return await ipcCall('db:batchDeleteInvoices', invoiceIds);
  }, [ipcCall]);

  // Payment Gateway
  const createStripePaymentLink = useCallback(async (paymentData) => {
    return await ipcCall('payment:createStripePaymentLink', paymentData);
  }, [ipcCall]);

  const createPayPalPaymentLink = useCallback(async (paymentData) => {
    return await ipcCall('payment:createPayPalPaymentLink', paymentData);
  }, [ipcCall]);

  const sendInvoiceWithPayment = useCallback(async (emailData) => {
    return await ipcCall('email:sendInvoiceWithPayment', emailData);
  }, [ipcCall]);

  return {
    loading,
    error,
    // Settings
    getSettings,
    updateSettings,
    // Clients
    getAllClients,
    getClient,
    getClientByCustomerNumber,
    createClient,
    updateClient,
    deleteClient,
    getClientStats,
    // Invoices
    getAllInvoices,
    getArchivedInvoices,
    getInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    archiveInvoice,
    restoreInvoice,
    generateInvoiceNumber,
    // Saved Items
    getAllSavedItems,
    getSavedItem,
    getSavedItemByItemNumber,
    createSavedItem,
    updateSavedItem,
    deleteSavedItem,
    // Dashboard
    getDashboardStats,
    // PDF
    saveInvoiceAsPDF,
    // Email
    sendInvoiceEmail,
    // Payments
    createPayment,
    getPaymentsByInvoice,
    deletePayment,
    // Recurring Invoices
    createRecurringInvoice,
    getAllRecurringInvoices,
    getRecurringInvoice,
    updateRecurringInvoice,
    deleteRecurringInvoice,
    generateInvoiceFromRecurring,
    // Quotes
    generateQuoteNumber,
    createQuote,
    getAllQuotes,
    getArchivedQuotes,
    getQuote,
    updateQuote,
    deleteQuote,
    archiveQuote,
    restoreQuote,
    convertQuoteToInvoice,
    // Credit Notes
    generateCreditNoteNumber,
    createCreditNote,
    getAllCreditNotes,
    getCreditNote,
    getCreditNotesByInvoice,
    updateCreditNote,
    deleteCreditNote,
    archiveCreditNote,
    // Expenses
    generateExpenseNumber,
    createExpense,
    getAllExpenses,
    getExpense,
    updateExpense,
    deleteExpense,
    getExpensesByClient,
    getBillableExpenses,
    // Expense Categories
    getAllExpenseCategories,
    createExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
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
    // Payment Gateway
    createStripePaymentLink,
    createPayPalPaymentLink,
    sendInvoiceWithPayment,
  };
};
