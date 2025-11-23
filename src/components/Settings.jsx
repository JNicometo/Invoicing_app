import React, { useState, useEffect, useRef } from 'react';
import { Save, Building, FileText, Palette, Check, Settings as SettingsIcon, Globe, Mail, Hash, Upload, X as XIcon, Type, Layout, Paintbrush, Eye, CreditCard, HardDrive, Download, UploadCloud, Database, Server } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { validateSettings } from '../utils/validation';

function Settings() {
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState('');

  const fileInputRef = useRef(null);
  const { getSettings, updateSettings } = useDatabase();

  const [formData, setFormData] = useState({
    // Company Info
    company_name: '',
    company_email: '',
    company_phone: '',
    company_website: '',
    company_address: '',
    company_city: '',
    company_state: '',
    company_zip: '',
    company_country: '',
    tax_id: '',
    business_registration: '',
    logo_url: '',

    // Invoice Settings
    invoice_prefix: '',
    invoice_suffix: '',
    invoice_start_number: '',
    quote_prefix: '',
    tax_rate: '',
    tax_label: '',
    currency_symbol: '',
    currency_code: '',
    payment_terms: '',
    bank_details: '',
    default_due_days: '',
    default_notes: '',
    invoice_footer: '',

    // Formatting
    date_format: '',
    number_format: '',
    decimal_separator: '',
    thousand_separator: '',

    // Numbering Formats
    customer_number_prefix: '',
    item_number_prefix: '',

    // Email Templates
    email_subject_template: '',
    email_body_template: '',
    email_cc: '',
    email_bcc: '',

    // SMTP Configuration
    smtp_host: '',
    smtp_port: '',
    smtp_secure: true,
    smtp_user: '',
    smtp_password: '',
    smtp_from_name: '',
    smtp_from_email: '',

    // Payment Gateway
    stripe_secret_key: '',
    stripe_publishable_key: '',
    stripe_enabled: false,
    paypal_client_id: '',
    paypal_client_secret: '',
    paypal_enabled: false,

    // Display Options
    show_item_numbers: true,
    show_customer_numbers: true,
    show_tax_breakdown: true,
    show_payment_terms: true,

    // Theme - Basic
    theme: 'blue',

    // Theme - Colors
    primary_color: '#3B82F6',
    secondary_color: '#8B5CF6',
    accent_color: '#10B981',
    invoice_header_color: '#1F2937',
    invoice_accent_color: '#3B82F6',
    text_primary_color: '#111827',
    text_secondary_color: '#6B7280',

    // Theme - Invoice Layout
    invoice_template: 'modern',
    invoice_header_style: 'left',
    invoice_border_style: 'subtle',
    invoice_spacing: 'normal',
    invoice_table_style: 'striped',

    // Theme - Typography
    heading_font: 'Inter',
    body_font: 'Inter',
    heading_size: 'normal',
    body_size: 'normal',

    // Theme - Invoice Elements
    show_logo_on_invoice: true,
    show_company_address_on_invoice: true,
    show_invoice_border: true,
    invoice_corner_style: 'rounded',

    // Theme - PDF Options
    pdf_page_size: 'letter',
    pdf_margin_size: 'normal',
    pdf_header_height: 'normal',

    // Navigation Tabs
    tab_configuration: null,

    // SQL Server Settings
    use_sql_server: false,
    sql_server_type: 'mysql',
    sql_server_host: 'localhost',
    sql_server_port: '3306',
    sql_server_database: 'invoicepro',
    sql_server_username: '',
    sql_server_password: '',
    sql_server_ssl: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      if (data) {
        setFormData({
          // Company Info
          company_name: data.company_name || '',
          company_email: data.company_email || '',
          company_phone: data.company_phone || '',
          company_website: data.company_website || '',
          company_address: data.company_address || '',
          company_city: data.company_city || '',
          company_state: data.company_state || '',
          company_zip: data.company_zip || '',
          company_country: data.company_country || '',
          tax_id: data.tax_id || '',
          business_registration: data.business_registration || '',
          logo_url: data.logo_url || '',

          // Invoice Settings
          invoice_prefix: data.invoice_prefix || 'INV-',
          invoice_suffix: data.invoice_suffix || '',
          invoice_start_number: data.invoice_start_number || '1',
          quote_prefix: data.quote_prefix || 'QUO-',
          tax_rate: data.tax_rate !== null && data.tax_rate !== undefined ? data.tax_rate.toString() : '0',
          tax_label: data.tax_label || 'Tax',
          currency_symbol: data.currency_symbol || '$',
          currency_code: data.currency_code || 'USD',
          payment_terms: data.payment_terms || 'Payment due within 30 days',
          bank_details: data.bank_details || '',
          default_due_days: data.default_due_days || '30',
          default_notes: data.default_notes || '',
          invoice_footer: data.invoice_footer || 'Thank you for your business!',

          // Formatting
          date_format: data.date_format || 'MM/DD/YYYY',
          number_format: data.number_format || '1,000.00',
          decimal_separator: data.decimal_separator || '.',
          thousand_separator: data.thousand_separator || ',',

          // Numbering Formats
          customer_number_prefix: data.customer_number_prefix || 'CUST-',
          item_number_prefix: data.item_number_prefix || 'ITEM-',

          // Email Templates
          email_subject_template: data.email_subject_template || 'Invoice {invoice_number} from {company_name}',
          email_body_template: data.email_body_template || 'Dear {client_name},\n\nPlease find attached invoice {invoice_number} for {total}.\n\nThank you for your business!\n\nBest regards,\n{company_name}',
          email_cc: data.email_cc || '',
          email_bcc: data.email_bcc || '',

          // SMTP Configuration
          smtp_host: data.smtp_host || '',
          smtp_port: data.smtp_port || '587',
          smtp_secure: data.smtp_secure !== undefined ? data.smtp_secure : false,
          smtp_user: data.smtp_user || '',
          smtp_password: data.smtp_password || '',
          smtp_from_name: data.smtp_from_name || '',
          smtp_from_email: data.smtp_from_email || '',

          // Payment Gateway
          stripe_secret_key: data.stripe_secret_key || '',
          stripe_publishable_key: data.stripe_publishable_key || '',
          stripe_enabled: data.stripe_enabled !== undefined ? data.stripe_enabled : false,
          paypal_client_id: data.paypal_client_id || '',
          paypal_client_secret: data.paypal_client_secret || '',
          paypal_enabled: data.paypal_enabled !== undefined ? data.paypal_enabled : false,

          // Display Options
          show_item_numbers: data.show_item_numbers !== undefined ? data.show_item_numbers : true,
          show_customer_numbers: data.show_customer_numbers !== undefined ? data.show_customer_numbers : true,
          show_tax_breakdown: data.show_tax_breakdown !== undefined ? data.show_tax_breakdown : true,
          show_payment_terms: data.show_payment_terms !== undefined ? data.show_payment_terms : true,

          // Theme - Basic
          theme: data.theme || 'blue',

          // Theme - Colors
          primary_color: data.primary_color || '#3B82F6',
          secondary_color: data.secondary_color || '#8B5CF6',
          accent_color: data.accent_color || '#10B981',
          invoice_header_color: data.invoice_header_color || '#1F2937',
          invoice_accent_color: data.invoice_accent_color || '#3B82F6',
          text_primary_color: data.text_primary_color || '#111827',
          text_secondary_color: data.text_secondary_color || '#6B7280',

          // Theme - Invoice Layout
          invoice_template: data.invoice_template || 'modern',
          invoice_header_style: data.invoice_header_style || 'left',
          invoice_border_style: data.invoice_border_style || 'subtle',
          invoice_spacing: data.invoice_spacing || 'normal',
          invoice_table_style: data.invoice_table_style || 'striped',

          // Theme - Typography
          heading_font: data.heading_font || 'Inter',
          body_font: data.body_font || 'Inter',
          heading_size: data.heading_size || 'normal',
          body_size: data.body_size || 'normal',

          // Theme - Invoice Elements
          show_logo_on_invoice: data.show_logo_on_invoice !== undefined ? data.show_logo_on_invoice : true,
          show_company_address_on_invoice: data.show_company_address_on_invoice !== undefined ? data.show_company_address_on_invoice : true,
          show_invoice_border: data.show_invoice_border !== undefined ? data.show_invoice_border : true,
          invoice_corner_style: data.invoice_corner_style || 'rounded',

          // Theme - PDF Options
          pdf_page_size: data.pdf_page_size || 'letter',
          pdf_margin_size: data.pdf_margin_size || 'normal',
          pdf_header_height: data.pdf_header_height || 'normal',

          // Navigation Tabs
          tab_configuration: data.tab_configuration || null,

          // SQL Server Settings
          use_sql_server: data.use_sql_server !== undefined ? data.use_sql_server : false,
          sql_server_type: data.sql_server_type || 'mysql',
          sql_server_host: data.sql_server_host || 'localhost',
          sql_server_port: data.sql_server_port || '3306',
          sql_server_database: data.sql_server_database || 'invoicepro',
          sql_server_username: data.sql_server_username || '',
          sql_server_password: data.sql_server_password || '',
          sql_server_ssl: data.sql_server_ssl !== undefined ? data.sql_server_ssl : false
        });

        // Set logo preview if exists
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (PNG, JPG, SVG, or WebP)');
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert('Image size must be less than 2MB. Please choose a smaller file.');
      return;
    }

    // Read file and convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      setFormData(prev => ({ ...prev, logo_url: base64String }));
      setLogoPreview(base64String);
      setSuccessMessage('');
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleLogoRemove = () => {
    setFormData(prev => ({ ...prev, logo_url: '' }));
    setLogoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogoButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateSettings({
      ...formData,
      tax_rate: parseFloat(formData.tax_rate)
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setSaving(true);
      await updateSettings({
        ...formData,
        tax_rate: parseFloat(formData.tax_rate)
      });
      setSuccessMessage('Settings saved successfully!');

      // Dispatch event to reload navigation without restarting
      window.dispatchEvent(new CustomEvent('navigation-updated'));

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'company', name: 'Company Info', icon: Building },
    { id: 'invoice', name: 'Invoice Settings', icon: FileText },
    { id: 'formatting', name: 'Formatting', icon: Globe },
    { id: 'numbering', name: 'Numbering', icon: Hash },
    { id: 'email', name: 'Email Templates', icon: Mail },
    { id: 'payments', name: 'Payment Gateways', icon: CreditCard },
    { id: 'display', name: 'Display Options', icon: SettingsIcon },
    { id: 'navigation', name: 'Navigation', icon: Layout },
    { id: 'backup', name: 'Backup & Restore', icon: HardDrive },
    { id: 'sqlserver', name: 'SQL Server', icon: Database },
    { id: 'theme', name: 'Theme', icon: Palette },
  ];

  const themes = [
    { id: 'blue', name: 'Blue', color: 'bg-blue-600' },
    { id: 'green', name: 'Green', color: 'bg-green-600' },
    { id: 'purple', name: 'Purple', color: 'bg-purple-600' },
    { id: 'red', name: 'Red', color: 'bg-red-600' },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Customize your application settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-64">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-1 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Company Info Tab */}
              {activeTab === 'company' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Information</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      This information will appear on your invoices
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      {errors.company_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="company_email"
                        value={formData.company_email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      {errors.company_email && (
                        <p className="text-red-500 text-xs mt-1">{errors.company_email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="company_phone"
                        value={formData.company_phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        name="company_website"
                        value={formData.company_website}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://www.yourcompany.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax ID / VAT Number
                      </label>
                      <input
                        type="text"
                        name="tax_id"
                        value={formData.tax_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 12-3456789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Registration #
                      </label>
                      <input
                        type="text"
                        name="business_registration"
                        value={formData.business_registration}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Registration number"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        name="company_address"
                        value={formData.company_address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123 Business Street"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="company_city"
                        value={formData.company_city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State / Province
                      </label>
                      <input
                        type="text"
                        name="company_state"
                        value={formData.company_state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="State"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP / Postal Code
                      </label>
                      <input
                        type="text"
                        name="company_zip"
                        value={formData.company_zip}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="12345"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        name="company_country"
                        value={formData.company_country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="United States"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Logo
                      </label>

                      <div className="flex items-start space-x-4">
                        {/* Logo Preview */}
                        <div className="flex-shrink-0">
                          {logoPreview ? (
                            <div className="relative">
                              <img
                                src={logoPreview}
                                alt="Company Logo"
                                className="w-32 h-32 object-contain border-2 border-gray-200 rounded-lg bg-white p-2"
                              />
                              <button
                                type="button"
                                onClick={handleLogoRemove}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                                title="Remove logo"
                              >
                                <XIcon className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                              <div className="text-center">
                                <Building className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">No logo</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Upload Button */}
                        <div className="flex-1">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={handleLogoButtonClick}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {logoPreview ? 'Change Logo' : 'Upload Logo'}
                          </button>
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-600">
                              <strong>Accepted formats:</strong> PNG, JPG, SVG, WebP
                            </p>
                            <p className="text-xs text-gray-600">
                              <strong>Max size:</strong> 2MB
                            </p>
                            <p className="text-xs text-gray-600">
                              <strong>Recommended:</strong> 200x200px square
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Invoice Settings Tab */}
              {activeTab === 'invoice' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Settings</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Configure default invoice options and templates
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Invoice Number Prefix
                      </label>
                      <input
                        type="text"
                        name="invoice_prefix"
                        value={formData.invoice_prefix}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="INV-"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        e.g., INV-, BILL-, #
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Invoice Number Suffix
                      </label>
                      <input
                        type="text"
                        name="invoice_suffix"
                        value={formData.invoice_suffix}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(optional)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        e.g., /2024, -US
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Starting Invoice Number
                      </label>
                      <input
                        type="number"
                        name="invoice_start_number"
                        value={formData.invoice_start_number}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Starting number for new invoices
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quote/Estimate Prefix
                      </label>
                      <input
                        type="text"
                        name="quote_prefix"
                        value={formData.quote_prefix}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="QUO-"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Due Days
                      </label>
                      <input
                        type="number"
                        name="default_due_days"
                        value={formData.default_due_days}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Days until payment is due
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        name="tax_rate"
                        value={formData.tax_rate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        step="0.01"
                        min="0"
                        max="100"
                      />
                      {errors.tax_rate && (
                        <p className="text-red-500 text-xs mt-1">{errors.tax_rate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Label
                      </label>
                      <select
                        name="tax_label"
                        value={formData.tax_label}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Tax">Tax</option>
                        <option value="VAT">VAT</option>
                        <option value="GST">GST</option>
                        <option value="Sales Tax">Sales Tax</option>
                        <option value="HST">HST</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency Symbol
                      </label>
                      <input
                        type="text"
                        name="currency_symbol"
                        value={formData.currency_symbol}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="$"
                        maxLength="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency Code
                      </label>
                      <input
                        type="text"
                        name="currency_code"
                        value={formData.currency_code}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="USD"
                        maxLength="3"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ISO code (USD, EUR, GBP, etc.)
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Payment Terms
                      </label>
                      <textarea
                        name="payment_terms"
                        value={formData.payment_terms}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Payment due within 30 days..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Invoice Notes
                      </label>
                      <textarea
                        name="default_notes"
                        value={formData.default_notes}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Thank you for your business! Please contact us with any questions."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Invoice Footer Text
                      </label>
                      <textarea
                        name="invoice_footer"
                        value={formData.invoice_footer}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Thank you for your business!"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank/Payment Details
                      </label>
                      <textarea
                        name="bank_details"
                        value={formData.bank_details}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Bank Name: &#10;Account Number: &#10;Routing Number: &#10;PayPal: "
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This will appear on your invoices
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Formatting Tab */}
              {activeTab === 'formatting' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Formatting Options</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Customize date and number formats
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Format
                      </label>
                      <select
                        name="date_format"
                        value={formData.date_format}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                        <option value="DD.MM.YYYY">DD.MM.YYYY (31.12.2024)</option>
                        <option value="MMM DD, YYYY">MMM DD, YYYY (Dec 31, 2024)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number Format
                      </label>
                      <select
                        name="number_format"
                        value={formData.number_format}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="1,000.00">1,000.00 (US/UK)</option>
                        <option value="1.000,00">1.000,00 (Europe)</option>
                        <option value="1 000,00">1 000,00 (France)</option>
                        <option value="1'000.00">1'000.00 (Switzerland)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Decimal Separator
                      </label>
                      <select
                        name="decimal_separator"
                        value={formData.decimal_separator}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value=".">. (Period)</option>
                        <option value=",">, (Comma)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thousand Separator
                      </label>
                      <select
                        name="thousand_separator"
                        value={formData.thousand_separator}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value=",">, (Comma)</option>
                        <option value=".">. (Period)</option>
                        <option value=" ">(Space)</option>
                        <option value="'">' (Apostrophe)</option>
                        <option value="">None</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Preview:</strong> {formData.currency_symbol}1{formData.thousand_separator}234{formData.decimal_separator}56
                    </p>
                  </div>
                </div>
              )}

              {/* Numbering Tab */}
              {activeTab === 'numbering' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Numbering Formats</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Set default prefixes for auto-generated numbers
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Number Prefix
                      </label>
                      <input
                        type="text"
                        name="customer_number_prefix"
                        value={formData.customer_number_prefix}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                        placeholder="CUST-"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Suggested format: CUST-001, CL-0001
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Number Prefix
                      </label>
                      <input
                        type="text"
                        name="item_number_prefix"
                        value={formData.item_number_prefix}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                        placeholder="ITEM-"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Suggested format: ITEM-001, SRV-001
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Note:</strong> These prefixes are suggestions for manual numbering. They won't automatically generate numbers but provide consistent formatting guidelines.
                    </p>
                  </div>
                </div>
              )}

              {/* Email Templates Tab */}
              {activeTab === 'email' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Configuration</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Configure SMTP settings and email templates for sending invoices
                    </p>
                  </div>

                  {/* SMTP Configuration */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Mail className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">SMTP Settings</h3>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>Email Provider Examples:</strong>
                      </p>
                      <ul className="text-xs text-blue-700 space-y-1 ml-4">
                        <li><strong>Gmail:</strong> smtp.gmail.com, Port 587 (Enable "App Passwords" in Google Account)</li>
                        <li><strong>Outlook/Hotmail:</strong> smtp-mail.outlook.com, Port 587</li>
                        <li><strong>Yahoo:</strong> smtp.mail.yahoo.com, Port 587</li>
                        <li><strong>Custom SMTP:</strong> Contact your email provider for settings</li>
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SMTP Host <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="smtp_host"
                          value={formData.smtp_host}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="smtp.gmail.com"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Your email provider's SMTP server address
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SMTP Port <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="smtp_port"
                          value={formData.smtp_port}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="587"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Usually 587 (TLS) or 465 (SSL)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Encryption
                        </label>
                        <select
                          name="smtp_secure"
                          value={formData.smtp_secure.toString()}
                          onChange={(e) => setFormData(prev => ({ ...prev, smtp_secure: e.target.value === 'true' }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="false">TLS (Port 587)</option>
                          <option value="true">SSL (Port 465)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SMTP Username <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="smtp_user"
                          value={formData.smtp_user}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="your-email@gmail.com"
                          autoComplete="username"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Usually your full email address
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SMTP Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="smtp_password"
                          value={formData.smtp_password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="••••••••"
                          autoComplete="current-password"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use App Password for Gmail (not your account password)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From Name
                        </label>
                        <input
                          type="text"
                          name="smtp_from_name"
                          value={formData.smtp_from_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Your Company Name"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Name that appears in recipient's inbox
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From Email Address
                        </label>
                        <input
                          type="email"
                          name="smtp_from_email"
                          value={formData.smtp_from_email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="invoices@yourcompany.com"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Email address emails will be sent from
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-8"></div>

                  {/* Email Templates */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <FileText className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">Email Templates</h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Subject Template
                      </label>
                      <input
                        type="text"
                        name="email_subject_template"
                        value={formData.email_subject_template}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Invoice {invoice_number} from {company_name}"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Available variables: {'{invoice_number}'}, {'{company_name}'}, {'{total}'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Body Template
                      </label>
                      <textarea
                        name="email_body_template"
                        value={formData.email_body_template}
                        onChange={handleInputChange}
                        rows="8"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="Dear {client_name},&#10;&#10;Please find attached invoice {invoice_number} for {total}.&#10;&#10;Thank you for your business!&#10;&#10;Best regards,&#10;{company_name}"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Available variables: {'{client_name}'}, {'{invoice_number}'}, {'{total}'}, {'{due_date}'}, {'{company_name}'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CC Email Addresses
                        </label>
                        <input
                          type="text"
                          name="email_cc"
                          value={formData.email_cc}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="accounting@company.com"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Separate multiple emails with commas
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          BCC Email Addresses
                        </label>
                        <input
                          type="text"
                          name="email_bcc"
                          value={formData.email_bcc}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="records@company.com"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Separate multiple emails with commas
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>✓ Email Sending Enabled:</strong> Configure your SMTP settings above and save to start sending invoices via email with PDF attachments.
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Gateways Tab */}
              {activeTab === 'payments' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Gateway Integration</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Connect payment gateways to accept online payments and generate payment links for invoices
                    </p>
                  </div>

                  {/* Stripe Configuration */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5 text-gray-700" />
                        <h3 className="text-lg font-semibold text-gray-900">Stripe</h3>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="stripe_enabled"
                          checked={formData.stripe_enabled}
                          onChange={(e) => setFormData(prev => ({ ...prev, stripe_enabled: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>How to get your Stripe API keys:</strong>
                      </p>
                      <ol className="text-xs text-blue-700 space-y-1 ml-4 list-decimal">
                        <li>Sign up for a free account at <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="underline">stripe.com</a></li>
                        <li>Go to Developers → API keys in your Stripe Dashboard</li>
                        <li>Copy your "Publishable key" and "Secret key"</li>
                        <li>Use Test mode keys for testing, Live mode for production</li>
                      </ol>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stripe Secret Key <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="stripe_secret_key"
                          value={formData.stripe_secret_key}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          placeholder="sk_test_..."
                          autoComplete="off"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Starts with sk_test_ (test) or sk_live_ (production)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stripe Publishable Key <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="stripe_publishable_key"
                          value={formData.stripe_publishable_key}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          placeholder="pk_test_..."
                          autoComplete="off"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Starts with pk_test_ (test) or pk_live_ (production)
                        </p>
                      </div>
                    </div>

                    {formData.stripe_enabled && formData.stripe_secret_key && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>✓ Stripe Enabled:</strong> Payment links will be generated for invoices. Clients can pay online with credit/debit cards.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-8"></div>

                  {/* PayPal Configuration */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5 text-gray-700" />
                        <h3 className="text-lg font-semibold text-gray-900">PayPal</h3>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="paypal_enabled"
                          checked={formData.paypal_enabled}
                          onChange={(e) => setFormData(prev => ({ ...prev, paypal_enabled: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>How to get your PayPal API credentials:</strong>
                      </p>
                      <ol className="text-xs text-blue-700 space-y-1 ml-4 list-decimal">
                        <li>Sign up for a PayPal Business account at <a href="https://paypal.com" target="_blank" rel="noopener noreferrer" className="underline">paypal.com</a></li>
                        <li>Go to Dashboard → My Apps & Credentials</li>
                        <li>Create a new app or use an existing one</li>
                        <li>Copy your Client ID and Secret</li>
                      </ol>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PayPal Client ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="paypal_client_id"
                          value={formData.paypal_client_id}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          placeholder="AY..."
                          autoComplete="off"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PayPal Client Secret <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="paypal_client_secret"
                          value={formData.paypal_client_secret}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          placeholder="E..."
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    {formData.paypal_enabled && formData.paypal_client_id && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>✓ PayPal Enabled:</strong> Payment buttons will be added to invoices. Clients can pay via PayPal.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Features Explanation */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <CreditCard className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-purple-900 mb-2">
                          Payment Integration Features
                        </p>
                        <ul className="text-sm text-purple-800 space-y-1 ml-4 list-disc">
                          <li>Generate secure payment links for each invoice</li>
                          <li>Automatic payment tracking and reconciliation</li>
                          <li>Email invoices with embedded "Pay Now" buttons</li>
                          <li>Support for credit cards, debit cards, and digital wallets</li>
                          <li>Real-time payment notifications</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Display Options Tab */}
              {activeTab === 'display' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Display Options</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Control what information appears on invoices and in the app
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Show Item Numbers</p>
                        <p className="text-sm text-gray-500">Display item numbers in invoices and tables</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="show_item_numbers"
                          checked={formData.show_item_numbers}
                          onChange={(e) => setFormData(prev => ({ ...prev, show_item_numbers: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Show Customer Numbers</p>
                        <p className="text-sm text-gray-500">Display customer numbers in clients section</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="show_customer_numbers"
                          checked={formData.show_customer_numbers}
                          onChange={(e) => setFormData(prev => ({ ...prev, show_customer_numbers: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Show Tax Breakdown</p>
                        <p className="text-sm text-gray-500">Display tax calculation details on invoices</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="show_tax_breakdown"
                          checked={formData.show_tax_breakdown}
                          onChange={(e) => setFormData(prev => ({ ...prev, show_tax_breakdown: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Show Payment Terms</p>
                        <p className="text-sm text-gray-500">Display payment terms on invoices</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="show_payment_terms"
                          checked={formData.show_payment_terms}
                          onChange={(e) => setFormData(prev => ({ ...prev, show_payment_terms: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Tab */}
              {activeTab === 'navigation' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Navigation Customization</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Customize which tabs appear in your sidebar and change their order. Drag tabs to reorder or use the arrow buttons.
                    </p>
                  </div>

                  {(() => {
                    // Parse tab configuration or use default
                    let tabs = [];
                    try {
                      tabs = formData.tab_configuration
                        ? JSON.parse(formData.tab_configuration)
                        : [
                            { id: 'dashboard', name: 'Dashboard', enabled: true, order: 0 },
                            { id: 'invoices', name: 'Invoices', enabled: true, order: 1 },
                            { id: 'estimates', name: 'Estimates', enabled: true, order: 2 },
                            { id: 'credit-notes', name: 'Credit Notes', enabled: true, order: 3 },
                            { id: 'recurring', name: 'Recurring', enabled: true, order: 4 },
                            { id: 'clients', name: 'Clients', enabled: true, order: 5 },
                            { id: 'reminders', name: 'Reminders', enabled: true, order: 6 },
                            { id: 'reports', name: 'Reports', enabled: true, order: 7 },
                            { id: 'saved-items', name: 'Saved Items', enabled: true, order: 8 },
                            { id: 'archive', name: 'Archive', enabled: true, order: 9 },
                            { id: 'settings', name: 'Settings', enabled: true, order: 10 }
                          ];
                    } catch (e) {
                      console.error('Error parsing tab configuration:', e);
                    }

                    const handleToggleTab = (tabId) => {
                      const updatedTabs = tabs.map(tab =>
                        tab.id === tabId ? { ...tab, enabled: !tab.enabled } : tab
                      );
                      setFormData(prev => ({ ...prev, tab_configuration: JSON.stringify(updatedTabs) }));
                    };

                    const handleMoveUp = (index) => {
                      if (index === 0) return;
                      const updatedTabs = [...tabs];
                      const temp = updatedTabs[index];
                      updatedTabs[index] = updatedTabs[index - 1];
                      updatedTabs[index - 1] = temp;
                      // Update order values
                      updatedTabs.forEach((tab, idx) => tab.order = idx);
                      setFormData(prev => ({ ...prev, tab_configuration: JSON.stringify(updatedTabs) }));
                    };

                    const handleMoveDown = (index) => {
                      if (index === tabs.length - 1) return;
                      const updatedTabs = [...tabs];
                      const temp = updatedTabs[index];
                      updatedTabs[index] = updatedTabs[index + 1];
                      updatedTabs[index + 1] = temp;
                      // Update order values
                      updatedTabs.forEach((tab, idx) => tab.order = idx);
                      setFormData(prev => ({ ...prev, tab_configuration: JSON.stringify(updatedTabs) }));
                    };

                    const handleResetToDefaults = () => {
                      const defaultTabs = [
                        { id: 'dashboard', name: 'Dashboard', enabled: true, order: 0 },
                        { id: 'invoices', name: 'Invoices', enabled: true, order: 1 },
                        { id: 'estimates', name: 'Estimates', enabled: true, order: 2 },
                        { id: 'credit-notes', name: 'Credit Notes', enabled: true, order: 3 },
                        { id: 'recurring', name: 'Recurring', enabled: true, order: 4 },
                        { id: 'clients', name: 'Clients', enabled: true, order: 5 },
                        { id: 'reminders', name: 'Reminders', enabled: true, order: 6 },
                        { id: 'reports', name: 'Reports', enabled: true, order: 7 },
                        { id: 'saved-items', name: 'Saved Items', enabled: true, order: 8 },
                        { id: 'archive', name: 'Archive', enabled: true, order: 9 },
                        { id: 'settings', name: 'Settings', enabled: true, order: 10 }
                      ];
                      setFormData(prev => ({ ...prev, tab_configuration: JSON.stringify(defaultTabs) }));
                    };

                    return (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">
                            {tabs.filter(t => t.enabled).length} of {tabs.length} tabs enabled
                          </p>
                          <button
                            type="button"
                            onClick={handleResetToDefaults}
                            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            Reset to Defaults
                          </button>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
                          {tabs.map((tab, index) => (
                            <div
                              key={tab.id}
                              className={`flex items-center justify-between p-4 ${
                                !tab.enabled ? 'bg-gray-50 opacity-60' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-4 flex-1">
                                <div className="flex flex-col space-y-1">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveUp(index)}
                                    disabled={index === 0}
                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move up"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveDown(index)}
                                    disabled={index === tabs.length - 1}
                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move down"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                </div>

                                <div className="flex items-center space-x-3 flex-1">
                                  <span className="text-sm font-medium text-gray-500 w-8">#{index + 1}</span>
                                  <span className="text-base font-medium text-gray-900">{tab.name}</span>
                                  {tab.id === 'settings' && (
                                    <span className="text-xs text-gray-500 italic">(always visible)</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={tab.enabled}
                                    onChange={() => handleToggleTab(tab.id)}
                                    disabled={tab.id === 'settings'}
                                    className="sr-only peer"
                                  />
                                  <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                                    tab.id === 'settings' ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}></div>
                                  <span className="ml-3 text-sm font-medium text-gray-700">
                                    {tab.enabled ? 'Enabled' : 'Disabled'}
                                  </span>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-blue-800">Important Notes</h3>
                              <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                  <li>The Settings tab is always visible and cannot be disabled</li>
                                  <li>Click "Save Settings" at the top to apply your changes</li>
                                  <li>Restart the app to see navigation changes take effect</li>
                                  <li>Disabled tabs won't appear in the sidebar</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Theme Tab */}
              {activeTab === 'theme' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Theme & Invoice Customization</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Customize the appearance of your invoices and application
                    </p>
                  </div>

                  {/* Color Customization */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Paintbrush className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">Color Scheme</h3>
                    </div>

                    {/* Quick Theme Presets */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Quick Presets
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {themes.map((theme) => (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => {
                              const colorMap = {
                                blue: { primary: '#3B82F6', secondary: '#8B5CF6', accent: '#10B981', invoice_accent: '#3B82F6' },
                                green: { primary: '#10B981', secondary: '#3B82F6', accent: '#8B5CF6', invoice_accent: '#10B981' },
                                purple: { primary: '#8B5CF6', secondary: '#3B82F6', accent: '#10B981', invoice_accent: '#8B5CF6' },
                                red: { primary: '#EF4444', secondary: '#F59E0B', accent: '#10B981', invoice_accent: '#EF4444' },
                              };
                              const colors = colorMap[theme.id];
                              setFormData(prev => ({
                                ...prev,
                                theme: theme.id,
                                primary_color: colors.primary,
                                secondary_color: colors.secondary,
                                accent_color: colors.accent,
                                invoice_accent_color: colors.invoice_accent
                              }));
                            }}
                            className={`relative p-4 rounded-lg border-2 transition-all ${
                              formData.theme === theme.id
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-full h-10 ${theme.color} rounded-md mb-2`}></div>
                            <p className="text-xs font-medium text-gray-900">{theme.name}</p>
                            {formData.theme === theme.id && (
                              <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-0.5">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Colors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            name="primary_color"
                            value={formData.primary_color}
                            onChange={handleInputChange}
                            className="w-14 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.primary_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                            placeholder="#3B82F6"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Used for buttons and highlights</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Secondary Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            name="secondary_color"
                            value={formData.secondary_color}
                            onChange={handleInputChange}
                            className="w-14 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.secondary_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                            placeholder="#8B5CF6"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Used for accents and badges</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Accent Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            name="accent_color"
                            value={formData.accent_color}
                            onChange={handleInputChange}
                            className="w-14 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.accent_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                            placeholder="#10B981"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Used for success states</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Invoice Header Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            name="invoice_header_color"
                            value={formData.invoice_header_color}
                            onChange={handleInputChange}
                            className="w-14 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.invoice_header_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, invoice_header_color: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                            placeholder="#1F2937"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Invoice header text color</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Invoice Accent Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            name="invoice_accent_color"
                            value={formData.invoice_accent_color}
                            onChange={handleInputChange}
                            className="w-14 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.invoice_accent_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, invoice_accent_color: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                            placeholder="#3B82F6"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Invoice borders and highlights</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-8"></div>

                  {/* Invoice Templates */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Layout className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">Invoice Template</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: 'classic', name: 'Classic', desc: 'Traditional layout' },
                        { id: 'modern', name: 'Modern', desc: 'Clean and minimal' },
                        { id: 'professional', name: 'Professional', desc: 'Corporate style' },
                        { id: 'minimal', name: 'Minimal', desc: 'Simple and elegant' },
                      ].map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, invoice_template: template.id }))}
                          className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                            formData.invoice_template === template.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-full h-20 bg-gradient-to-br ${
                            template.id === 'classic' ? 'from-gray-100 to-gray-200' :
                            template.id === 'modern' ? 'from-blue-50 to-blue-100' :
                            template.id === 'professional' ? 'from-gray-700 to-gray-800' :
                            'from-white to-gray-50'
                          } rounded-md mb-3 border border-gray-200 flex items-center justify-center`}>
                            <FileText className={`w-8 h-8 ${
                              template.id === 'professional' ? 'text-white' : 'text-gray-400'
                            }`} />
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{template.name}</p>
                          <p className="text-xs text-gray-500">{template.desc}</p>
                          {formData.invoice_template === template.id && (
                            <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Layout Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Header Alignment
                        </label>
                        <select
                          name="invoice_header_style"
                          value={formData.invoice_header_style}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="left">Left Aligned</option>
                          <option value="center">Centered</option>
                          <option value="right">Right Aligned</option>
                          <option value="split">Split (Logo Left, Info Right)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Border Style
                        </label>
                        <select
                          name="invoice_border_style"
                          value={formData.invoice_border_style}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="none">No Borders</option>
                          <option value="subtle">Subtle</option>
                          <option value="bold">Bold</option>
                          <option value="colored">Colored</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Corner Style
                        </label>
                        <select
                          name="invoice_corner_style"
                          value={formData.invoice_corner_style}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="square">Square</option>
                          <option value="rounded">Rounded</option>
                          <option value="sharp">Sharp</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Spacing
                        </label>
                        <select
                          name="invoice_spacing"
                          value={formData.invoice_spacing}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="compact">Compact</option>
                          <option value="normal">Normal</option>
                          <option value="spacious">Spacious</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Table Style
                        </label>
                        <select
                          name="invoice_table_style"
                          value={formData.invoice_table_style}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="simple">Simple</option>
                          <option value="striped">Striped Rows</option>
                          <option value="bordered">Bordered</option>
                          <option value="minimal">Minimal</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-8"></div>

                  {/* Typography */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Type className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">Typography</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Heading Font
                        </label>
                        <select
                          name="heading_font"
                          value={formData.heading_font}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Arial">Arial</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Lato">Lato</option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Playfair Display">Playfair Display</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Body Font
                        </label>
                        <select
                          name="body_font"
                          value={formData.body_font}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Arial">Arial</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Lato">Lato</option>
                          <option value="Montserrat">Montserrat</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Heading Size
                        </label>
                        <select
                          name="heading_size"
                          value={formData.heading_size}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="small">Small</option>
                          <option value="normal">Normal</option>
                          <option value="large">Large</option>
                          <option value="extra-large">Extra Large</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Body Size
                        </label>
                        <select
                          name="body_size"
                          value={formData.body_size}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="small">Small (10pt)</option>
                          <option value="normal">Normal (12pt)</option>
                          <option value="large">Large (14pt)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-8"></div>

                  {/* Invoice Elements */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Eye className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">Invoice Elements</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Show Logo on Invoice</p>
                          <p className="text-sm text-gray-500">Display company logo in invoice header</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="show_logo_on_invoice"
                            checked={formData.show_logo_on_invoice}
                            onChange={(e) => setFormData(prev => ({ ...prev, show_logo_on_invoice: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Show Company Address on Invoice</p>
                          <p className="text-sm text-gray-500">Display full company address in header</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="show_company_address_on_invoice"
                            checked={formData.show_company_address_on_invoice}
                            onChange={(e) => setFormData(prev => ({ ...prev, show_company_address_on_invoice: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Show Invoice Border</p>
                          <p className="text-sm text-gray-500">Add decorative border around invoice</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="show_invoice_border"
                            checked={formData.show_invoice_border}
                            onChange={(e) => setFormData(prev => ({ ...prev, show_invoice_border: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-8"></div>

                  {/* PDF Options */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <FileText className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">PDF Options</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Page Size
                        </label>
                        <select
                          name="pdf_page_size"
                          value={formData.pdf_page_size}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="letter">Letter (8.5" × 11")</option>
                          <option value="a4">A4 (210mm × 297mm)</option>
                          <option value="legal">Legal (8.5" × 14")</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Page Margins
                        </label>
                        <select
                          name="pdf_margin_size"
                          value={formData.pdf_margin_size}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="narrow">Narrow (0.5")</option>
                          <option value="normal">Normal (1")</option>
                          <option value="wide">Wide (1.5")</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Header Height
                        </label>
                        <select
                          name="pdf_header_height"
                          value={formData.pdf_header_height}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="compact">Compact</option>
                          <option value="normal">Normal</option>
                          <option value="tall">Tall</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Preview Notice */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-2">
                          Preview Your Customizations
                        </p>
                        <p className="text-sm text-blue-800">
                          Your theme settings will be applied when you view or generate invoice PDFs. Create or view an invoice to see your customizations in action!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Backup & Restore Tab */}
              {activeTab === 'backup' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Backup & Restore</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Protect your business data with regular backups. Create manual backups or restore from previous backup files.
                    </p>
                  </div>

                  {/* Manual Backup */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Download className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">Create Backup</h3>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <p className="text-sm text-gray-600 mb-4">
                        Download a complete backup of all your data including invoices, clients, payments, and settings.
                        The backup will be saved as a ZIP file containing CSV exports of all your data.
                      </p>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setSaving(true);

                            // Select where to save the backup
                            const fileResult = await window.electron.ipcRenderer.invoke('backup:selectFile', 'save');

                            if (fileResult.canceled) {
                              setSaving(false);
                              return;
                            }

                            // Create the backup
                            const result = await window.electron.ipcRenderer.invoke('backup:create', fileResult.path);

                            if (result.success) {
                              alert(`Backup created successfully!\n\nSaved to: ${result.path}`);
                            }
                          } catch (error) {
                            console.error('Error creating backup:', error);
                            alert('Error creating backup: ' + error.message);
                          } finally {
                            setSaving(false);
                          }
                        }}
                        disabled={saving}
                        className={`flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                          saving ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Download className="w-5 h-5 mr-2" />
                        {saving ? 'Creating Backup...' : 'Download Backup Now'}
                      </button>

                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-800">
                          <strong>Tip:</strong> Save your backup file to a secure location like cloud storage or an external drive.
                          Regular backups protect against data loss from hardware failures or accidental deletions.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-8"></div>

                  {/* Restore from Backup */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <UploadCloud className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">Restore from Backup</h3>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm font-semibold text-yellow-900 mb-2">
                          ⚠️ Warning: This will replace all current data
                        </p>
                        <p className="text-xs text-yellow-800">
                          Restoring from a backup will <strong>permanently delete all current data</strong> and replace it with the backup data.
                          Make sure to create a backup of your current data before proceeding if needed.
                        </p>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        Select a backup ZIP file to restore your data. The app will restart after the restore is complete.
                      </p>

                      <button
                        type="button"
                        onClick={async () => {
                          // Confirm before proceeding
                          const confirmed = window.confirm(
                            'WARNING: This will permanently delete ALL current data and replace it with the backup data.\n\n' +
                            'Are you absolutely sure you want to continue?\n\n' +
                            'Click OK to proceed or Cancel to abort.'
                          );

                          if (!confirmed) {
                            return;
                          }

                          try {
                            setSaving(true);

                            // Select backup file to restore
                            const fileResult = await window.electron.ipcRenderer.invoke('backup:selectFile', 'open');

                            if (fileResult.canceled) {
                              setSaving(false);
                              return;
                            }

                            // Restore the backup
                            const result = await window.electron.ipcRenderer.invoke('backup:restore', fileResult.path);

                            if (result.success) {
                              alert(
                                `Backup restored successfully!\n\n` +
                                `Tables restored: ${result.stats.tables_restored}\n` +
                                `Total rows: ${result.stats.total_rows}\n\n` +
                                `The app will reload to apply the changes.`
                              );

                              // Reload the app to reflect changes
                              window.location.reload();
                            }
                          } catch (error) {
                            console.error('Error restoring backup:', error);
                            alert('Error restoring backup: ' + error.message);
                          } finally {
                            setSaving(false);
                          }
                        }}
                        disabled={saving}
                        className={`flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors ${
                          saving ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <UploadCloud className="w-5 h-5 mr-2" />
                        {saving ? 'Restoring...' : 'Choose Backup File to Restore'}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-8"></div>

                  {/* Automatic Backups Info */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <HardDrive className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">Automatic Backups</h3>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
                      <div className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-green-900 mb-2">
                            Automatic Daily Backups Enabled
                          </p>
                          <p className="text-sm text-green-800 mb-3">
                            Your data is automatically backed up every day at 2:00 AM. Backups are stored in your application data folder and the last 30 backups are kept.
                          </p>
                          <p className="text-xs text-green-700">
                            <strong>Backup Location:</strong> Your automatic backups are saved in the app's data directory under the "backups" folder.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* What's Included */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">What's included in backups?</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        'Company Settings',
                        'Client Information',
                        'Invoices & Items',
                        'Saved Items Library',
                        'Payment Records',
                        'Recurring Invoices',
                        'Estimates & Quotes',
                        'Credit Notes',
                        'Reminder Templates',
                        'Invoice Reminders',
                      ].map((item) => (
                        <div key={item} className="flex items-center text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SQL Server Tab */}
              {activeTab === 'sqlserver' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">SQL Server Configuration</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Connect to a remote SQL server database for multi-user access. Multiple users can access the same data simultaneously.
                    </p>
                  </div>

                  {/* Enable SQL Server */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Use SQL Server Database</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Switch from local SQLite to a remote SQL server database
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="use_sql_server"
                          checked={formData.use_sql_server}
                          onChange={(e) => setFormData(prev => ({ ...prev, use_sql_server: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {formData.use_sql_server && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-800">
                            <strong>Note:</strong> Switching to SQL Server will require restarting the application. Make sure you have a working SQL server and the correct credentials before enabling this feature.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Connection Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Server className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">Connection Settings</h3>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                      {/* Server Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Database Type
                        </label>
                        <select
                          name="sql_server_type"
                          value={formData.sql_server_type}
                          onChange={(e) => {
                            const type = e.target.value;
                            let port = '3306';
                            if (type === 'postgres') port = '5432';
                            if (type === 'mssql') port = '1433';
                            setFormData(prev => ({ ...prev, sql_server_type: type, sql_server_port: port }));
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="mysql">MySQL / MariaDB</option>
                          <option value="postgres">PostgreSQL</option>
                          <option value="mssql">Microsoft SQL Server</option>
                        </select>
                      </div>

                      {/* Host and Port */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Host / IP Address
                          </label>
                          <input
                            type="text"
                            name="sql_server_host"
                            value={formData.sql_server_host}
                            onChange={handleInputChange}
                            placeholder="localhost or 192.168.1.100"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Port
                          </label>
                          <input
                            type="text"
                            name="sql_server_port"
                            value={formData.sql_server_port}
                            onChange={handleInputChange}
                            placeholder="3306"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Database Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Database Name
                        </label>
                        <input
                          type="text"
                          name="sql_server_database"
                          value={formData.sql_server_database}
                          onChange={handleInputChange}
                          placeholder="invoicepro"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Username and Password */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            name="sql_server_username"
                            value={formData.sql_server_username}
                            onChange={handleInputChange}
                            placeholder="root"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                          </label>
                          <input
                            type="password"
                            name="sql_server_password"
                            value={formData.sql_server_password}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* SSL */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Enable SSL/TLS</p>
                          <p className="text-sm text-gray-500">Use encrypted connection to server</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="sql_server_ssl"
                            checked={formData.sql_server_ssl}
                            onChange={(e) => setFormData(prev => ({ ...prev, sql_server_ssl: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              setSaving(true);
                              const result = await window.electron.ipcRenderer.invoke('sqlserver:testConnection', {
                                type: formData.sql_server_type,
                                host: formData.sql_server_host,
                                port: formData.sql_server_port,
                                database: formData.sql_server_database,
                                username: formData.sql_server_username,
                                password: formData.sql_server_password,
                                ssl: formData.sql_server_ssl
                              });

                              if (result.success) {
                                alert('✓ Connection successful!\n\nThe server is reachable and credentials are valid.');
                              } else {
                                alert('✗ Connection failed:\n\n' + result.message);
                              }
                            } catch (error) {
                              alert('✗ Connection failed:\n\n' + error.message);
                            } finally {
                              setSaving(false);
                            }
                          }}
                          disabled={saving}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Test Connection
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              setSaving(true);

                              // Check if database exists
                              const checkResult = await window.electron.ipcRenderer.invoke('sqlserver:checkDatabase', {
                                type: formData.sql_server_type,
                                host: formData.sql_server_host,
                                port: formData.sql_server_port,
                                database: formData.sql_server_database,
                                username: formData.sql_server_username,
                                password: formData.sql_server_password,
                                ssl: formData.sql_server_ssl
                              });

                              if (checkResult.exists) {
                                alert('Database already exists!\n\nThe database "' + formData.sql_server_database + '" is already on the server.');
                                setSaving(false);
                                return;
                              }

                              // Create database
                              const createResult = await window.electron.ipcRenderer.invoke('sqlserver:createDatabase', {
                                type: formData.sql_server_type,
                                host: formData.sql_server_host,
                                port: formData.sql_server_port,
                                database: formData.sql_server_database,
                                username: formData.sql_server_username,
                                password: formData.sql_server_password,
                                ssl: formData.sql_server_ssl
                              });

                              if (createResult.success) {
                                // Create schema
                                const schemaResult = await window.electron.ipcRenderer.invoke('sqlserver:createSchema', {
                                  type: formData.sql_server_type,
                                  host: formData.sql_server_host,
                                  port: formData.sql_server_port,
                                  database: formData.sql_server_database,
                                  username: formData.sql_server_username,
                                  password: formData.sql_server_password,
                                  ssl: formData.sql_server_ssl
                                });

                                if (schemaResult.success) {
                                  alert('✓ Database created successfully!\n\nDatabase and all tables have been created on the server.\n\nYou can now enable "Use SQL Server Database" and save settings.');
                                } else {
                                  alert('✗ Error creating tables:\n\n' + schemaResult.message);
                                }
                              } else {
                                alert('✗ Error creating database:\n\n' + createResult.message);
                              }
                            } catch (error) {
                              alert('✗ Error:\n\n' + error.message);
                            } finally {
                              setSaving(false);
                            }
                          }}
                          disabled={saving}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          <Database className="w-4 h-4 mr-2" />
                          {saving ? 'Setting Up...' : 'Create Database & Tables'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Setup Instructions */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
                    <h4 className="text-sm font-semibold text-purple-900 mb-3">Setup Instructions</h4>
                    <ol className="text-sm text-purple-800 space-y-2 list-decimal list-inside">
                      <li>Install MySQL, PostgreSQL, or MS SQL Server on a computer</li>
                      <li>Create a user with database creation permissions</li>
                      <li>Enter the connection details above</li>
                      <li>Click "Test Connection" to verify credentials</li>
                      <li>Click "Create Database & Tables" to set up the database</li>
                      <li>Enable "Use SQL Server Database" toggle</li>
                      <li>Save settings and restart the application</li>
                      <li>Other users can connect using the same database credentials</li>
                    </ol>
                  </div>

                  {/* Benefits */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Why use SQL Server?</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        'Multiple users access same data simultaneously',
                        'No file sharing or network drive needed',
                        'Better performance for large datasets',
                        'Professional database management',
                        'Automatic backups (server-side)',
                        'Centralized data storage',
                        'Enterprise-grade security',
                        'Compatible with MySQL, PostgreSQL, MS SQL',
                      ].map((item) => (
                        <div key={item} className="flex items-center text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                {successMessage && (
                  <div className="flex items-center text-green-600">
                    <Check className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">{successMessage}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-auto ${
                    saving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;
