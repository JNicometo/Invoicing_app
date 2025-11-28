import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Mail, CheckCircle, XCircle, RefreshCcw } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { formatCurrency, formatDate } from '../utils/formatting';

function QuotePreview({ quote, onClose }) {
  const [fullEstimate, setFullEstimate] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    recipient: '',
    subject: '',
    body: '',
    cc: '',
    bcc: ''
  });
  const [sending, setSending] = useState(false);
  const [converting, setConverting] = useState(false);

  const {
    getQuote,
    getSettings,
    saveInvoiceAsPDF,
    sendInvoiceEmail,
    convertQuoteToInvoice,
    updateEstimate
  } = useDatabase();

  useEffect(() => {
    loadEstimateData();
  }, [quote]);

  const loadEstimateData = async () => {
    try {
      setLoading(true);
      const [estimateData, settingsData] = await Promise.all([
        getQuote(quote.id),
        getSettings()
      ]);
      setFullEstimate(estimateData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading quote:', error);
      alert('Error loading quote: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    document.body.classList.add('printing');
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing');
    }, 100);
  };

  const generateEstimateHTML = () => {
    const headingFont = settings?.heading_font || 'Arial';
    const bodyFont = settings?.body_font || 'Arial';
    const headingSize = settings?.heading_size || 'normal';
    const bodySize = settings?.body_size || 'normal';
    const estimateAccentColor = settings?.invoice_accent_color || '#6366F1'; // Indigo for estimates
    const estimateHeaderColor = settings?.invoice_header_color || '#1F2937';
    const textPrimaryColor = settings?.text_primary_color || '#111827';
    const textSecondaryColor = settings?.text_secondary_color || '#6B7280';
    const showLogo = settings?.show_logo_on_invoice !== false;
    const showAddress = settings?.show_company_address_on_invoice !== false;

    const headingSizeMap = { small: '28px', normal: '36px', large: '44px', 'extra-large': '52px' };
    const bodySizeMap = { small: '10pt', normal: '12pt', large: '14pt' };
    const headingFontSize = headingSizeMap[headingSize];
    const bodyFontSize = bodySizeMap[bodySize];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Quote ${fullEstimate.quote_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: ${bodyFont}, sans-serif;
            padding: 1in;
            color: ${textPrimaryColor};
            font-size: ${bodyFontSize};
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid ${estimateAccentColor};
          }
          ${showLogo && settings?.logo_url ? `
          .company-logo {
            height: 80px;
            margin-bottom: 15px;
          }` : ''}
          .company-info h2 {
            font-family: ${headingFont}, sans-serif;
            font-size: ${parseInt(headingFontSize) * 0.6}px;
            margin-bottom: 10px;
            color: ${estimateHeaderColor};
          }
          .company-info p {
            font-size: ${parseInt(bodyFontSize) - 1}pt;
            color: ${textSecondaryColor};
            margin: 2px 0;
          }
          .quote-title { text-align: right; }
          .quote-title h1 {
            font-family: ${headingFont}, sans-serif;
            font-size: ${headingFontSize};
            color: ${estimateHeaderColor};
            margin-bottom: 8px;
          }
          .quote-title p {
            font-size: ${parseInt(bodyFontSize) + 2}pt;
            font-weight: bold;
            color: ${estimateAccentColor};
          }
          .details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            padding: 20px 0;
          }
          .bill-to h3, .quote-details h3 {
            font-size: ${parseInt(bodyFontSize) + 1}pt;
            color: ${estimateHeaderColor};
            margin-bottom: 10px;
            font-weight: 700;
          }
          .bill-to p, .quote-details p {
            font-size: ${bodyFontSize};
            color: ${textSecondaryColor};
            margin: 4px 0;
          }
          .quote-details { text-align: right; }
          .status {
            display: inline-block;
            padding: 4px 12px;
            font-size: ${parseInt(bodyFontSize) - 2}pt;
            font-weight: bold;
            border-radius: 4px;
          }
          .status.draft { background: #e2e3e5; color: #383d41; }
          .status.sent { background: #cfe2ff; color: #084298; }
          .status.approved { background: #d4edda; color: #155724; }
          .status.declined { background: #f8d7da; color: #721c24; }
          .status.converted { background: #e0cffc; color: #5b21b6; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          thead tr {
            border-bottom: 2px solid ${estimateAccentColor};
            background: #f9fafb;
          }
          th {
            text-align: left;
            padding: 12px;
            font-size: ${bodyFontSize};
            font-weight: bold;
            color: ${estimateHeaderColor};
          }
          th.text-center { text-align: center; }
          th.text-right { text-align: right; }
          tbody tr:nth-child(even) {
            background: #f9fafb;
          }
          td {
            padding: 12px;
            font-size: ${bodyFontSize};
            border-bottom: 1px solid #e5e7eb;
          }
          td.text-center { text-align: center; }
          td.text-right { text-align: right; }
          .totals {
            margin-left: auto;
            width: 320px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: ${bodyFontSize};
            color: ${textSecondaryColor};
          }
          .totals-row.total {
            border-top: 2px solid ${estimateAccentColor};
            padding-top: 12px;
            margin-top: 8px;
            font-size: ${parseInt(bodyFontSize) + 4}pt;
            font-weight: bold;
            color: ${textPrimaryColor};
          }
          .notes, .terms {
            margin-bottom: 20px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
          }
          .notes h3, .terms h3 {
            font-size: ${parseInt(bodyFontSize) + 1}pt;
            margin-bottom: 8px;
            color: ${estimateHeaderColor};
            font-weight: 700;
          }
          .notes p, .terms p {
            font-size: ${bodyFontSize};
            color: ${textSecondaryColor};
            white-space: pre-wrap;
          }
          .footer {
            text-align: center;
            padding-top: 40px;
            margin-top: 40px;
            border-top: 1px solid ${textSecondaryColor};
            font-size: ${parseInt(bodyFontSize) - 1}pt;
            color: ${textSecondaryColor};
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-info">
              ${showLogo && settings?.logo_url ? `<img src="${settings.logo_url}" alt="Logo" class="company-logo" />` : ''}
              <h2>${settings?.company_name || 'Your Company'}</h2>
              ${showAddress ? `
                ${settings?.company_address ? `<p>${settings.company_address}</p>` : ''}
                ${settings?.company_city ? `<p>${settings.company_city}, ${settings.company_state} ${settings.company_zip}</p>` : ''}
              ` : ''}
              ${settings?.company_email ? `<p>${settings.company_email}</p>` : ''}
              ${settings?.company_phone ? `<p>${settings.company_phone}</p>` : ''}
            </div>
            <div class="quote-title">
              <h1>QUOTE</h1>
              <p>${fullEstimate.quote_number}</p>
            </div>
          </div>

          <div class="details">
            <div class="bill-to">
              <h3>PREPARED FOR:</h3>
              <p><strong>${fullEstimate.client_name}</strong></p>
              ${fullEstimate.client_email ? `<p>${fullEstimate.client_email}</p>` : ''}
              ${fullEstimate.client_phone ? `<p>${fullEstimate.client_phone}</p>` : ''}
              ${fullEstimate.client_address ? `<p>${fullEstimate.client_address}</p>` : ''}
              ${fullEstimate.client_city ? `<p>${fullEstimate.client_city}, ${fullEstimate.client_state} ${fullEstimate.client_zip}</p>` : ''}
            </div>
            <div class="quote-details">
              <p><strong>Quote Date:</strong> ${formatDate(fullEstimate.date)}</p>
              <p><strong>Valid Until:</strong> ${formatDate(fullEstimate.expiry_date)}</p>
              <p><strong>Status:</strong> <span class="status ${fullEstimate.status}">${fullEstimate.status.toUpperCase()}</span></p>
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
              ${fullEstimate.items.map(item => `
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
              <span>${formatCurrency(fullEstimate.subtotal)}</span>
            </div>
            <div class="totals-row">
              <span>Tax (${settings?.tax_rate || 0}%):</span>
              <span>${formatCurrency(fullEstimate.tax)}</span>
            </div>
            <div class="totals-row total">
              <span>Total:</span>
              <span>${formatCurrency(fullEstimate.total)}</span>
            </div>
          </div>

          ${fullEstimate.notes ? `
            <div class="notes">
              <h3>Notes:</h3>
              <p>${fullEstimate.notes}</p>
            </div>
          ` : ''}

          ${fullEstimate.terms ? `
            <div class="terms">
              <h3>Terms & Conditions:</h3>
              <p>${fullEstimate.terms}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p>${settings?.invoice_footer || 'Thank you for considering our services!'}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleDownload = async () => {
    try {
      const estimateHtml = generateEstimateHTML();
      const result = await saveInvoiceAsPDF(estimateHtml, fullEstimate.quote_number);

      if (result.success) {
        alert(`Quote PDF saved successfully at: ${result.filePath}`);
      }
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Error saving PDF: ' + error.message);
    }
  };

  const handleOpenEmailModal = () => {
    const subject = `Quote ${fullEstimate.quote_number} from ${settings?.company_name || 'Your Company'}`;
    const body = `Dear ${fullEstimate.client_name},\n\nPlease find attached quote ${fullEstimate.quote_number} for ${formatCurrency(fullEstimate.total)}.\n\nThis quote is valid until ${formatDate(fullEstimate.expiry_date)}.\n\nIf you have any questions or would like to proceed, please let us know.\n\nBest regards,\n${settings?.company_name || 'Your Company'}`;

    setEmailData({
      recipient: fullEstimate.client_email || '',
      subject: subject,
      body: body,
      cc: settings?.email_cc || '',
      bcc: settings?.email_bcc || ''
    });

    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!emailData.recipient || !emailData.recipient.trim()) {
      alert('Please enter a recipient email address');
      return;
    }

    if (!settings?.smtp_host || !settings?.smtp_user || !settings?.smtp_password) {
      alert('Email settings are not configured. Please configure SMTP settings in Settings.');
      return;
    }

    try {
      setSending(true);
      const estimateHtml = generateEstimateHTML();

      const result = await sendInvoiceEmail({
        settings,
        recipient: emailData.recipient,
        subject: emailData.subject,
        body: emailData.body,
        cc: emailData.cc,
        bcc: emailData.bcc,
        invoiceHtml: estimateHtml,
        invoiceNumber: fullEstimate.quote_number
      });

      if (result.success) {
        alert(result.message || 'Quote email sent successfully!');
        setShowEmailModal(false);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (fullEstimate.status !== 'approved') {
      if (!window.confirm('This quote is not marked as approved. Do you still want to convert it to an invoice?')) {
        return;
      }
    } else {
      if (!window.confirm('Convert this quote to an invoice? This will create a new invoice with the same details.')) {
        return;
      }
    }

    try {
      setConverting(true);
      const result = await convertQuoteToInvoice(fullEstimate.id);

      if (result) {
        alert(`Quote converted successfully! Invoice ${result.invoiceNumber} has been created.`);
        onClose(true); // Reload the quote list
      }
    } catch (error) {
      console.error('Error converting quote:', error);
      alert('Error converting quote: ' + error.message);
    } finally {
      setConverting(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await updateEstimate(fullEstimate.id, { ...fullEstimate, status: newStatus }, fullEstimate.items);
      await loadEstimateData();
      alert(`Quote marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status: ' + error.message);
    }
  };

  if (loading || !fullEstimate) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading quote...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h1 className="text-3xl font-bold text-gray-900">Quote Preview</h1>
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
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
            <button
              onClick={handleOpenEmailModal}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Status Actions */}
        {fullEstimate.status !== 'converted' && (
          <div className="bg-white shadow-lg rounded-lg p-4 mb-6 print:hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              <div className="flex space-x-3">
                {fullEstimate.status !== 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus('approved')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Approved
                  </button>
                )}
                {fullEstimate.status !== 'declined' && (
                  <button
                    onClick={() => handleUpdateStatus('declined')}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Mark as Declined
                  </button>
                )}
                <button
                  onClick={handleConvertToInvoice}
                  disabled={converting}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {converting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Converting...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Convert to Invoice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {fullEstimate.status === 'converted' && fullEstimate.converted_to_invoice_id && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 print:hidden">
            <p className="text-purple-900">
              <strong>This quote has been converted to an invoice</strong>
            </p>
          </div>
        )}

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Send Quote by Email</h2>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={emailData.recipient}
                      onChange={(e) => setEmailData(prev => ({ ...prev, recipient: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="client@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={emailData.subject}
                      onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={emailData.body}
                      onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                      rows="8"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CC</label>
                      <input
                        type="text"
                        value={emailData.cc}
                        onChange={(e) => setEmailData(prev => ({ ...prev, cc: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">BCC</label>
                      <input
                        type="text"
                        value={emailData.bcc}
                        onChange={(e) => setEmailData(prev => ({ ...prev, bcc: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <p className="text-sm text-indigo-800">
                      <strong>Attachment:</strong> Quote-{fullEstimate.quote_number}.pdf
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={sending}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={sending}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    {sending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quote Document */}
        <div className="bg-white shadow-lg p-12 rounded-lg">
          {/* Company Header */}
          <div
            className="flex justify-between items-start mb-8 pb-6"
            style={{ borderBottom: `2px solid ${settings?.invoice_accent_color || '#6366F1'}` }}
          >
            <div>
              {settings?.show_logo_on_invoice !== false && settings?.logo_url && (
                <img
                  src={settings.logo_url}
                  alt="Company Logo"
                  className="mb-4"
                  style={{ height: '80px' }}
                />
              )}
              <h2 className="text-2xl font-bold mb-2" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                {settings?.company_name || 'Your Company'}
              </h2>
              <div className="text-sm mt-2" style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                {settings?.show_company_address_on_invoice !== false && (
                  <>
                    {settings?.company_address && <p>{settings.company_address}</p>}
                    {settings?.company_city && (
                      <p>{settings.company_city}, {settings.company_state} {settings.company_zip}</p>
                    )}
                  </>
                )}
                {settings?.company_email && <p>{settings.company_email}</p>}
                {settings?.company_phone && <p>{settings.company_phone}</p>}
              </div>
            </div>

            <div className="text-right">
              <h1 className="text-4xl font-bold" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                QUOTE
              </h1>
              <p className="text-lg font-semibold mt-2" style={{ color: settings?.invoice_accent_color || '#6366F1' }}>
                {fullEstimate.quote_number}
              </p>
            </div>
          </div>

          {/* Quote Details */}
          <div className="grid grid-cols-2 gap-8 mb-8 p-5 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                PREPARED FOR:
              </h3>
              <div style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                <p className="font-semibold" style={{ color: settings?.text_primary_color || '#111827' }}>
                  {fullEstimate.client_name}
                </p>
                {fullEstimate.client_email && <p className="text-sm">{fullEstimate.client_email}</p>}
                {fullEstimate.client_phone && <p className="text-sm">{fullEstimate.client_phone}</p>}
                {fullEstimate.client_address && (
                  <>
                    <p className="text-sm mt-2">{fullEstimate.client_address}</p>
                    <p className="text-sm">
                      {fullEstimate.client_city}, {fullEstimate.client_state} {fullEstimate.client_zip}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                    Quote Date:
                  </span>
                  <span style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                    {formatDate(fullEstimate.date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                    Valid Until:
                  </span>
                  <span style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                    {formatDate(fullEstimate.expiry_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                    Status:
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    fullEstimate.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    fullEstimate.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    fullEstimate.status === 'approved' ? 'bg-green-100 text-green-800' :
                    fullEstimate.status === 'declined' ? 'bg-red-100 text-red-800' :
                    fullEstimate.status === 'converted' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {fullEstimate.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `2px solid ${settings?.invoice_accent_color || '#6366F1'}`, background: '#f9fafb' }}>
                  <th className="text-left py-3 px-2 font-semibold" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                    Description
                  </th>
                  <th className="text-center py-3 px-2 font-semibold" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                    Qty
                  </th>
                  <th className="text-right py-3 px-2 font-semibold" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                    Rate
                  </th>
                  <th className="text-right py-3 px-2 font-semibold" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {fullEstimate.items && fullEstimate.items.map((item, index) => (
                  <tr key={index} style={{ background: index % 2 === 1 ? '#f9fafb' : 'transparent', borderBottom: '1px solid #e5e7eb' }}>
                    <td className="py-3 px-2" style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                      {item.description}
                    </td>
                    <td className="py-3 px-2 text-center" style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                      {item.quantity}
                    </td>
                    <td className="py-3 px-2 text-right" style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="py-3 px-2 text-right font-medium" style={{ color: settings?.text_primary_color || '#111827' }}>
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80 space-y-2 p-5 bg-gray-50 rounded-lg">
              <div className="flex justify-between py-2">
                <span className="font-medium" style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                  Subtotal:
                </span>
                <span style={{ color: settings?.text_primary_color || '#111827' }}>
                  {formatCurrency(fullEstimate.subtotal)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium" style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                  Tax ({settings?.tax_rate || 0}%):
                </span>
                <span style={{ color: settings?.text_primary_color || '#111827' }}>
                  {formatCurrency(fullEstimate.tax)}
                </span>
              </div>
              <div
                className="flex justify-between py-3"
                style={{ borderTop: `2px solid ${settings?.invoice_accent_color || '#6366F1'}` }}
              >
                <span className="text-xl font-bold" style={{ color: settings?.text_primary_color || '#111827' }}>
                  Total:
                </span>
                <span className="text-xl font-bold" style={{ color: settings?.text_primary_color || '#111827' }}>
                  {formatCurrency(fullEstimate.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {fullEstimate.notes && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                Notes:
              </h3>
              <p className="text-sm whitespace-pre-wrap" style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                {fullEstimate.notes}
              </p>
            </div>
          )}

          {/* Terms */}
          {fullEstimate.terms && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                Terms & Conditions:
              </h3>
              <p className="text-sm whitespace-pre-wrap" style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                {fullEstimate.terms}
              </p>
            </div>
          )}

          {/* Footer */}
          <div
            className="text-center text-sm pt-8"
            style={{
              borderTop: `1px solid ${settings?.text_secondary_color || '#6B7280'}`,
              color: settings?.text_secondary_color || '#6B7280'
            }}
          >
            <p>{settings?.invoice_footer || 'Thank you for considering our services!'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuotePreview;
