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

  // Estimates
  const generateEstimateNumber = useCallback(async () => {
    return await ipcCall('db:generateEstimateNumber');
  }, [ipcCall]);

  const createEstimate = useCallback(async (estimate, items) => {
    return await ipcCall('db:createEstimate', estimate, items);
  }, [ipcCall]);

  const getAllEstimates = useCallback(async () => {
    return await ipcCall('db:getAllEstimates');
  }, [ipcCall]);

  const getArchivedEstimates = useCallback(async () => {
    return await ipcCall('db:getArchivedEstimates');
  }, [ipcCall]);

  const getEstimate = useCallback(async (id) => {
    return await ipcCall('db:getEstimate', id);
  }, [ipcCall]);

  const updateEstimate = useCallback(async (id, estimate, items) => {
    return await ipcCall('db:updateEstimate', id, estimate, items);
  }, [ipcCall]);

  const deleteEstimate = useCallback(async (id) => {
    return await ipcCall('db:deleteEstimate', id);
  }, [ipcCall]);

  const archiveEstimate = useCallback(async (id) => {
    return await ipcCall('db:archiveEstimate', id);
  }, [ipcCall]);

  const restoreEstimate = useCallback(async (id) => {
    return await ipcCall('db:restoreEstimate', id);
  }, [ipcCall]);

  const convertEstimateToInvoice = useCallback(async (estimateId) => {
    return await ipcCall('db:convertEstimateToInvoice', estimateId);
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
  };
};
