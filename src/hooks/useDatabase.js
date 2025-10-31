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

  return {
    loading,
    error,
    // Settings
    getSettings,
    updateSettings,
    // Clients
    getAllClients,
    getClient,
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
    createSavedItem,
    updateSavedItem,
    deleteSavedItem,
    // Dashboard
    getDashboardStats,
    // PDF
    saveInvoiceAsPDF,
  };
};
