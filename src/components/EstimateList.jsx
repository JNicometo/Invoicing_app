import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Archive, FileText, User, Filter, CheckCircle2, Clock, XCircle, RefreshCcw, X, AlertCircle } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { formatCurrency, formatDate } from '../utils/formatting';
import EstimateForm from './EstimateForm';
import EstimatePreview from './EstimatePreview';

function EstimateList() {
  const [estimates, setEstimates] = useState([]);
  const [filteredEstimates, setFilteredEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState(null);

  const { getAllEstimates, deleteEstimate, archiveEstimate, getAllClients, updateEstimate } = useDatabase();

  useEffect(() => {
    loadEstimates();
    loadClients();
  }, []);

  useEffect(() => {
    filterEstimates();
  }, [searchTerm, statusFilter, estimates, dateFrom, dateTo, clientFilter]);

  const loadEstimates = async () => {
    try {
      setLoading(true);
      const data = await getAllEstimates();
      setEstimates(data);
    } catch (error) {
      console.error('Error loading estimates:', error);
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

  const filterEstimates = () => {
    let filtered = [...estimates];

    // Filter by client dropdown
    if (clientFilter) {
      filtered = filtered.filter(est => est.client_id === parseInt(clientFilter));
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(est =>
        est.estimate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.client_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(est => est.status === statusFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(est => new Date(est.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(est => new Date(est.date) <= new Date(dateTo));
    }

    setFilteredEstimates(filtered);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setClientFilter('');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateFrom || dateTo || clientFilter;

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this estimate?')) {
      try {
        await deleteEstimate(id);
        await loadEstimates();
      } catch (error) {
        alert('Error deleting estimate: ' + error.message);
      }
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm('Archive this estimate?')) {
      try {
        await archiveEstimate(id);
        await loadEstimates();
      } catch (error) {
        alert('Error archiving estimate: ' + error.message);
      }
    }
  };

  const handleEdit = (estimate) => {
    // Don't allow editing converted estimates
    if (estimate.status === 'converted') {
      alert('Cannot edit a converted estimate. It has been converted to an invoice.');
      return;
    }
    setSelectedEstimate(estimate);
    setShowForm(true);
  };

  const handleView = (estimate) => {
    setSelectedEstimate(estimate);
    setShowPreview(true);
  };

  const handleFormClose = async (reload) => {
    setShowForm(false);
    setSelectedEstimate(null);
    if (reload) {
      await loadEstimates();
    }
  };

  const handlePreviewClose = async (reload) => {
    setShowPreview(false);
    setSelectedEstimate(null);
    if (reload) {
      await loadEstimates();
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'converted':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpiringSoon = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  };

  const isExpired = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  if (showForm) {
    return <EstimateForm estimate={selectedEstimate} onClose={handleFormClose} />;
  }

  if (showPreview) {
    return <EstimatePreview estimate={selectedEstimate} onClose={handlePreviewClose} />;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estimates</h1>
            <p className="text-gray-500 mt-1">Manage quotes and estimates</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Estimate
          </button>
        </div>

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
            onClick={() => setStatusFilter('draft')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 'draft'
                ? 'bg-gray-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Edit className="w-4 h-4 inline mr-1.5" />
            Draft
          </button>
          <button
            onClick={() => setStatusFilter('sent')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 'sent'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-1.5" />
            Sent
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 'approved'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-green-700 border border-green-300 hover:bg-green-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 inline mr-1.5" />
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('declined')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 'declined'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-red-700 border border-red-300 hover:bg-red-50'
            }`}
          >
            <XCircle className="w-4 h-4 inline mr-1.5" />
            Declined
          </button>
          <button
            onClick={() => setStatusFilter('converted')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 'converted'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-50'
            }`}
          >
            <RefreshCcw className="w-4 h-4 inline mr-1.5" />
            Converted
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
              placeholder="Search estimates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />

          <input
            type="date"
            placeholder="To Date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Results Summary */}
        <div className="mt-4 text-sm text-gray-600">
          Showing <strong>{filteredEstimates.length}</strong> of <strong>{estimates.length}</strong> estimates
        </div>
      </div>

      {/* Estimates Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading estimates...</p>
          </div>
        ) : filteredEstimates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No estimates found</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Your First Estimate
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estimate #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
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
              {filteredEstimates.map((estimate) => (
                <tr key={estimate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {estimate.estimate_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {estimate.client_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(estimate.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <span className={`${
                        isExpired(estimate.expiry_date) && estimate.status !== 'converted' && estimate.status !== 'approved' ? 'text-red-600 font-semibold' :
                        isExpiringSoon(estimate.expiry_date) && estimate.status !== 'converted' && estimate.status !== 'approved' ? 'text-orange-600 font-semibold' :
                        'text-gray-500'
                      }`}>
                        {formatDate(estimate.expiry_date)}
                      </span>
                      {isExpired(estimate.expiry_date) && estimate.status !== 'converted' && estimate.status !== 'approved' && (
                        <AlertCircle className="w-4 h-4 ml-1 text-red-600" title="Expired" />
                      )}
                      {isExpiringSoon(estimate.expiry_date) && estimate.status !== 'converted' && estimate.status !== 'approved' && (
                        <AlertCircle className="w-4 h-4 ml-1 text-orange-600" title="Expiring soon" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(estimate.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(estimate.status)}`}>
                      {estimate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleView(estimate)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {estimate.status !== 'converted' && (
                        <button
                          onClick={() => handleEdit(estimate)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleArchive(estimate.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(estimate.id)}
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

export default EstimateList;
