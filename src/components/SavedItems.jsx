import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Save, X, Tag, Upload, Download } from 'lucide-react';
import Papa from 'papaparse';
import { useDatabase } from '../hooks/useDatabase';
import { formatCurrency } from '../utils/formatting';
import { validateSavedItem } from '../utils/validation';

function SavedItems() {
  const [savedItems, setSavedItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [errors, setErrors] = useState({});
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [importing, setImporting] = useState(false);

  const { getAllSavedItems, createSavedItem, updateSavedItem, deleteSavedItem } = useDatabase();

  const [formData, setFormData] = useState({
    item_number: '',
    description: '',
    rate: '',
    category: 'General'
  });

  const categories = ['General', 'Consulting', 'Development', 'Design', 'Marketing', 'Support', 'Other'];

  useEffect(() => {
    loadSavedItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchTerm, categoryFilter, savedItems]);

  const loadSavedItems = async () => {
    try {
      setLoading(true);
      const data = await getAllSavedItems();
      setSavedItems(data);
    } catch (error) {
      console.error('Error loading saved items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...savedItems];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    setFilteredItems(filtered);
  };

  const handleOpenForm = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        item_number: item.item_number || '',
        description: item.description,
        rate: item.rate.toString(),
        category: item.category
      });
    } else {
      setEditingItem(null);
      setFormData({
        item_number: '',
        description: '',
        rate: '',
        category: 'General'
      });
    }
    setErrors({});
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({
      item_number: '',
      description: '',
      rate: '',
      category: 'General'
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateSavedItem({
      ...formData,
      rate: parseFloat(formData.rate)
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const itemData = {
        item_number: formData.item_number || null,
        description: formData.description,
        rate: parseFloat(formData.rate),
        category: formData.category
      };

      if (editingItem) {
        await updateSavedItem(editingItem.id, itemData);
      } else {
        await createSavedItem(itemData);
      }

      await loadSavedItems();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item: ' + error.message);
    }
  };

  const handleDelete = async (id, description) => {
    if (window.confirm(`Delete "${description}"?`)) {
      try {
        await deleteSavedItem(id);
        await loadSavedItems();
      } catch (error) {
        alert('Error deleting item: ' + error.message);
      }
    }
  };

  // CSV Import Functions
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setCsvFile(file);
    parseCSV(file);
  };

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        validateCSVData(results.data);
      },
      error: (error) => {
        alert('Error parsing CSV: ' + error.message);
      }
    });
  };

  const validateCSVData = (data) => {
    const requiredFields = ['item_number', 'description', 'rate'];
    const errors = [];
    const validData = [];

    if (data.length === 0) {
      alert('CSV file is empty');
      return;
    }

    const headers = Object.keys(data[0]);
    const missingFields = requiredFields.filter(field => !headers.includes(field));

    if (missingFields.length > 0) {
      alert(`CSV file must have these columns: ${missingFields.join(', ')}`);
      return;
    }

    data.forEach((row, index) => {
      const rowErrors = [];

      if (!row.item_number || !row.item_number.trim()) {
        rowErrors.push('Item number is required');
      }
      if (!row.description || !row.description.trim()) {
        rowErrors.push('Description is required');
      }
      if (!row.rate || isNaN(parseFloat(row.rate))) {
        rowErrors.push('Rate must be a number');
      }

      if (rowErrors.length > 0) {
        errors.push({ row: index + 2, errors: rowErrors });
      } else {
        validData.push(row);
      }
    });

    setCsvData(validData);
    setCsvErrors(errors);
  };

  const handleImportCSV = async () => {
    if (csvData.length === 0) {
      alert('No valid records to import');
      return;
    }

    try {
      setImporting(true);
      let imported = 0;
      let skipped = 0;
      const duplicates = [];

      for (const row of csvData) {
        try {
          const existingItem = savedItems.find(i => i.item_number === row.item_number);
          if (existingItem) {
            duplicates.push(row.item_number);
            skipped++;
            continue;
          }

          await createSavedItem({
            item_number: row.item_number,
            description: row.description,
            rate: parseFloat(row.rate),
            category: row.category || 'General'
          });
          imported++;
        } catch (error) {
          console.error('Error importing row:', error);
          skipped++;
        }
      }

      await loadSavedItems();

      let message = `Successfully imported ${imported} item(s).`;
      if (skipped > 0) {
        message += `\n${skipped} record(s) were skipped.`;
      }
      if (duplicates.length > 0) {
        message += `\n\nDuplicate item numbers: ${duplicates.join(', ')}`;
      }

      alert(message);
      handleCloseImportModal();
    } catch (error) {
      alert('Error importing CSV: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setCsvFile(null);
    setCsvData([]);
    setCsvErrors([]);
  };

  const downloadTemplate = () => {
    const template = 'item_number,description,rate,category\nITEM001,Example Service,100.00,Services';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'items_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading saved items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Saved Items</h1>
            <p className="text-gray-500 mt-1">Reusable line items for your invoices</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Upload className="w-5 h-5 mr-2" />
              Import CSV
            </button>
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Item
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Save className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No saved items found</p>
            <button
              onClick={() => handleOpenForm()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Item
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                    {item.item_number || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      <Tag className="w-3 h-3 mr-1" />
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleOpenForm(item)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.description)}
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingItem ? 'Edit Saved Item' : 'New Saved Item'}
              </h2>
              <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Number
                  </label>
                  <input
                    type="text"
                    name="item_number"
                    value={formData.item_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="e.g., ITEM-001, DEV-001, etc."
                  />
                  {errors.item_number && (
                    <p className="text-red-500 text-xs mt-1">{errors.item_number}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Optional: Used for quick searching</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Web Development - Hourly"
                    required
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      name="rate"
                      value={formData.rate}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  {errors.rate && (
                    <p className="text-red-500 text-xs mt-1">{errors.rate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Import Items from CSV</h2>
                <button
                  onClick={handleCloseImportModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Instructions */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">CSV Format Requirements:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Required columns: <code className="bg-blue-100 px-1">item_number</code>, <code className="bg-blue-100 px-1">description</code>, <code className="bg-blue-100 px-1">rate</code></li>
                  <li>• Optional columns: category</li>
                  <li>• First row must contain column headers</li>
                  <li>• Item numbers must be unique</li>
                  <li>• Rate must be a valid number</li>
                </ul>
                <button
                  onClick={downloadTemplate}
                  className="mt-3 flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download CSV Template
                </button>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {csvFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: <strong>{csvFile.name}</strong>
                  </p>
                )}
              </div>

              {/* Preview/Errors */}
              {csvData.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Preview: {csvData.length} valid record(s) ready to import
                  </h3>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left">Item #</th>
                          <th className="px-4 py-2 text-left">Description</th>
                          <th className="px-4 py-2 text-right">Rate</th>
                          <th className="px-4 py-2 text-left">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(0, 10).map((row, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{row.item_number}</td>
                            <td className="px-4 py-2">{row.description}</td>
                            <td className="px-4 py-2 text-right">${parseFloat(row.rate).toFixed(2)}</td>
                            <td className="px-4 py-2">{row.category || 'General'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {csvData.length > 10 && (
                      <div className="p-2 text-center text-sm text-gray-500 bg-gray-50">
                        Showing first 10 of {csvData.length} records
                      </div>
                    )}
                  </div>
                </div>
              )}

              {csvErrors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2">
                    {csvErrors.length} error(s) found:
                  </h3>
                  <div className="max-h-40 overflow-y-auto">
                    {csvErrors.slice(0, 10).map((error, index) => (
                      <div key={index} className="text-sm text-red-800 mb-1">
                        <strong>Row {error.row}:</strong> {error.errors.join(', ')}
                      </div>
                    ))}
                    {csvErrors.length > 10 && (
                      <p className="text-sm text-red-700 mt-2">
                        ...and {csvErrors.length - 10} more errors
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-red-800 mt-3">
                    These rows will be skipped during import.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseImportModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={importing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportCSV}
                  disabled={importing || csvData.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {importing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Items
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedItems;
