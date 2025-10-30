import React, { useState, useEffect } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { formatCurrency, formatDate } from '../utils/formatting';

function InvoicePreview({ invoice, onClose }) {
  const [fullInvoice, setFullInvoice] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getInvoice, getSettings } = useDatabase();

  useEffect(() => {
    loadInvoiceData();
  }, [invoice]);

  const loadInvoiceData = async () => {
    try {
      setLoading(true);
      const [invoiceData, settingsData] = await Promise.all([
        getInvoice(invoice.id),
        getSettings()
      ]);
      setFullInvoice(invoiceData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading invoice:', error);
      alert('Error loading invoice: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('PDF download functionality will be implemented with jsPDF library');
  };

  if (loading || !fullInvoice) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h1 className="text-3xl font-bold text-gray-900">Invoice Preview</h1>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Invoice Document */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-12">
          {/* Company Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              {settings?.logo_url && (
                <img
                  src={settings.logo_url}
                  alt="Company Logo"
                  className="h-16 mb-4"
                />
              )}
              <h2 className="text-2xl font-bold text-gray-900">{settings?.company_name || 'Your Company'}</h2>
              <div className="text-sm text-gray-600 mt-2">
                {settings?.company_address && <p>{settings.company_address}</p>}
                {settings?.company_city && (
                  <p>{settings.company_city}, {settings.company_state} {settings.company_zip}</p>
                )}
                {settings?.company_email && <p>{settings.company_email}</p>}
                {settings?.company_phone && <p>{settings.company_phone}</p>}
              </div>
            </div>

            <div className="text-right">
              <h1 className="text-4xl font-bold text-gray-900">INVOICE</h1>
              <p className="text-lg font-semibold text-gray-700 mt-2">{fullInvoice.invoice_number}</p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">BILL TO:</h3>
              <div className="text-gray-700">
                <p className="font-semibold">{fullInvoice.client_name}</p>
                {fullInvoice.client_email && <p className="text-sm">{fullInvoice.client_email}</p>}
                {fullInvoice.client_phone && <p className="text-sm">{fullInvoice.client_phone}</p>}
                {fullInvoice.client_address && (
                  <>
                    <p className="text-sm mt-2">{fullInvoice.client_address}</p>
                    <p className="text-sm">
                      {fullInvoice.client_city}, {fullInvoice.client_state} {fullInvoice.client_zip}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Invoice Date:</span>
                  <span className="text-gray-700">{formatDate(fullInvoice.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Due Date:</span>
                  <span className="text-gray-700">{formatDate(fullInvoice.due_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Status:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    fullInvoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    fullInvoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    fullInvoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {fullInvoice.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Description</th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-900">Qty</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-900">Rate</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody>
                {fullInvoice.items && fullInvoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 px-2 text-gray-700">{item.description}</td>
                    <td className="py-3 px-2 text-center text-gray-700">{item.quantity}</td>
                    <td className="py-3 px-2 text-right text-gray-700">{formatCurrency(item.rate)}</td>
                    <td className="py-3 px-2 text-right text-gray-900 font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80 space-y-2">
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-700">Subtotal:</span>
                <span className="text-gray-900">{formatCurrency(fullInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-700">Tax ({settings?.tax_rate || 0}%):</span>
                <span className="text-gray-900">{formatCurrency(fullInvoice.tax)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-300">
                <span className="text-xl font-bold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(fullInvoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {fullInvoice.notes && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Notes:</h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{fullInvoice.notes}</p>
            </div>
          )}

          {/* Payment Terms */}
          {fullInvoice.payment_terms && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Payment Terms:</h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{fullInvoice.payment_terms}</p>
            </div>
          )}

          {/* Bank Details */}
          {settings?.bank_details && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Bank Details:</h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{settings.bank_details}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 pt-8 border-t">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePreview;
