import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, TrendingUp, AlertCircle, Edit, Eye } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { formatCurrency } from '../utils/formatting';
import InvoiceForm from './InvoiceForm';
import InvoicePreview from './InvoicePreview';

function Dashboard({ onNavigateToInvoices }) {
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getDashboardStats, getAllInvoices } = useDatabase();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, invoicesData] = await Promise.all([
        getDashboardStats(),
        getAllInvoices()
      ]);
      setStats(statsData);
      setRecentInvoices(invoicesData.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
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
      await loadDashboardData();
    }
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
    setSelectedInvoice(null);
  };

  if (showForm) {
    return <InvoiceForm invoice={selectedInvoice} onClose={handleFormClose} />;
  }

  if (showPreview) {
    return <InvoicePreview invoice={selectedInvoice} onClose={handlePreviewClose} />;
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Revenue',
      value: stats?.total_revenue || 0,
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Invoices',
      value: stats?.total_invoices || 0,
      icon: FileText,
      color: 'bg-green-500',
      isCount: true,
    },
    {
      name: 'Paid',
      value: stats?.paid_amount || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      name: 'Outstanding',
      value: stats?.pending_amount || 0,
      icon: AlertCircle,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.isCount ? stat.value : formatCurrency(stat.value)}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
        </div>
        <div className="p-6">
          {recentInvoices.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No invoices yet. Create your first invoice to get started!</p>
          ) : (
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">{invoice.invoice_number}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{invoice.client_name}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(invoice.total)}</p>
                      <p className="text-sm text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(invoice)}
                        className="text-blue-600 hover:text-blue-900 p-2"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="text-gray-600 hover:text-gray-900 p-2"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
