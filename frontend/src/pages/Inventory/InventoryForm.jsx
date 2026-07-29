import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addItem, updateItem, getItemById, getCategories, getLocations, checkItemIdExists } from '../../api/inventoryApi';
import Sidebar from '../UserManagement/Sidebar';

// This form is used for both adding new items and editing existing items
const InventoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id); // update 2 : True if editing an existing item

  // Get user data for sidebar
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/staff-login");
  };

  // Form state
  //Read 1.1 : User enters this data in the form
  const [formData, setFormData] = useState({
    item_ID: '',
    item_name: '',
    category: '',
    quantity: '',
    condition: 'Good',
    location: '',
    status: 'Available',
    threshold: '30',
    unit_price: '',
    expire_date: '',
    notes: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [itemIdExists, setItemIdExists] = useState(false);
  const [checkingItemId, setCheckingItemId] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      loadItemData();                  //update 3: Automatically load existing item data
      setItemIdExists(false); // Clear item ID validation when editing
    }
  }, [id, isEditing]);

  const loadInitialData = async () => {
    try {
      const [categoriesData, locationsData] = await Promise.all([
        getCategories(),
        getLocations()
      ]);
      
      setCategories(categoriesData);
      setLocations(locationsData);
    } catch (err) {
      setError('Failed to load form data');
      console.error(err);
    }
  };

  const loadItemData = async () => {
    try {
      setLoading(true);
      const response = await getItemById(id);//update 4: Calls inventoryApi.js getItemById function which sends request to backend 
                                            // (API makes HTTP GET request to /api/inventory/:id and waits for response)
      
      // form processes the response and prefills
      if (response.success) {// update 4A: If response is successful, populate form with existing item data
        const item = response.data; //update 11 A: extract item data from response
        setFormData({                 //update 11 B: prefill form fields
          item_ID: item.item_ID || '',
          item_name: item.item_name || '',
          category: item.category || '',
          quantity: item.quantity || '',
          condition: item.condition || 'Good',
          location: item.location || '',
          status: item.status || 'Available',
          threshold: item.threshold || '30',
          unit_price: item.unit_price || '',
          expire_date: item.expire_date ? new Date(item.expire_date).toISOString().split('T')[0] : '',
          notes: item.notes || ''
        });
      }
    } catch (err) {
      setError('Failed to load item data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation for specific fields
    validateField(name, value);

    // Check if item ID exists when user types in item_ID field
    if (name === 'item_ID' && !isEditing && value && value.length > 0) {
      debouncedCheckItemId(value);
    } else if (name === 'item_ID') {
      setItemIdExists(false);
    }
  };

  // Real-time field validation
  const validateField = (fieldName, value) => {
    let errorMessage = '';

    switch (fieldName) {
      case 'item_ID':
        if (value && value.length > 0) {
          if (value.length < 3) {
            errorMessage = 'Item ID must be at least 3 characters long';
          } else if (value.length > 20) {
            errorMessage = 'Item ID must not exceed 20 characters';
          } else if (!/^[A-Za-z0-9_-]+$/.test(value)) {
            errorMessage = 'Item ID can only contain letters, numbers, hyphens, and underscores';
          }
        }
        break;

      case 'item_name':
        if (value && value.length > 0) {
          if (value.trim().length < 2) {
            errorMessage = 'Item name must be at least 2 characters long';
          } else if (value.length > 100) {
            errorMessage = 'Item name must not exceed 100 characters';
          } else if (!/^[A-Za-z0-9\s\-_().,&]+$/.test(value.trim())) {
            errorMessage = 'Item name contains invalid characters';
          }
        }
        break;

      case 'quantity':
        if (value !== '') {
          if (isNaN(value) || value < 0) {
            errorMessage = 'Quantity must be a non-negative number';
          } else if (value > 999999) {
            errorMessage = 'Quantity cannot exceed 999,999';
          }
        }
        break;

      case 'threshold':
        if (value !== '' && value !== null && value !== undefined) {
          if (isNaN(value) || value < 0) {
            errorMessage = 'Threshold must be a non-negative number';
          } else if (value > 9999) {
            errorMessage = 'Threshold cannot exceed 9,999';
          }
        }
        break;

      case 'unit_price':
        if (value !== '' && value !== null && value !== undefined) {
          if (isNaN(value) || value < 0) {
            errorMessage = 'Unit price must be a non-negative number';
          } else if (value > 999999.99) {
            errorMessage = 'Unit price cannot exceed 999,999.99';
          }
        }
        break;

      case 'expire_date':
        if (value) {
          const expiryDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (isNaN(expiryDate.getTime())) {
            errorMessage = 'Please enter a valid expiry date';
          } else if (expiryDate < today) {
            errorMessage = 'Expiry date cannot be in the past';
          }
        }
        break;

      case 'notes':
        if (value && value.length > 500) {
          errorMessage = 'Notes must not exceed 500 characters';
        }
        break;
    }

    if (errorMessage) {
      setFieldErrors(prev => ({
        ...prev,
        [fieldName]: errorMessage
      }));
    }
  };

  const validateItemId = useCallback(async (itemId) => {
    if (!itemId || itemId < 1) {
      setItemIdExists(false);
      return;
    }

    try {
      setCheckingItemId(true);
      console.log('Checking item ID:', itemId);
      
      // Use the new API function to check if item ID exists
      const response = await checkItemIdExists(itemId);
      console.log('API Response:', response);
      
      setItemIdExists(response.exists);
      console.log('Set itemIdExists to:', response.exists);
    } catch (err) {
      console.error('Error checking item ID:', err);
      // If error, item ID doesn't exist (which is what we want)
      setItemIdExists(false);
    } finally {
      setCheckingItemId(false);
    }
  }, []);

  // Debounced version to avoid too many API calls
  const debouncedCheckItemId = useCallback((itemId) => {
    const timeoutId = setTimeout(() => {
      validateItemId(itemId);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [validateItemId]);

  const validateForm = () => {
    // Clear previous error
    setError('');

    // Item ID validation
    const itemIdStr = String(formData.item_ID || '');
    if (!formData.item_ID || !itemIdStr.trim()) {
      setError('Item ID is required');
      return false;
    }
    // For editing, allow existing IDs (they might be numeric and shorter)
    if (!isEditing) {
      if (itemIdStr.length < 3) {
        setError('Item ID must be at least 3 characters long');
        return false;
      }
    }
    if (itemIdStr.length > 20) {
      setError('Item ID must not exceed 20 characters');
      return false;
    }
    if (!/^[A-Za-z0-9_-]+$/.test(itemIdStr)) {
      setError('Item ID can only contain letters, numbers, hyphens, and underscores');
      return false;
    }

    // Item name validation
    const itemNameStr = String(formData.item_name || '');
    if (!formData.item_name || !itemNameStr.trim()) {
      setError('Item name is required');
      return false;
    }
    if (itemNameStr.trim().length < 2) {
      setError('Item name must be at least 2 characters long');
      return false;
    }
    if (itemNameStr.length > 100) {
      setError('Item name must not exceed 100 characters');
      return false;
    }
    if (!/^[A-Za-z0-9\s\-_().,&]+$/.test(itemNameStr.trim())) {
      setError('Item name contains invalid characters');
      return false;
    }

    // Category validation
    const categoryStr = String(formData.category || '');
    if (!formData.category || !categoryStr.trim()) {
      setError('Category is required');
      return false;
    }

    // Quantity validation
    if (formData.quantity === '' || formData.quantity === null || formData.quantity === undefined) {
      setError('Quantity is required');
      return false;
    }
    if (isNaN(formData.quantity) || formData.quantity < 0) {
      setError('Quantity must be a non-negative number');
      return false;
    }
    if (formData.quantity > 999999) {
      setError('Quantity cannot exceed 999,999');
      return false;
    }

    // Threshold validation (optional field)
    if (formData.threshold !== '' && formData.threshold !== null && formData.threshold !== undefined) {
      if (isNaN(formData.threshold) || formData.threshold < 0) {
        setError('Threshold must be a non-negative number');
        return false;
      }
      if (formData.threshold > 9999) {
        setError('Threshold cannot exceed 9,999');
        return false;
      }
    }

    // Unit price validation (optional field)
    if (formData.unit_price !== '' && formData.unit_price !== null && formData.unit_price !== undefined) {
      if (isNaN(formData.unit_price) || formData.unit_price < 0) {
        setError('Unit price must be a non-negative number');
        return false;
      }
      if (formData.unit_price > 999999.99) {
        setError('Unit price cannot exceed 999,999.99');
        return false;
      }
    }

    // Location validation
    const locationStr = String(formData.location || '');
    if (!formData.location || !locationStr.trim()) {
      setError('Location is required');
      return false;
    }

    // Expiry date validation (optional field)
    if (formData.expire_date) {
      const expiryDate = new Date(formData.expire_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for comparison
      
      if (isNaN(expiryDate.getTime())) {
        setError('Please enter a valid expiry date');
        return false;
      }
      if (expiryDate < today) {
        setError('Expiry date cannot be in the past');
        return false;
      }
    }

    // Notes validation (optional field)
    if (formData.notes && formData.notes.length > 500) {
      setError('Notes must not exceed 500 characters');
      return false;
    }

    // Check if item ID already exists (only for new items)
    if (!isEditing && itemIdExists) {
      setError('Item ID already exists! Please choose a different Item ID.');
      return false;
    }
    
    return true;
  };

  //2. When user clicks "Save", this function runs
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('HandleSubmit called!', { isEditing, id, formData });
    
    console.log('Form submission started');
    console.log('Current form data:', formData);
    console.log('Is editing:', isEditing);
    
    if (!validateForm()) {
      console.log('Validation failed - stopping submission');
      return;
    }
    
    console.log('Validation passed, proceeding with API call...');

    try {
      setSubmitting(true);
      setError(null);

      //3. Convert strings to numbers for API
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        threshold: formData.threshold ? parseInt(formData.threshold) : null,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
        expire_date: formData.expire_date || null
      };

      if (isEditing) {
        console.log('Calling updateItem API with ID:', id);
        console.log('Calling updateItem API with data:', submitData);
        const result = await updateItem(id, submitData);
        console.log('Update API successful, result:', result);
        alert('Item updated successfully!'); // Temporary success indicator
      } else {
        console.log('Calling addItem API with:', submitData);
        const result = await addItem(submitData);
        console.log('Add API successful, result:', result);
        alert('Item added successfully!'); // Temporary success indicator
      }
      console.log('API call completed successfully, navigating to inventory list...');
      navigate('/inventory');

    } catch (err) {
      console.error('API call failed:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      let errorMessage = 'Failed to save item';
      
      if (err.response?.data?.message) {
        const backendMessage = err.response.data.message;
        
        if (backendMessage.includes('Item ID already exists')) {
          errorMessage = 'Item ID already exists! Please choose a different Item ID.';
        } else if (backendMessage.includes('validation failed')) {
          errorMessage = `Validation Error: ${backendMessage}`;
        } else {
          errorMessage = backendMessage;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      alert('Error: ' + errorMessage); // Temporary error alert
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/inventory');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-info mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-w-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar user={user} onLogout={handleLogout} />
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-100 min-w-0 overflow-y-auto">
        <div className="min-h-screen bg-gray-50 pt-0 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditing ? 'Update the inventory item details below.' : 'Fill in the details to add a new item to inventory.'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-fire-50 border border-fire-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-fire-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-fire-dark">Error</h3>
                <p className="mt-1 text-sm text-fire-dark">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item ID */}
            <div>
              <label htmlFor="item_ID" className="block text-sm font-medium text-gray-700 mb-2">
                Item ID <span className="text-fire">*</span>
              </label>
              <input
                type="text"
                id="item_ID"
                name="item_ID"
                value={formData.item_ID}
                onChange={handleInputChange}
                onKeyPress={(e) => {
                  // Only allow numbers (0-9) for Item ID
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                    alert('Only numbers (0-9) are allowed in the Item ID field.');
                  }
                }}
                required
                readOnly={isEditing}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.item_ID || itemIdExists
                    ? 'border-fire-300 focus:ring-fire focus:border-fire'
                    : fieldErrors.item_ID === '' && formData.item_ID && !itemIdExists && !checkingItemId
                    ? 'border-success-300 focus:ring-success focus:border-success'
                    : 'border-gray-300 focus:ring-info focus:border-info'
                } ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="Enter unique item ID (numbers only)"
              />
              
              {/* Field-specific error message */}
              {fieldErrors.item_ID && (
                <p className="mt-1 text-xs text-fire">
                  {fieldErrors.item_ID}
                </p>
              )}
              
              {isEditing && (
                <p className="mt-1 text-xs text-gray-500">
                  Item ID cannot be changed once created (Primary Key)
                </p>
              )}
              
              {/* Real-time Item ID validation */}
              {!isEditing && formData.item_ID && !fieldErrors.item_ID && (
                <div className="mt-1">
                  {checkingItemId ? (
                    <p className="text-xs text-info">
                      Checking if Item ID is available...
                    </p>
                  ) : itemIdExists ? (
                    <p className="text-xs text-fire font-medium">
                      Warning: This Item ID already exists! Please choose a different one.
                    </p>
                  ) : (
                    <p className="text-xs text-success font-medium">
                      Item ID is available
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Item Name */}
            <div>
              <label htmlFor="item_name" className="block text-sm font-medium text-gray-700 mb-2">
                Item Name <span className="text-fire">*</span>
              </label>
              <input
                type="text"
                id="item_name"
                name="item_name"
                value={formData.item_name}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.item_name
                    ? 'border-fire-300 focus:ring-fire focus:border-fire'
                    : fieldErrors.item_name === '' && formData.item_name
                    ? 'border-success-300 focus:ring-success focus:border-success'
                    : 'border-gray-300 focus:ring-info focus:border-info'
                }`}
                placeholder="Enter item name (2-100 characters, letters, numbers, and common symbols only)"
              />
              
              {/* Field-specific error message */}
              {fieldErrors.item_name && (
                <p className="mt-1 text-xs text-fire">
                  {fieldErrors.item_name}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-fire">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.category || (!formData.category && formData.category !== '')
                    ? 'border-fire-300 focus:ring-fire focus:border-fire'
                    : formData.category
                    ? 'border-success-300 focus:ring-success focus:border-success'
                    : 'border-gray-300 focus:ring-info focus:border-info'
                }`}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              {/* Field-specific error message */}
              {fieldErrors.category && (
                <p className="mt-1 text-xs text-fire">
                  {fieldErrors.category}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity <span className="text-fire">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                onKeyPress={(e) => {
                  // Only allow numbers (0-9)
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                    alert('Only numbers (0-9) are allowed in the Quantity field.');
                  }
                }}
                min="0"
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.quantity
                    ? 'border-fire-300 focus:ring-fire focus:border-fire'
                    : fieldErrors.quantity === '' && formData.quantity
                    ? 'border-success-300 focus:ring-success focus:border-success'
                    : 'border-gray-300 focus:ring-info focus:border-info'
                }`}
                placeholder="Enter quantity (0-999,999)"
              />
              
              {/* Field-specific error message */}
              {fieldErrors.quantity && (
                <p className="mt-1 text-xs text-fire">
                  {fieldErrors.quantity}
                </p>
              )}
            </div>

            {/* Unit Price */}
            <div>
              <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700 mb-2">
                Unit Price
              </label>
              <input
                type="number"
                id="unit_price"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleInputChange}
                onKeyPress={(e) => {
                  // Only allow numbers (0-9) and decimal point
                  if (!/[0-9.]/.test(e.key)) {
                    e.preventDefault();
                    alert('Only numbers (0-9) and decimal point (.) are allowed in the Unit Price field.');
                  }
                  // Prevent multiple decimal points
                  if (e.key === '.' && e.target.value.includes('.')) {
                    e.preventDefault();
                    alert('Only one decimal point is allowed in the Unit Price field.');
                  }
                }}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.unit_price
                    ? 'border-fire-300 focus:ring-fire focus:border-fire'
                    : fieldErrors.unit_price === '' && formData.unit_price
                    ? 'border-success-300 focus:ring-success focus:border-success'
                    : 'border-gray-300 focus:ring-info focus:border-info'
                }`}
                placeholder="Enter unit price (optional, max 999,999.99)"
              />
              
              {/* Field-specific error message */}
              {fieldErrors.unit_price && (
                <p className="mt-1 text-xs text-fire">
                  {fieldErrors.unit_price}
                </p>
              )}
            </div>

            {/* Condition */}
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-info focus:border-info"
              >
                <option value="Good">Good</option>
                <option value="Damaged">Damaged</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-fire">*</span>
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.location || (!formData.location && formData.location !== '')
                    ? 'border-fire-300 focus:ring-fire focus:border-fire'
                    : formData.location
                    ? 'border-success-300 focus:ring-success focus:border-success'
                    : 'border-gray-300 focus:ring-info focus:border-info'
                }`}
              >
                <option value="">Select location</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              
              {/* Field-specific error message */}
              {fieldErrors.location && (
                <p className="mt-1 text-xs text-fire">
                  {fieldErrors.location}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-info focus:border-info"
              >
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* Threshold */}
            <div>
              <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                id="threshold"
                name="threshold"
                value={formData.threshold}
                onChange={handleInputChange}
                onKeyPress={(e) => {
                  // Only allow numbers (0-9)
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                    alert('Only numbers (0-9) are allowed in the Threshold field.');
                  }
                }}
                min="0"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.threshold
                    ? 'border-fire-300 focus:ring-fire focus:border-fire'
                    : fieldErrors.threshold === '' && formData.threshold
                    ? 'border-success-300 focus:ring-success focus:border-success'
                    : 'border-gray-300 focus:ring-info focus:border-info'
                }`}
                placeholder="Enter threshold (0-9,999, default: 30)"
              />
              
              {/* Field-specific error message */}
              {fieldErrors.threshold && (
                <p className="mt-1 text-xs text-fire">
                  {fieldErrors.threshold}
                </p>
              )}
            </div>

            {/* Expire Date */}
            <div>
              <label htmlFor="expire_date" className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                id="expire_date"
                name="expire_date"
                value={formData.expire_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.expire_date
                    ? 'border-fire-300 focus:ring-fire focus:border-fire'
                    : fieldErrors.expire_date === '' && formData.expire_date
                    ? 'border-success-300 focus:ring-success focus:border-success'
                    : 'border-gray-300 focus:ring-info focus:border-info'
                }`}
              />
              
              {/* Field-specific error message */}
              {fieldErrors.expire_date && (
                <p className="mt-1 text-xs text-fire">
                  {fieldErrors.expire_date}
                </p>
              )}
            </div>

            {/* Notes - Full Width */}
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
                {formData.notes && (
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.notes.length}/500 characters)
                  </span>
                )}
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                maxLength="500"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.notes
                    ? 'border-fire-300 focus:ring-fire focus:border-fire'
                    : 'border-gray-300 focus:ring-info focus:border-info'
                }`}
                placeholder="Enter any additional notes about this item (max 500 characters)"
              />
              
              {/* Field-specific error message */}
              {fieldErrors.notes && (
                <p className="mt-1 text-xs text-fire">
                  {fieldErrors.notes}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 justify-end mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={(e) => {
                console.log('Button clicked!');
                // Don't prevent default here, let the form handle submission
              }}
              disabled={submitting}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-info hover:bg-info-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info disabled:bg-info-300"
            >
              {submitting ? 'Saving...' : (isEditing ? 'Update Item' : 'Add Item')}
            </button>
          </div>
        </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryForm;
