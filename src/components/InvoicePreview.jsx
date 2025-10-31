import React, { useState, useEffect } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { formatCurrency, formatDate } from '../utils/formatting';

function InvoicePreview({ invoice, onClose }) {
  const [fullInvoice, setFullInvoice] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getInvoice, getSettings, saveInvoiceAsPDF } = useDatabase();

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
    // Add print class to body and trigger print
    document.body.classList.add('printing');
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing');
    }, 100);
  };

  const generateInvoiceHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${fullInvoice.invoice_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .company-info h2 { font-size: 24px; margin-bottom: 10px; }
          .company-info p { font-size: 12px; color: #666; margin: 2px 0; }
          .invoice-title { text-align: right; }
          .invoice-title h1 { font-size: 36px; color: #000; }
          .invoice-title p { font-size: 16px; font-weight: bold; color: #666; margin-top: 8px; }
          .details { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #ddd; }
          .bill-to h3, .invoice-details h3 { font-size: 12px; color: #000; margin-bottom: 10px; }
          .bill-to p, .invoice-details p { font-size: 12px; color: #666; margin: 4px 0; }
          .invoice-details { text-align: right; }
          .status { display: inline-block; padding: 4px 12px; font-size: 10px; font-weight: bold; border-radius: 12px; }
          .status.paid { background: #d4edda; color: #155724; }
          .status.pending { background: #fff3cd; color: #856404; }
          .status.overdue { background: #f8d7da; color: #721c24; }
          .status.draft { background: #e2e3e5; color: #383d41; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          thead tr { border-bottom: 2px solid #333; }
          th { text-align: left; padding: 12px 8px; font-size: 12px; font-weight: bold; }
          th.text-center { text-align: center; }
          th.text-right { text-align: right; }
          td { padding: 12px 8px; font-size: 12px; border-bottom: 1px solid #ddd; }
          td.text-center { text-align: center; }
          td.text-right { text-align: right; }
          .totals { margin-left: auto; width: 320px; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 12px; }
          .totals-row.total { border-top: 2px solid #333; padding-top: 12px; margin-top: 8px; font-size: 16px; font-weight: bold; }
          .notes, .payment-terms, .bank-details { margin-bottom: 20px; }
          .notes h3, .payment-terms h3, .bank-details h3 { font-size: 12px; margin-bottom: 8px; }
          .notes p, .payment-terms p, .bank-details p { font-size: 11px; color: #666; white-space: pre-wrap; }
          .footer { text-align: center; padding-top: 30px; margin-top: 30px; border-top: 1px solid #ddd; font-size: 11px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-info">
              <h2>${settings?.company_name || 'Your Company'}</h2>
              ${settings?.company_address ? `<p>${settings.company_address}</p>` : ''}
              ${settings?.company_city ? `<p>${settings.company_city}, ${settings.company_state} ${settings.company_zip}</p>` : ''}
              ${settings?.company_email ? `<p>${settings.company_email}</p>` : ''}
              ${settings?.company_phone ? `<p>${settings.company_phone}</p>` : ''}
            </div>
            <div class="invoice-title">
              <h1>INVOICE</h1>
              <p>${fullInvoice.invoice_number}</p>
            </div>
          </div>

          <div class="details">
            <div class="bill-to">
              <h3>BILL TO:</h3>
              <p><strong>${fullInvoice.client_name}</strong></p>
              ${fullInvoice.client_email ? `<p>${fullInvoice.client_email}</p>` : ''}
              ${fullInvoice.client_phone ? `<p>${fullInvoice.client_phone}</p>` : ''}
              ${fullInvoice.client_address ? `<p>${fullInvoice.client_address}</p>` : ''}
              ${fullInvoice.client_city ? `<p>${fullInvoice.client_city}, ${fullInvoice.client_state} ${fullInvoice.client_zip}</p>` : ''}
            </div>
            <div class="invoice-details">
              <p><strong>Invoice Date:</strong> ${formatDate(fullInvoice.date)}</p>
              <p><strong>Due Date:</strong> ${formatDate(fullInvoice.due_date)}</p>
              <p><strong>Status:</strong> <span class="status ${fullInvoice.status}">${fullInvoice.status.toUpperCase()}</span></p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${fullInvoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">${formatCurrency(item.rate)}</td>
                  <td class="text-right"><strong>${formatCurrency(item.amount)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(fullInvoice.subtotal)}</span>
            </div>
            <div class="totals-row">
              <span>Tax (${settings?.tax_rate || 0}%):</span>
              <span>${formatCurrency(fullInvoice.tax)}</span>
            </div>
            <div class="totals-row total">
              <span>Total:</span>
              <span>${formatCurrency(fullInvoice.total)}</span>
            </div>
          </div>

          ${fullInvoice.notes ? `
            <div class="notes">
              <h3>Notes:</h3>
              <p>${fullInvoice.notes}</p>
            </div>
          ` : ''}

          ${fullInvoice.payment_terms ? `
            <div class="payment-terms">
              <h3>Payment Terms:</h3>
              <p>${fullInvoice.payment_terms}</p>
            </div>
          ` : ''}

          ${settings?.bank_details ? `
            <div class="bank-details">
              <h3>Bank Details:</h3>
              <p>${settings.bank_details}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleDownload = async () => {
    try {
      const invoiceHtml = generateInvoiceHTML();
      const result = await saveInvoiceAsPDF(invoiceHtml, fullInvoice.invoice_number);

      if (result.success) {
        alert(`Invoice PDF saved successfully at: ${result.filePath}`);
      } else if (result.canceled) {
        // User canceled the save dialog
        console.log('PDF save canceled by user');
      }
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Error saving PDF: ' + error.message);
    }
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
