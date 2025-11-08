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
    // Apply theme settings
    const headingFont = settings?.heading_font || 'Arial';
    const bodyFont = settings?.body_font || 'Arial';
    const headingSize = settings?.heading_size || 'normal';
    const bodySize = settings?.body_size || 'normal';
    const invoiceAccentColor = settings?.invoice_accent_color || '#3B82F6';
    const invoiceHeaderColor = settings?.invoice_header_color || '#1F2937';
    const textPrimaryColor = settings?.text_primary_color || '#111827';
    const textSecondaryColor = settings?.text_secondary_color || '#6B7280';
    const borderStyle = settings?.invoice_border_style || 'subtle';
    const tableStyle = settings?.invoice_table_style || 'striped';
    const spacing = settings?.invoice_spacing || 'normal';
    const cornerStyle = settings?.invoice_corner_style || 'rounded';
    const showLogo = settings?.show_logo_on_invoice !== false;
    const showAddress = settings?.show_company_address_on_invoice !== false;
    const showBorder = settings?.show_invoice_border !== false;
    const marginSize = settings?.pdf_margin_size || 'normal';
    const headerHeight = settings?.pdf_header_height || 'normal';

    // Font size mapping
    const headingSizeMap = { small: '28px', normal: '36px', large: '44px', 'extra-large': '52px' };
    const bodySizeMap = { small: '10pt', normal: '12pt', large: '14pt' };
    const headingFontSize = headingSizeMap[headingSize];
    const bodyFontSize = bodySizeMap[bodySize];

    // Spacing mapping
    const spacingMap = { compact: '20px', normal: '40px', spacious: '60px' };
    const sectionSpacing = spacingMap[spacing];

    // Margin mapping
    const marginMap = { narrow: '0.5in', normal: '1in', wide: '1.5in' };
    const pageMargin = marginMap[marginSize];

    // Header height mapping
    const headerHeightMap = { compact: '60px', normal: '80px', tall: '120px' };
    const logoHeight = headerHeightMap[headerHeight];

    // Border styling
    const borderStyleMap = {
      none: 'none',
      subtle: '1px solid #e5e7eb',
      bold: '3px solid ' + invoiceAccentColor,
      colored: '2px solid ' + invoiceAccentColor
    };
    const borderCSS = showBorder ? borderStyleMap[borderStyle] : 'none';

    // Corner styling
    const cornerMap = { square: '0', rounded: '8px', sharp: '0' };
    const borderRadius = cornerMap[cornerStyle];

    // Table row styling
    const tableRowBg = tableStyle === 'striped' ? '#f9fafb' : 'transparent';
    const tableBorder = tableStyle === 'bordered' ? '1px solid #e5e7eb' : tableStyle === 'minimal' ? 'none' : '1px solid #e5e7eb';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${fullInvoice.invoice_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: ${bodyFont}, sans-serif;
            padding: ${pageMargin};
            color: ${textPrimaryColor};
            font-size: ${bodyFontSize};
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            ${borderCSS !== 'none' ? `border: ${borderCSS}; padding: ${sectionSpacing}; border-radius: ${borderRadius};` : ''}
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: ${sectionSpacing};
            padding-bottom: 20px;
            border-bottom: 2px solid ${invoiceAccentColor};
          }
          ${showLogo && settings?.logo_url ? `
          .company-logo {
            height: ${logoHeight};
            margin-bottom: 15px;
          }` : ''}
          .company-info h2 {
            font-family: ${headingFont}, sans-serif;
            font-size: ${parseInt(headingFontSize) * 0.6}px;
            margin-bottom: 10px;
            color: ${invoiceHeaderColor};
          }
          .company-info p {
            font-size: ${parseInt(bodyFontSize) - 1}pt;
            color: ${textSecondaryColor};
            margin: 2px 0;
          }
          .invoice-title { text-align: right; }
          .invoice-title h1 {
            font-family: ${headingFont}, sans-serif;
            font-size: ${headingFontSize};
            color: ${invoiceHeaderColor};
            margin-bottom: 8px;
          }
          .invoice-title p {
            font-size: ${parseInt(bodyFontSize) + 2}pt;
            font-weight: bold;
            color: ${invoiceAccentColor};
          }
          .details {
            display: flex;
            justify-content: space-between;
            margin-bottom: ${sectionSpacing};
            padding: 20px 0;
            background: ${tableStyle === 'striped' ? '#f9fafb' : 'transparent'};
            ${tableStyle === 'bordered' ? `border: ${tableBorder}; padding: 20px;` : ''}
            border-radius: ${borderRadius};
          }
          .bill-to h3, .invoice-details h3 {
            font-size: ${parseInt(bodyFontSize) + 1}pt;
            color: ${invoiceHeaderColor};
            margin-bottom: 10px;
            font-weight: 700;
          }
          .bill-to p, .invoice-details p {
            font-size: ${bodyFontSize};
            color: ${textSecondaryColor};
            margin: 4px 0;
          }
          .invoice-details { text-align: right; }
          .status {
            display: inline-block;
            padding: 4px 12px;
            font-size: ${parseInt(bodyFontSize) - 2}pt;
            font-weight: bold;
            border-radius: ${borderRadius};
          }
          .status.paid { background: #d4edda; color: #155724; }
          .status.pending { background: #fff3cd; color: #856404; }
          .status.overdue { background: #f8d7da; color: #721c24; }
          .status.draft { background: #e2e3e5; color: #383d41; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: ${sectionSpacing};
            ${tableStyle === 'bordered' ? `border: ${tableBorder};` : ''}
          }
          thead tr {
            border-bottom: 2px solid ${invoiceAccentColor};
            background: ${tableStyle === 'striped' || tableStyle === 'bordered' ? '#f9fafb' : 'transparent'};
          }
          th {
            text-align: left;
            padding: ${spacing === 'compact' ? '8px' : spacing === 'spacious' ? '16px' : '12px'};
            font-size: ${bodyFontSize};
            font-weight: bold;
            color: ${invoiceHeaderColor};
            ${tableStyle === 'bordered' ? `border: ${tableBorder};` : ''}
          }
          th.text-center { text-align: center; }
          th.text-right { text-align: right; }
          tbody tr:nth-child(even) {
            background: ${tableStyle === 'striped' ? tableRowBg : 'transparent'};
          }
          td {
            padding: ${spacing === 'compact' ? '8px' : spacing === 'spacious' ? '16px' : '12px'};
            font-size: ${bodyFontSize};
            border-bottom: ${tableStyle === 'minimal' ? 'none' : tableBorder};
            ${tableStyle === 'bordered' ? `border: ${tableBorder};` : ''}
          }
          td.text-center { text-align: center; }
          td.text-right { text-align: right; }
          .totals {
            margin-left: auto;
            width: 320px;
            padding: 20px;
            background: ${tableStyle === 'striped' ? '#f9fafb' : 'transparent'};
            border-radius: ${borderRadius};
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: ${bodyFontSize};
            color: ${textSecondaryColor};
          }
          .totals-row.total {
            border-top: 2px solid ${invoiceAccentColor};
            padding-top: 12px;
            margin-top: 8px;
            font-size: ${parseInt(bodyFontSize) + 4}pt;
            font-weight: bold;
            color: ${textPrimaryColor};
          }
          .notes, .payment-terms, .bank-details {
            margin-bottom: ${parseInt(sectionSpacing) / 2}px;
            padding: 15px;
            background: ${tableStyle === 'striped' ? '#f9fafb' : 'transparent'};
            border-radius: ${borderRadius};
            ${tableStyle === 'bordered' ? `border: ${tableBorder};` : ''}
          }
          .notes h3, .payment-terms h3, .bank-details h3 {
            font-size: ${parseInt(bodyFontSize) + 1}pt;
            margin-bottom: 8px;
            color: ${invoiceHeaderColor};
            font-weight: 700;
          }
          .notes p, .payment-terms p, .bank-details p {
            font-size: ${bodyFontSize};
            color: ${textSecondaryColor};
            white-space: pre-wrap;
          }
          .footer {
            text-align: center;
            padding-top: ${sectionSpacing};
            margin-top: ${sectionSpacing};
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
            <p>${settings?.invoice_footer || 'Thank you for your business!'}</p>
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
        <div
          className={`bg-white shadow-lg p-12 ${
            settings?.invoice_corner_style === 'rounded' ? 'rounded-lg' :
            settings?.invoice_corner_style === 'sharp' ? '' : 'rounded-lg'
          }`}
          style={{
            border: settings?.show_invoice_border !== false ? (
              settings?.invoice_border_style === 'bold' ? `3px solid ${settings?.invoice_accent_color || '#3B82F6'}` :
              settings?.invoice_border_style === 'colored' ? `2px solid ${settings?.invoice_accent_color || '#3B82F6'}` :
              settings?.invoice_border_style === 'subtle' ? '1px solid #e5e7eb' :
              'none'
            ) : 'none',
            fontFamily: settings?.body_font || 'Inter',
            padding: settings?.invoice_spacing === 'compact' ? '2rem' :
                    settings?.invoice_spacing === 'spacious' ? '4rem' : '3rem'
          }}
        >
          {/* Company Header */}
          <div
            className="flex justify-between items-start mb-8 pb-6"
            style={{ borderBottom: `2px solid ${settings?.invoice_accent_color || '#3B82F6'}` }}
          >
            <div>
              {settings?.show_logo_on_invoice !== false && settings?.logo_url && (
                <img
                  src={settings.logo_url}
                  alt="Company Logo"
                  className="mb-4"
                  style={{
                    height: settings?.pdf_header_height === 'compact' ? '60px' :
                           settings?.pdf_header_height === 'tall' ? '120px' : '80px'
                  }}
                />
              )}
              <h2
                className="text-2xl font-bold mb-2"
                style={{
                  fontFamily: settings?.heading_font || 'Inter',
                  color: settings?.invoice_header_color || '#1F2937',
                  fontSize: settings?.heading_size === 'small' ? '1.25rem' :
                           settings?.heading_size === 'large' ? '2rem' :
                           settings?.heading_size === 'extra-large' ? '2.5rem' : '1.5rem'
                }}
              >
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
              <h1
                className="text-4xl font-bold"
                style={{
                  fontFamily: settings?.heading_font || 'Inter',
                  color: settings?.invoice_header_color || '#1F2937',
                  fontSize: settings?.heading_size === 'small' ? '1.75rem' :
                           settings?.heading_size === 'large' ? '2.75rem' :
                           settings?.heading_size === 'extra-large' ? '3.25rem' : '2.25rem'
                }}
              >
                INVOICE
              </h1>
              <p
                className="text-lg font-semibold mt-2"
                style={{ color: settings?.invoice_accent_color || '#3B82F6' }}
              >
                {fullInvoice.invoice_number}
              </p>
            </div>
          </div>

          {/* Invoice Details */}
          <div
            className={`grid grid-cols-2 gap-8 mb-8 p-5 ${
              settings?.invoice_corner_style === 'rounded' ? 'rounded-lg' :
              settings?.invoice_corner_style === 'sharp' ? '' : 'rounded-lg'
            }`}
            style={{
              background: settings?.invoice_table_style === 'striped' ? '#f9fafb' : 'transparent',
              border: settings?.invoice_table_style === 'bordered' ? '1px solid #e5e7eb' : 'none'
            }}
          >
            <div>
              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: settings?.invoice_header_color || '#1F2937' }}
              >
                BILL TO:
              </h3>
              <div style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                <p className="font-semibold" style={{ color: settings?.text_primary_color || '#111827' }}>
                  {fullInvoice.client_name}
                </p>
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
                  <span className="font-semibold" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                    Invoice Date:
                  </span>
                  <span style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                    {formatDate(fullInvoice.date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                    Due Date:
                  </span>
                  <span style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                    {formatDate(fullInvoice.due_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                    Status:
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold ${
                    settings?.invoice_corner_style === 'rounded' ? 'rounded-full' :
                    settings?.invoice_corner_style === 'sharp' ? '' : 'rounded-full'
                  } ${
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
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{
                  borderBottom: `2px solid ${settings?.invoice_accent_color || '#3B82F6'}`,
                  background: settings?.invoice_table_style === 'striped' || settings?.invoice_table_style === 'bordered' ? '#f9fafb' : 'transparent'
                }}>
                  <th
                    className="text-left py-3 px-2 font-semibold"
                    style={{
                      color: settings?.invoice_header_color || '#1F2937',
                      border: settings?.invoice_table_style === 'bordered' ? '1px solid #e5e7eb' : 'none',
                      padding: settings?.invoice_spacing === 'compact' ? '0.5rem' :
                              settings?.invoice_spacing === 'spacious' ? '1rem' : '0.75rem'
                    }}
                  >
                    Description
                  </th>
                  <th
                    className="text-center py-3 px-2 font-semibold"
                    style={{
                      color: settings?.invoice_header_color || '#1F2937',
                      border: settings?.invoice_table_style === 'bordered' ? '1px solid #e5e7eb' : 'none',
                      padding: settings?.invoice_spacing === 'compact' ? '0.5rem' :
                              settings?.invoice_spacing === 'spacious' ? '1rem' : '0.75rem'
                    }}
                  >
                    Qty
                  </th>
                  <th
                    className="text-right py-3 px-2 font-semibold"
                    style={{
                      color: settings?.invoice_header_color || '#1F2937',
                      border: settings?.invoice_table_style === 'bordered' ? '1px solid #e5e7eb' : 'none',
                      padding: settings?.invoice_spacing === 'compact' ? '0.5rem' :
                              settings?.invoice_spacing === 'spacious' ? '1rem' : '0.75rem'
                    }}
                  >
                    Rate
                  </th>
                  <th
                    className="text-right py-3 px-2 font-semibold"
                    style={{
                      color: settings?.invoice_header_color || '#1F2937',
                      border: settings?.invoice_table_style === 'bordered' ? '1px solid #e5e7eb' : 'none',
                      padding: settings?.invoice_spacing === 'compact' ? '0.5rem' :
                              settings?.invoice_spacing === 'spacious' ? '1rem' : '0.75rem'
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {fullInvoice.items && fullInvoice.items.map((item, index) => (
                  <tr
                    key={index}
                    style={{
                      background: settings?.invoice_table_style === 'striped' && index % 2 === 1 ? '#f9fafb' : 'transparent',
                      borderBottom: settings?.invoice_table_style === 'minimal' ? 'none' : '1px solid #e5e7eb'
                    }}
                  >
                    <td
                      className="py-3 px-2"
                      style={{
                        color: settings?.text_secondary_color || '#6B7280',
                        border: settings?.invoice_table_style === 'bordered' ? '1px solid #e5e7eb' : 'none',
                        padding: settings?.invoice_spacing === 'compact' ? '0.5rem' :
                                settings?.invoice_spacing === 'spacious' ? '1rem' : '0.75rem'
                      }}
                    >
                      {item.description}
                    </td>
                    <td
                      className="py-3 px-2 text-center"
                      style={{
                        color: settings?.text_secondary_color || '#6B7280',
                        border: settings?.invoice_table_style === 'bordered' ? '1px solid #e5e7eb' : 'none',
                        padding: settings?.invoice_spacing === 'compact' ? '0.5rem' :
                                settings?.invoice_spacing === 'spacious' ? '1rem' : '0.75rem'
                      }}
                    >
                      {item.quantity}
                    </td>
                    <td
                      className="py-3 px-2 text-right"
                      style={{
                        color: settings?.text_secondary_color || '#6B7280',
                        border: settings?.invoice_table_style === 'bordered' ? '1px solid #e5e7eb' : 'none',
                        padding: settings?.invoice_spacing === 'compact' ? '0.5rem' :
                                settings?.invoice_spacing === 'spacious' ? '1rem' : '0.75rem'
                      }}
                    >
                      {formatCurrency(item.rate)}
                    </td>
                    <td
                      className="py-3 px-2 text-right font-medium"
                      style={{
                        color: settings?.text_primary_color || '#111827',
                        border: settings?.invoice_table_style === 'bordered' ? '1px solid #e5e7eb' : 'none',
                        padding: settings?.invoice_spacing === 'compact' ? '0.5rem' :
                                settings?.invoice_spacing === 'spacious' ? '1rem' : '0.75rem'
                      }}
                    >
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div
              className={`w-80 space-y-2 p-5 ${
                settings?.invoice_corner_style === 'rounded' ? 'rounded-lg' :
                settings?.invoice_corner_style === 'sharp' ? '' : 'rounded-lg'
              }`}
              style={{
                background: settings?.invoice_table_style === 'striped' ? '#f9fafb' : 'transparent'
              }}
            >
              <div className="flex justify-between py-2">
                <span className="font-medium" style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                  Subtotal:
                </span>
                <span style={{ color: settings?.text_primary_color || '#111827' }}>
                  {formatCurrency(fullInvoice.subtotal)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium" style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                  Tax ({settings?.tax_rate || 0}%):
                </span>
                <span style={{ color: settings?.text_primary_color || '#111827' }}>
                  {formatCurrency(fullInvoice.tax)}
                </span>
              </div>
              <div
                className="flex justify-between py-3"
                style={{ borderTop: `2px solid ${settings?.invoice_accent_color || '#3B82F6'}` }}
              >
                <span className="text-xl font-bold" style={{ color: settings?.text_primary_color || '#111827' }}>
                  Total:
                </span>
                <span className="text-xl font-bold" style={{ color: settings?.text_primary_color || '#111827' }}>
                  {formatCurrency(fullInvoice.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {fullInvoice.notes && (
            <div
              className={`mb-6 p-4 ${
                settings?.invoice_corner_style === 'rounded' ? 'rounded-lg' :
                settings?.invoice_corner_style === 'sharp' ? '' : 'rounded-lg'
              }`}
              style={{
                background: settings?.invoice_table_style === 'striped' ? '#f9fafb' : 'transparent',
                border: settings?.invoice_table_style === 'bordered' ? '1px solid #e5e7eb' : 'none'
              }}
            >
              <h3 className="font-semibold mb-2" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                Notes:
              </h3>
              <p className="text-sm whitespace-pre-wrap" style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                {fullInvoice.notes}
              </p>
            </div>
          )}

          {/* Payment Terms */}
          {fullInvoice.payment_terms && (
            <div
              className={`mb-6 p-4 ${
                settings?.invoice_corner_style === 'rounded' ? 'rounded-lg' :
                settings?.invoice_corner_style === 'sharp' ? '' : 'rounded-lg'
              }`}
              style={{
                background: settings?.invoice_table_style === 'striped' ? '#f9fafb' : 'transparent',
                border: settings?.invoice_table_style === 'bordered' ? '1px solid #e5e7eb' : 'none'
              }}
            >
              <h3 className="font-semibold mb-2" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                Payment Terms:
              </h3>
              <p className="text-sm whitespace-pre-wrap" style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                {fullInvoice.payment_terms}
              </p>
            </div>
          )}

          {/* Bank Details */}
          {settings?.bank_details && (
            <div
              className={`mb-6 p-4 ${
                settings?.invoice_corner_style === 'rounded' ? 'rounded-lg' :
                settings?.invoice_corner_style === 'sharp' ? '' : 'rounded-lg'
              }`}
              style={{
                background: settings?.invoice_table_style === 'striped' ? '#f9fafb' : 'transparent',
                border: settings?.invoice_table_style === 'bordered' ? '1px solid #e5e7eb' : 'none'
              }}
            >
              <h3 className="font-semibold mb-2" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                Bank Details:
              </h3>
              <p className="text-sm whitespace-pre-wrap" style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                {settings.bank_details}
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
            <p>{settings?.invoice_footer || 'Thank you for your business!'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePreview;
