import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { getCurrentDate, calculateDueDate, formatDateInput } from '../utils/formatting';

function QuoteForm({ quote, onClose }) {
  const isEdit = !!quote;
  const {
    getAllClients,
    getAllSavedItems,
    createQuote,
    updateQuote,
    generateQuoteNumber,
    getSettings,
    getQuote
  } = useDatabase();

  const [clients, setClients] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    quote_number: '',
    client_id: '',
    date: getCurrentDate(),
    expiry_date: calculateDueDate(getCurrentDate(), 30), // Default 30 days from now
    status: 'draft',
    notes: '',
    terms: '',
  });

  const [items, setItems] = useState([
    { description: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const loadQuoteData = async () => {
      if (quote && quote.id) {
        try {
          const fullQuote = await getQuote(quote.id);

          setFormData({
            quote_number: fullQuote.quote_number,
            client_id: fullQuote.client_id,
            date: formatDateInput(fullQuote.date),
            expiry_date: formatDateInput(fullQuote.expiry_date),
            status: fullQuote.status,
            notes: fullQuote.notes || '',
            terms: fullQuote.terms || '',
          });

          if (fullQuote.items && fullQuote.items.length > 0) {
            setItems(fullQuote.items);
          }
        } catch (error) {
          console.error('Error loading quote:', error);
        }
      }
    };

    loadQuoteData();
  }, [quote, getQuote]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [clientsData, savedItemsData, settingsData, quoteNum] = await Promise.all([
        getAllClients(),
        getAllSavedItems(),
        getSettings(),
        !isEdit ? generateQuoteNumber() : Promise.resolve(null)
      ]);

      setClients(clientsData);
      setSavedItems(savedItemsData);
      setSettings(settingsData);

      if (!isEdit && quoteNum) {
        setFormData(prev => ({
          ...prev,
          quote_number: quoteNum,
          terms: settingsData.payment_terms || 'Quote valid for 30 days'
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateItemAmount = (quantity, rate) => {
    return parseFloat(quantity || 0) * parseFloat(rate || 0);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const taxRate = parseFloat(settings?.tax_rate || 0) / 100;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = calculateItemAmount(
        newItems[index].quantity,
        newItems[index].rate
      );
    }

    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSavedItemSelect = (index, savedItemId) => {
    if (!savedItemId) return;

    const savedItem = savedItems.find(item => item.id === parseInt(savedItemId));
    if (savedItem) {
      handleItemChange(index, 'description', savedItem.description);
      handleItemChange(index, 'rate', savedItem.rate);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.quote_number) {
      newErrors.quote_number = 'Quote number is required';
    }
    if (!formData.client_id) {
      newErrors.client_id = 'Client is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.expiry_date) {
      newErrors.expiry_date = 'Expiry date is required';
    }

    // Validate items
    const validItems = items.filter(item => item.description.trim());
    if (validItems.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Please fix the errors in the form');
      return;
    }

    try {
      const { subtotal, tax, total } = calculateTotals();
      const quoteData = {
        ...formData,
        subtotal,
        tax,
        total,
      };

      // Filter out empty items
      const validItems = items.filter(item => item.description.trim());

      if (isEdit) {
        await updateQuote(quote.id, quoteData, validItems);
      } else {
        await createQuote(quoteData, validItems);
      }

      onClose(true);
    } catch (error) {
      console.error('Error saving quote:', error);
      alert('Error saving quote: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Quote' : 'Create Quote'}
          </h1>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Header Section */}
          <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="quote_number"
                value={formData.quote_number}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              {errors.quote_number && (
                <p className="text-red-500 text-sm mt-1">{errors.quote_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
              {errors.client_id && (
                <p className="text-red-500 text-sm mt-1">{errors.client_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid Until <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              {errors.expiry_date && (
                <p className="text-red-500 text-sm mt-1">{errors.expiry_date}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Line Items</h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </button>
            </div>

            {errors.items && (
              <p className="text-red-500 text-sm mb-2">{errors.items}</p>
            )}

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-start p-3 bg-gray-50 rounded-lg">
                  <div className="col-span-5">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <textarea
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      rows="2"
                      placeholder="Item description"
                    />
                    <select
                      onChange={(e) => handleSavedItemSelect(index, e.target.value)}
                      className="w-full mt-1 px-3 py-1 border border-gray-300 rounded text-xs"
                    >
                      <option value="">Load from saved items...</option>
                      {savedItems.map(savedItem => (
                        <option key={savedItem.id} value={savedItem.id}>
                          {savedItem.description} - ${savedItem.rate}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Rate</label>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-semibold">
                      ${item.amount.toFixed(2)}
                    </div>
                  </div>

                  <div className="col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-80 space-y-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({settings?.tax_rate || 0}%):</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                <span>Total:</span>
                <span className="text-indigo-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Additional notes or details about this quote..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms & Conditions
              </label>
              <textarea
                name="terms"
                value={formData.terms}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Terms and conditions for this quote..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEdit ? 'Update Quote' : 'Create Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuoteForm;
