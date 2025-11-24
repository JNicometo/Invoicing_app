import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Archive, Printer, FileText, User, Filter, CheckCircle2, Clock, AlertTriangle, X, CheckSquare, Square } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { formatCurrency, formatDate, getStatusBadgeColor } from '../utils/formatting';
import InvoiceForm from './InvoiceForm';
import InvoicePreview from './InvoicePreview';

function InvoiceList({ selectedClientId, selectedStatusFilter, onClearFilter }) {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(selectedStatusFilter || 'all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [clientName, setClientName] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  // Update status filter when prop changes
  useEffect(() => {
    if (selectedStatusFilter) {
      setStatusFilter(selectedStatusFilter);
    }
  }, [selectedStatusFilter]);

  const {
    getAllInvoices,
    deleteInvoice,
    archiveInvoice,
    getClient,
    getAllClients,
    updateInvoice,
    batchUpdateInvoiceStatus,
    batchArchiveInvoices,
    batchDeleteInvoices
  } = useDatabase();

  useEffect(() => {
    loadInvoices();
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      loadClientName();
    }
  }, [selectedClientId]);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, statusFilter, invoices, selectedClientId, dateFrom, dateTo, clientFilter]);

  const loadClientName = async () => {
    if (selectedClientId) {
      try {
        const client = await getClient(selectedClientId);
        setClientName(client?.name || '');
      } catch (error) {
        console.error('Error loading client:', error);
      }
    }
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await getAllInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const data = await getAllClients();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Filter by selected client (from Dashboard)
    if (selectedClientId) {
      filtered = filtered.filter(inv => inv.client_id === selectedClientId);
    }

    // Filter by client dropdown
    if (clientFilter) {
      filtered = filtered.filter(inv => inv.client_id === parseInt(clientFilter));
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(inv =>
        inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.client_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'unpaid') {
        // Unpaid includes both pending and overdue
        filtered = filtered.filter(inv => inv.status === 'pending' || inv.status === 'overdue');
      } else {
        filtered = filtered.filter(inv => inv.status === statusFilter);
      }
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(inv => new Date(inv.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(inv => new Date(inv.date) <= new Date(dateTo));
    }

    setFilteredInvoices(filtered);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setClientFilter('');
    if (onClearFilter) {
      onClearFilter();
    }
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateFrom || dateTo || clientFilter || selectedClientId;

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(id);
        await loadInvoices();
      } catch (error) {
        alert('Error deleting invoice: ' + error.message);
      }
    }
  };


  const handleArchive = async (id) => {
    if (window.confirm('Archive this invoice?')) {
      try {
        await archiveInvoice(id);
        await loadInvoices();
      } catch (error) {
        alert('Error archiving invoice: ' + error.message);
      }
    }
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setShowForm(true);
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };

  const handleFormClose = async (reload) => {
    setShowForm(false);
    setSelectedInvoice(null);
    if (reload) {
      await loadInvoices();
    }
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
    setSelectedInvoice(null);
  };

  const handleToggleInvoice = (id) => {
    setSelectedInvoices(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map(inv => inv.id));
    }
  };

  const handleBulkMarkPaid = async () => {
    if (selectedInvoices.length === 0) return;

    if (window.confirm(`Mark ${selectedInvoices.length} invoice(s) as paid?`)) {
      try {
        await batchUpdateInvoiceStatus(selectedInvoices, 'paid');
        setSelectedInvoices([]);
        await loadInvoices();
      } catch (error) {
        alert('Error updating invoices: ' + error.message);
      }
    }
  };

  const handleBulkArchive = async () => {
    if (selectedInvoices.length === 0) return;

    if (window.confirm(`Archive ${selectedInvoices.length} invoice(s)?`)) {
      try {
        await batchArchiveInvoices(selectedInvoices);
        setSelectedInvoices([]);
        await loadInvoices();
      } catch (error) {
        alert('Error archiving invoices: ' + error.message);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedInvoices.length === 0) return;

    if (window.confirm(`Delete ${selectedInvoices.length} invoice(s) permanently? This cannot be undone.`)) {
      try {
        await batchDeleteInvoices(selectedInvoices);
        setSelectedInvoices([]);
        await loadInvoices();
      } catch (error) {
        alert('Error deleting invoices: ' + error.message);
      }
    }
  };

  if (showForm) {
    return <InvoiceForm invoice={selectedInvoice} onClose={handleFormClose} />;
  }

  if (showPreview) {
    return <InvoicePreview invoice={selectedInvoice} onClose={handlePreviewClose} />;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-500 mt-1">Manage all your invoices</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Invoice
          </button>
        </div>

        {/* Client Filter Banner */}
        {selectedClientId && clientName && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              <span className="text-sm text-blue-900">
                Showing invoices for <strong>{clientName}</strong>
              </span>
            </div>
            <button
              onClick={onClearFilter}
              className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center"
            >
              Clear filter
              <span className="ml-1 text-lg">×</span>
            </button>
          </div>
        )}

        {/* Quick Status Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-1.5" />
            All
          </button>
          <button
            onClick={() => setStatusFilter('unpaid')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 'unpaid'
                ? 'bg-yellow-600 text-white shadow-md'
                : 'bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-1.5" />
            Unpaid
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 'paid'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-green-700 border border-green-300 hover:bg-green-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 inline mr-1.5" />
            Paid
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 'overdue'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-red-700 border border-red-300 hover:bg-red-50'
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline mr-1.5" />
            Overdue
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="ml-auto px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all flex items-center"
            >
              <X className="w-4 h-4 mr-1.5" />
              Clear All Filters
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            placeholder="From Date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            type="date"
            placeholder="To Date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Results Summary */}
        <div className="mt-4 text-sm text-gray-600">
          Showing <strong>{filteredInvoices.length}</strong> of <strong>{invoices.length}</strong> invoices
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedInvoices.length > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium text-blue-900">
              {selectedInvoices.length} invoice{selectedInvoices.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleBulkMarkPaid}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Mark as Paid
            </button>
            <button
              onClick={handleBulkArchive}
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <Archive className="w-4 h-4 mr-1.5" />
              Archive
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete
            </button>
            <button
              onClick={() => setSelectedInvoices([])}
              className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No invoices found</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Invoice
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                    onChange={handleToggleAll}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className={`hover:bg-gray-50 ${selectedInvoices.includes(invoice.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={() => handleToggleInvoice(invoice.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.client_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(invoice.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(invoice.due_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(invoice.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleView(invoice)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleArchive(invoice.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default InvoiceList;
