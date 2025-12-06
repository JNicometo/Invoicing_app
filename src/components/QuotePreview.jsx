import React, { useState, useEffect, useCallback } from 'react';
import { X, Printer, Download, Mail, DollarSign, CreditCard, Trash2 } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { formatCurrency, formatDate } from '../utils/formatting';

function QuotePreview({ quote, onClose }) {
  const [fullQuote, setFullQuote] = useState(null);
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
  const [payments, setPayments] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'Cash',
    reference_number: '',
    notes: ''
  });
  const [savingPayment, setSavingPayment] = useState(false);
  const [showCardPaymentModal, setShowCardPaymentModal] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expMonth: '',
    expYear: '',
    cvc: '',
  });
  const [processingCardPayment, setProcessingCardPayment] = useState(false);
  const { getQuote, getSettings, savePDF, sendInvoiceEmail, createPayment, getPaymentsByQuote, deletePayment } = useDatabase();

  const loadQuoteData = useCallback(async () => {
    try {
      setLoading(true);
      const [quoteData, settingsData] = await Promise.all([
        getQuote(quote.id),
        getSettings()
      ]);
      setFullQuote(quoteData);
      setSettings(settingsData);

      // Load payments
      const paymentsData = await getPaymentsByQuote(quote.id);
      setPayments(paymentsData || []);
      const total = (paymentsData || []).reduce((sum, p) => sum + p.amount, 0);
      setTotalPaid(total);
    } catch (error) {
      console.error('Error loading quote:', error);
      alert('Error loading quote: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [quote.id, getQuote, getSettings, getPaymentsByQuote]);

  useEffect(() => {
    loadQuoteData();
  }, [loadQuoteData]);

  const loadPayments = async (invoiceId) => {
    try {
      const paymentsData = await getPaymentsByQuote(invoiceId || quote.id);
      setPayments(paymentsData || []);
      const total = (paymentsData || []).reduce((sum, p) => sum + p.amount, 0);
      setTotalPaid(total);
    } catch (error) {
      console.error('Error loading payments:', error);
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

  const generateQuoteHTML = () => {
    // Apply theme settings
    const headingFont = settings?.heading_font || 'Arial';
    const bodyFont = settings?.body_font || 'Arial';
    const headingSize = settings?.heading_size || 'normal';
    const bodySize = settings?.body_size || 'normal';
    const quoteAccentColor = settings?.invoice_accent_color || '#3B82F6';
    const quoteHeaderColor = settings?.invoice_header_color || '#1F2937';
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

    // Spacing mapping - reduced for better single-page fit
    const spacingMap = { compact: '15px', normal: '25px', spacious: '40px' };
    const sectionSpacing = spacingMap[spacing];

    // Margin mapping - reduced for better single-page fit
    const marginMap = { narrow: '0.3in', normal: '0.5in', wide: '0.75in' };
    const pageMargin = marginMap[marginSize];

    // Header height mapping
    const headerHeightMap = { compact: '60px', normal: '80px', tall: '120px' };
    const logoHeight = headerHeightMap[headerHeight];

    // Border styling
    const borderStyleMap = {
      none: 'none',
      subtle: '1px solid #e5e7eb',
      bold: '3px solid ' + quoteAccentColor,
      colored: '2px solid ' + quoteAccentColor
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
        <title>Quote ${fullQuote.quote_number}</title>
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
            margin-bottom: ${parseInt(sectionSpacing) * 0.8}px;
            padding-bottom: 15px;
            border-bottom: 2px solid ${quoteAccentColor};
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
            color: ${quoteHeaderColor};
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
            color: ${quoteHeaderColor};
            margin-bottom: 8px;
          }
          .quote-title p {
            font-size: ${parseInt(bodyFontSize) + 2}pt;
            font-weight: bold;
            color: ${quoteAccentColor};
          }
          .details {
            display: flex;
            justify-content: space-between;
            margin-bottom: ${parseInt(sectionSpacing) * 0.7}px;
            padding: 15px 0;
            background: ${tableStyle === 'striped' ? '#f9fafb' : 'transparent'};
            ${tableStyle === 'bordered' ? `border: ${tableBorder}; padding: 15px;` : ''}
            border-radius: ${borderRadius};
          }
          .bill-to h3, .quote-details h3 {
            font-size: ${parseInt(bodyFontSize) + 1}pt;
            color: ${quoteHeaderColor};
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
            border-radius: ${borderRadius};
          }
          .status.paid { background: #d4edda; color: #155724; }
          .status.pending { background: #fff3cd; color: #856404; }
          .status.overdue { background: #f8d7da; color: #721c24; }
          .status.draft { background: #e2e3e5; color: #383d41; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: ${parseInt(sectionSpacing) * 0.7}px;
            ${tableStyle === 'bordered' ? `border: ${tableBorder};` : ''}
          }
          thead tr {
            border-bottom: 2px solid ${quoteAccentColor};
            background: ${tableStyle === 'striped' || tableStyle === 'bordered' ? '#f9fafb' : 'transparent'};
          }
          th {
            text-align: left;
            padding: ${spacing === 'compact' ? '8px' : spacing === 'spacious' ? '16px' : '12px'};
            font-size: ${bodyFontSize};
            font-weight: bold;
            color: ${quoteHeaderColor};
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
            border-top: 2px solid ${quoteAccentColor};
            padding-top: 12px;
            margin-top: 8px;
            font-size: ${parseInt(bodyFontSize) + 4}pt;
            font-weight: bold;
            color: ${textPrimaryColor};
          }
          .notes, .payment-terms, .bank-details {
            margin-bottom: ${parseInt(sectionSpacing) * 0.4}px;
            padding: 12px;
            background: ${tableStyle === 'striped' ? '#f9fafb' : 'transparent'};
            border-radius: ${borderRadius};
            ${tableStyle === 'bordered' ? `border: ${tableBorder};` : ''}
          }
          .notes h3, .payment-terms h3, .bank-details h3 {
            font-size: ${parseInt(bodyFontSize) + 1}pt;
            margin-bottom: 8px;
            color: ${quoteHeaderColor};
            font-weight: 700;
          }
          .notes p, .payment-terms p, .bank-details p {
            font-size: ${bodyFontSize};
            color: ${textSecondaryColor};
            white-space: pre-wrap;
          }
          .footer {
            text-align: center;
            padding-top: ${parseInt(sectionSpacing) * 0.6}px;
            margin-top: ${parseInt(sectionSpacing) * 0.6}px;
            border-top: 1px solid ${textSecondaryColor};
            font-size: ${parseInt(bodyFontSize) - 1}pt;
            color: ${textSecondaryColor};
          }
          @media print {
            body { margin: 0; padding: ${pageMargin}; }
            .container { page-break-inside: avoid; }
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
              <p>${fullQuote.quote_number}</p>
            </div>
          </div>

          <div class="details">
            <div class="bill-to">
              <h3>BILL TO:</h3>
              <p><strong>${fullQuote?.client_name || 'Client Name'}</strong></p>
              ${fullQuote?.client_email ? `<p>${fullQuote.client_email}</p>` : ''}
              ${fullQuote?.client_phone ? `<p>${fullQuote.client_phone}</p>` : ''}
              ${fullQuote?.client_address ? `<p>${fullQuote.client_address}</p>` : ''}
              ${fullQuote?.client_city ? `<p>${fullQuote.client_city}, ${fullQuote.client_state || ''} ${fullQuote.client_zip || ''}</p>` : ''}
            </div>
            <div class="quote-details">
              <p><strong>Quote Date:</strong> ${formatDate(fullQuote?.date || '')}</p>
              <p><strong>Valid Until:</strong> ${formatDate(fullQuote?.expiry_date || '')}</p>
              <p><strong>Status:</strong> <span class="status ${fullQuote?.status || 'pending'}">${(fullQuote?.status || 'pending').toUpperCase()}</span></p>
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
              ${(fullQuote.items || []).map(item => `
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
              <span>${formatCurrency(fullQuote?.subtotal || 0)}</span>
            </div>
            <div class="totals-row">
              <span>Tax (${settings?.tax_rate || 0}%):</span>
              <span>${formatCurrency(fullQuote?.tax || 0)}</span>
            </div>
            <div class="totals-row total">
              <span>Total:</span>
              <span>${formatCurrency(fullQuote?.total || 0)}</span>
            </div>
          </div>

          ${fullQuote?.notes ? `
            <div class="notes">
              <h3>Notes:</h3>
              <p>${fullQuote.notes}</p>
            </div>
          ` : ''}

          ${fullQuote?.terms ? `
            <div class="payment-terms">
              <h3>Terms:</h3>
              <p>${fullQuote.terms}</p>
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
      const quoteHtml = generateQuoteHTML();
      const result = await savePDF(quoteHtml, fullQuote.quote_number);

      if (result.success) {
        alert(`Quote PDF saved successfully at: ${result.filePath}`);
      } else if (result.canceled) {
        // User canceled the save dialog
        console.log('PDF save canceled by user');
      }
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Error saving PDF: ' + error.message);
    }
  };

  const handleOpenEmailModal = () => {
    // Populate email template variables
    const subject = (settings?.email_subject_template || 'Quote {quote_number} from {company_name}')
      .replace('{quote_number}', fullQuote?.quote_number || '')
      .replace('{company_name}', settings?.company_name || '')
      .replace('{total}', formatCurrency(fullQuote?.total || 0));

    const body = (settings?.email_body_template || 'Dear {client_name},\n\nPlease find attached quote {quote_number} for {total}.\n\nThank you for your business!\n\nBest regards,\n{company_name}')
      .replace('{client_name}', fullQuote?.client_name || 'Valued Customer')
      .replace('{quote_number}', fullQuote?.quote_number || '')
      .replace('{total}', formatCurrency(fullQuote?.total || 0))
      .replace('{expiry_date}', formatDate(fullQuote?.expiry_date || ''))
      .replace('{company_name}', settings?.company_name || '');

    setEmailData({
      recipient: fullQuote.client_email || '',
      subject: subject,
      body: body,
      cc: settings?.email_cc || '',
      bcc: settings?.email_bcc || ''
    });

    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    // Validate
    if (!emailData.recipient || !emailData.recipient.trim()) {
      alert('Please enter a recipient email address');
      return;
    }

    if (!settings?.smtp_host || !settings?.smtp_user || !settings?.smtp_password) {
      alert('Email settings are not configured. Please configure SMTP settings in Settings > Email Templates.');
      return;
    }

    if (!fullQuote || !fullQuote.items || fullQuote.items.length === 0) {
      alert('Quote data is not fully loaded. Please wait a moment and try again.');
      return;
    }

    try {
      setSending(true);
      const quoteHtml = generateQuoteHTML();

      const result = await sendInvoiceEmail({
        settings,
        recipient: emailData.recipient,
        subject: emailData.subject,
        body: emailData.body,
        cc: emailData.cc,
        bcc: emailData.bcc,
        quoteHtml,
        quoteNumber: fullQuote.quote_number
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

  const handleOpenPaymentModal = () => {
    // Reset payment form with remaining balance as suggested amount
    const balanceDue = fullQuote.total - totalPaid;
    setPaymentData({
      amount: balanceDue > 0 ? balanceDue.toFixed(2) : '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'Cash',
      reference_number: '',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async () => {
    // Validate
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    try {
      setSavingPayment(true);
      await createPayment({
        invoice_id: fullQuote.id,
        amount: parseFloat(paymentData.amount),
        payment_date: paymentData.payment_date,
        payment_method: paymentData.payment_method,
        reference_number: paymentData.reference_number,
        notes: paymentData.notes
      });

      // Reload payments and quote to get updated status
      await Promise.all([
        loadPayments(fullQuote.id),
        loadQuoteData()
      ]);

      alert('Payment recorded successfully!');
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Error recording payment: ' + error.message);
    } finally {
      setSavingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment? This will update the quote status.')) {
      return;
    }

    try {
      await deletePayment(paymentId);

      // Reload payments and quote
      await Promise.all([
        loadPayments(fullQuote.id),
        loadQuoteData()
      ]);

      alert('Payment deleted successfully');
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Error deleting payment: ' + error.message);
    }
  };

  const handleProcessCardPayment = async () => {
    // Validate card details
    if (!cardDetails.number || !cardDetails.name || !cardDetails.expMonth || !cardDetails.expYear || !cardDetails.cvc) {
      alert('Please fill in all card details');
      return;
    }

    // Basic card number validation
    const cardNumber = cardDetails.number.replace(/\s/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      alert('Please enter a valid card number');
      return;
    }

    // Validate expiry
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const expYear = parseInt(cardDetails.expYear);
    const expMonth = parseInt(cardDetails.expMonth);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      alert('Card has expired');
      return;
    }

    // Validate CVC
    if (cardDetails.cvc.length < 3 || cardDetails.cvc.length > 4) {
      alert('Please enter a valid CVC');
      return;
    }

    try {
      setProcessingCardPayment(true);

      // Calculate balance due
      const balanceDue = Math.max(0, fullQuote.total - totalPaid);

      // Step 1: Create payment intent
      const intentResult = await window.electron.ipcRenderer.invoke('payment:createPaymentIntent', {
        settings,
        quote: fullQuote,
        client: { id: fullQuote.client_id, name: fullQuote.client_name },
        amount: balanceDue,
      });

      if (!intentResult.success) {
        throw new Error('Failed to create payment intent');
      }

      // Step 2: Process card payment
      const paymentResult = await window.electron.ipcRenderer.invoke('payment:processCardPayment', {
        settings,
        cardDetails,
        clientSecret: intentResult.clientSecret,
      });

      if (paymentResult.success) {
        // Record the payment in the database
        await createPayment({
          invoice_id: fullQuote.id,
          amount: balanceDue,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: 'Credit Card (Stripe)',
          reference_number: paymentResult.paymentIntentId,
          notes: 'Online payment via Stripe'
        });

        // Reload payments and quote to get updated status
        await Promise.all([
          loadPayments(fullQuote.id),
          loadQuoteData()
        ]);

        alert('Payment successful! Thank you for your payment.');
        setShowCardPaymentModal(false);

        // Reset card details
        setCardDetails({
          number: '',
          name: '',
          expMonth: '',
          expYear: '',
          cvc: '',
        });
      } else {
        alert(paymentResult.message || 'Payment failed. Please try again.');
      }

    } catch (error) {
      console.error('Error processing card payment:', error);
      alert('Payment failed: ' + error.message);
    } finally {
      setProcessingCardPayment(false);
    }
  };

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add space every 4 digits
    const formatted = digits.match(/.{1,4}/g)?.join(' ') || digits;
    return formatted;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 19) {
      setCardDetails(prev => ({ ...prev, number: formatted }));
    }
  };

  if (loading || !fullQuote) {
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
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

        {/* Payment Tracking Section */}
        {fullQuote && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6 print:hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-green-600" />
                Payment Tracking
              </h2>
              <div className="flex space-x-2">
                {settings?.stripe_enabled && (fullQuote.total - totalPaid) > 0 && (
                  <button
                    onClick={() => setShowCardPaymentModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay with Card
                  </button>
                )}
                <button
                  onClick={handleOpenPaymentModal}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Record Payment
                </button>
              </div>
            </div>

            {/* Balance Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">Total Amount</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(fullQuote.total)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 font-medium">Total Paid</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(totalPaid)}</p>
              </div>
              <div className={`p-4 rounded-lg border ${
                fullQuote.total - totalPaid > 0 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <p className={`text-sm font-medium ${
                  fullQuote.total - totalPaid > 0 ? 'text-orange-600' : 'text-gray-600'
                }`}>Balance Due</p>
                <p className={`text-2xl font-bold ${
                  fullQuote.total - totalPaid > 0 ? 'text-orange-900' : 'text-gray-900'
                }`}>{formatCurrency(Math.max(0, fullQuote.total - totalPaid))}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Payment Progress</span>
                <span>{fullQuote.total > 0 ? Math.min(100, Math.round((totalPaid / fullQuote.total) * 100)) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    totalPaid >= fullQuote.total ? 'bg-green-600' :
                    totalPaid > 0 ? 'bg-yellow-500' : 'bg-gray-300'
                  }`}
                  style={{ width: `${fullQuote.total > 0 ? Math.min(100, (totalPaid / fullQuote.total) * 100) : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Payment History */}
            {payments.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Method</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reference</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Notes</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">{formatDate(payment.payment_date)}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-green-600">{formatCurrency(payment.amount)}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{payment.payment_method}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{payment.reference_number || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{payment.notes || '-'}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete payment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No payments recorded yet</p>
                <p className="text-sm mt-1">Click "Record Payment" to add a payment</p>
              </div>
            )}
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Record Payment</h2>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Balance due: {formatCurrency(Math.max(0, fullQuote.total - totalPaid))}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={paymentData.payment_date}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, payment_date: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={paymentData.payment_method}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, payment_method: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Check">Check</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="ACH">ACH</option>
                      <option value="Wire Transfer">Wire Transfer</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Venmo">Venmo</option>
                      <option value="Zelle">Zelle</option>
                      <option value="Stripe">Stripe</option>
                      <option value="Square">Square</option>
                      <option value="Apple Pay">Apple Pay</option>
                      <option value="Google Pay">Google Pay</option>
                      <option value="Cryptocurrency">Cryptocurrency</option>
                      <option value="Money Order">Money Order</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      value={paymentData.reference_number}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, reference_number: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Check #, Transaction ID, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Additional notes about this payment..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={savingPayment}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRecordPayment}
                    disabled={savingPayment}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {savingPayment ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Record Payment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
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
                      placeholder="Quote subject"
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
                      placeholder="Email message..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CC
                      </label>
                      <input
                        type="text"
                        value={emailData.cc}
                        onChange={(e) => setEmailData(prev => ({ ...prev, cc: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="accounting@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        BCC
                      </label>
                      <input
                        type="text"
                        value={emailData.bcc}
                        onChange={(e) => setEmailData(prev => ({ ...prev, bcc: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="records@example.com"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Attachment:</strong> Quote-{fullQuote.quote_number}.pdf
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
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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

        {/* Card Payment Modal */}
        {showCardPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Pay with Credit Card</h2>
                  <button
                    onClick={() => setShowCardPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={processingCardPayment}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Amount Due:</strong> {formatCurrency(Math.max(0, fullQuote.total - totalPaid))}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Quote #{fullQuote.quote_number}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={handleCardNumberChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      disabled={processingCardPayment}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                      disabled={processingCardPayment}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Month <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardDetails.expMonth}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 2 && (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12))) {
                            setCardDetails(prev => ({ ...prev, expMonth: value }));
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="MM"
                        maxLength="2"
                        disabled={processingCardPayment}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardDetails.expYear}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 2) {
                            setCardDetails(prev => ({ ...prev, expYear: value }));
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="YY"
                        maxLength="2"
                        disabled={processingCardPayment}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVC <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cvc}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 4) {
                            setCardDetails(prev => ({ ...prev, cvc: value }));
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123"
                        maxLength="4"
                        disabled={processingCardPayment}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Your payment is secured with SSL encryption
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowCardPaymentModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={processingCardPayment}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessCardPayment}
                    disabled={processingCardPayment}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {processingCardPayment ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay {formatCurrency(Math.max(0, fullQuote.total - totalPaid))}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quote Document */}
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
                QUOTE
              </h1>
              <p
                className="text-lg font-semibold mt-2"
                style={{ color: settings?.invoice_accent_color || '#3B82F6' }}
              >
                {fullQuote.quote_number}
              </p>
            </div>
          </div>

          {/* Quote Details */}
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
                  {fullQuote.client_name}
                </p>
                {fullQuote.client_email && <p className="text-sm">{fullQuote.client_email}</p>}
                {fullQuote.client_phone && <p className="text-sm">{fullQuote.client_phone}</p>}
                {fullQuote.client_address && (
                  <>
                    <p className="text-sm mt-2">{fullQuote.client_address}</p>
                    <p className="text-sm">
                      {fullQuote.client_city}, {fullQuote.client_state} {fullQuote.client_zip}
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
                    {formatDate(fullQuote.date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold" style={{ color: settings?.invoice_header_color || '#1F2937' }}>
                    Valid Until:
                  </span>
                  <span style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                    {formatDate(fullQuote.expiry_date)}
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
                    fullQuote.status === 'paid' ? 'bg-green-100 text-green-800' :
                    fullQuote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    fullQuote.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {fullQuote.status.toUpperCase()}
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
                {fullQuote.items && fullQuote.items.map((item, index) => (
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
                  {formatCurrency(fullQuote.subtotal)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium" style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                  Tax ({settings?.tax_rate || 0}%):
                </span>
                <span style={{ color: settings?.text_primary_color || '#111827' }}>
                  {formatCurrency(fullQuote.tax)}
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
                  {formatCurrency(fullQuote.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {fullQuote.notes && (
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
                {fullQuote.notes}
              </p>
            </div>
          )}

          {/* Terms */}
          {fullQuote.terms && (
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
                Terms:
              </h3>
              <p className="text-sm whitespace-pre-wrap" style={{ color: settings?.text_secondary_color || '#6B7280' }}>
                {fullQuote.terms}
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

export default QuotePreview;
