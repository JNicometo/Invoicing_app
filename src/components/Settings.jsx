import React, { useState, useEffect, useRef } from 'react';
import { Save, Building, FileText, Palette, Check, Settings as SettingsIcon, Globe, Mail, Hash, Upload, X as XIcon } from 'lucide-react';
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

    // Display Options
    show_item_numbers: true,
    show_customer_numbers: true,
    show_tax_breakdown: true,
    show_payment_terms: true,

    // Theme
    theme: 'blue'
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

          // Display Options
          show_item_numbers: data.show_item_numbers !== undefined ? data.show_item_numbers : true,
          show_customer_numbers: data.show_customer_numbers !== undefined ? data.show_customer_numbers : true,
          show_tax_breakdown: data.show_tax_breakdown !== undefined ? data.show_tax_breakdown : true,
          show_payment_terms: data.show_payment_terms !== undefined ? data.show_payment_terms : true,

          // Theme
          theme: data.theme || 'blue'
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
    { id: 'display', name: 'Display Options', icon: SettingsIcon },
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
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Templates</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Customize email templates for sending invoices
                    </p>
                  </div>

                  <div className="space-y-4">
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
                        placeholder="Dear {client_name},...${"\n\n"}Please find attached invoice {invoice_number} for {total}.${"\n\n"}Thank you!"
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

                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Coming Soon:</strong> Email sending functionality will be available in a future update. These templates will be used when that feature is enabled.
                    </p>
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

              {/* Theme Tab */}
              {activeTab === 'theme' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Theme Settings</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Choose a color theme for your application
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, theme: theme.id }))}
                        className={`relative p-6 rounded-lg border-2 transition-all ${
                          formData.theme === theme.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-full h-16 ${theme.color} rounded-lg mb-3`}></div>
                        <p className="text-sm font-medium text-gray-900">{theme.name}</p>
                        {formData.theme === theme.id && (
                          <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Preview:</strong> The selected theme will be applied to the application interface.
                      Note: Full theme customization is coming in a future update.
                    </p>
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
