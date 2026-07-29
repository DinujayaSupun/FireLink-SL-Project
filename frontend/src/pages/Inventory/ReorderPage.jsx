import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getItemById } from '../../api/inventoryApi';
import { createReorder, getReorders, sendReorderToManager } from '../../api/inventoryReorderApi';
import firelinkLogo from '../../assets/images/firelink-logo.png';
import Sidebar from '../UserManagement/Sidebar';
import { FaUser } from 'react-icons/fa';

const ReorderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Get user data for sidebar
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/staff-login");
  };

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [reorderData, setReorderData] = useState({
    quantity: 0,
    supplier: '',
    expectedDate: '',
    priority: 'Medium',
    notes: ''
  });
  const [allReorders, setAllReorders] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastCreatedReorderId, setLastCreatedReorderId] = useState(null);

  const isLowStock = (item) => {
    // Only show low stock if quantity is BELOW threshold (not equal to)
    // AND if threshold is a reasonable value (not 0 or very low)
    if (!item || item.quantity === undefined || item.threshold === undefined) {
      return false;
    }
    
    // Convert to numbers to ensure proper comparison
    const quantity = Number(item.quantity);
    const threshold = Number(item.threshold);
    
    // Check for NaN values
    if (isNaN(quantity) || isNaN(threshold)) {
      return false;
    }
    
    return threshold > 0 && quantity < threshold;
  };

  // Print ref for PDF generation
  const printRef = useRef();

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [itemResponse, reordersResponse] = await Promise.all([
        getItemById(id),
        getReorders({ limit: 100 }) // Get recent reorders for PDF
      ]);

      if (itemResponse.success) {
        setItem(itemResponse.data);
        // Set default reorder quantity based on threshold
        setReorderData(prev => ({
          ...prev,
          quantity: Math.max(10, itemResponse.data.threshold * 2) // Order at least 2x threshold
        }));
      }

      if (reordersResponse.success) {
        setAllReorders(reordersResponse.data);
      }
    } catch (err) {
      setError('Failed to load initial data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReorderData(prev => ({
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
  };

  // Real-time field validation
  const validateField = (fieldName, value) => {
    let errorMessage = '';

    switch (fieldName) {
      case 'quantity':
        if (value === '' || value === null || value === undefined) {
          errorMessage = 'Quantity is required';
        } else if (isNaN(value) || value <= 0) {
          errorMessage = 'Quantity must be a positive number';
        } else if (value > 99999) {
          errorMessage = 'Quantity cannot exceed 99,999';
        } else if (!Number.isInteger(Number(value))) {
          errorMessage = 'Quantity must be a whole number';
        }
        break;

      case 'supplier':
        if (value && value.length > 0) {
          if (value.trim().length < 2) {
            errorMessage = 'Supplier name must be at least 2 characters long';
          } else if (value.length > 100) {
            errorMessage = 'Supplier name must not exceed 100 characters';
          } else if (!/^[A-Za-z0-9\s\-_().,&]+$/.test(value.trim())) {
            errorMessage = 'Supplier name contains invalid characters';
          }
        }
        break;

      case 'expectedDate':
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (isNaN(selectedDate.getTime())) {
            errorMessage = 'Please enter a valid date';
          } else if (selectedDate < today) {
            errorMessage = 'Expected delivery date cannot be in the past';
          } else {
            // Check if date is more than 2 years in the future
            const twoYearsFromNow = new Date();
            twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
            if (selectedDate > twoYearsFromNow) {
              errorMessage = 'Expected delivery date seems too far in the future';
            }
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

  // Comprehensive form validation
  const validateForm = () => {
    const errors = {};

    // Quantity validation (required)
    if (!reorderData.quantity || reorderData.quantity === '' || reorderData.quantity === 0) {
      errors.quantity = 'Quantity is required';
    } else if (isNaN(reorderData.quantity) || reorderData.quantity <= 0) {
      errors.quantity = 'Quantity must be a positive number';
    } else if (reorderData.quantity > 99999) {
      errors.quantity = 'Quantity cannot exceed 99,999';
    } else if (!Number.isInteger(Number(reorderData.quantity))) {
      errors.quantity = 'Quantity must be a whole number';
    }

    // Expected date validation (required)
    if (!reorderData.expectedDate || reorderData.expectedDate.trim() === '') {
      errors.expectedDate = 'Expected delivery date is required';
    } else {
      const selectedDate = new Date(reorderData.expectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(selectedDate.getTime())) {
        errors.expectedDate = 'Please enter a valid date';
      } else if (selectedDate < today) {
        errors.expectedDate = 'Expected delivery date cannot be in the past';
      } else {
        const twoYearsFromNow = new Date();
        twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
        if (selectedDate > twoYearsFromNow) {
          errors.expectedDate = 'Expected delivery date seems too far in the future';
        }
      }
    }

    // Priority validation (required)
    if (!reorderData.priority || reorderData.priority.trim() === '') {
      errors.priority = 'Priority is required';
    } else if (!['Low', 'Medium', 'High', 'Urgent'].includes(reorderData.priority)) {
      errors.priority = 'Please select a valid priority';
    }

    // Supplier validation (optional but if provided must be valid)
    if (reorderData.supplier && reorderData.supplier.trim().length > 0) {
      if (reorderData.supplier.trim().length < 2) {
        errors.supplier = 'Supplier name must be at least 2 characters long';
      } else if (reorderData.supplier.length > 100) {
        errors.supplier = 'Supplier name must not exceed 100 characters';
      } else if (!/^[A-Za-z0-9\s\-_().,&]+$/.test(reorderData.supplier.trim())) {
        errors.supplier = 'Supplier name contains invalid characters';
      }
    }

    // Notes validation (optional)
    if (reorderData.notes && reorderData.notes.length > 500) {
      errors.notes = 'Notes must not exceed 500 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setError('Please fix the validation errors before submitting');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const reorderPayload = {
        inventoryItemId: id,
        quantity: reorderData.quantity,
        priority: reorderData.priority,
        expectedDate: reorderData.expectedDate,
        supplier: reorderData.supplier || 'To be determined',
        notes: reorderData.notes
      };

      const response = await createReorder(reorderPayload);
      
      if (response.success) {
        // Store the reorder ID for sending to manager
        setLastCreatedReorderId(response.data._id);
        
        // Refresh reorders list for PDF
        const reordersResponse = await getReorders({ limit: 100 });
        if (reordersResponse.success) {
          setAllReorders(reordersResponse.data);
        }
        
        alert('Reorder submitted successfully! You can now generate PDF and send to Supply Manager.');
        // Don't navigate away - let user generate PDF and send to manager
      }
    } catch (err) {
      setError('Failed to submit reorder: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Enhanced PDF Generation with reorder items table - matches inventory report style
  const handleGeneratePDF = () => {
    try {
      console.log('Generating PDF with reorder items table...');
      
      const printContent = printRef.current;
      if (!printContent) {
        alert('Print content not found. Please refresh the page.');
        return;
      }

      // Create a new window for PDF generation (matching inventory report method)
      const printWindow = window.open('', '', 'width=800,height=600');
      let reportContent = printContent.innerHTML;
      
      // Remove emojis, icons, and interactive elements from content
      reportContent = reportContent.replace(/🔥|📄|📊|📈|📋|⚠️|🖨️|🚒/g, '');
      reportContent = reportContent.replace(/✕/g, '');
      
      // Remove any input, select, or button elements
      reportContent = reportContent.replace(/<input[^>]*>/g, '');
      reportContent = reportContent.replace(/<select[^>]*>.*?<\/select>/g, '');
      reportContent = reportContent.replace(/<button[^>]*>.*?<\/button>/g, '');
      
      // Create a temporary DOM to manipulate the content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = reportContent;
      
      // Remove all hidden headers and cells
      const hiddenHeaders = tempDiv.querySelectorAll('th[class*="print:hidden"]');
      hiddenHeaders.forEach(header => {
        console.log('Removing hidden header from PDF:', header.textContent);
        header.remove();
      });
      
      const hiddenCells = tempDiv.querySelectorAll('td[class*="print:hidden"]');
      hiddenCells.forEach(cell => {
        console.log('Removing hidden cell from PDF');
        cell.remove();
      });
      
      reportContent = tempDiv.innerHTML;
      
      // Set custom filename for PDF
      const currentDatePDF = new Date().toISOString().split('T')[0];
      const customFilenamePDF = `FireLink-SL_Reorder_Report_${currentDatePDF}`;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${customFilenamePDF}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4; margin: 15mm; }
            body { 
              font-size: 12px; 
              line-height: 1.3; 
              color: black !important;
              background: white !important;
            }
            * {
              color: black !important;
              background: white !important;
              border-color: black !important;
            }
            /* Hide any interactive elements in PDF */
            input, select, button, .search, .filter, .dropdown,
            .form-control, input[type="text"], input[type="search"] {
              display: none !important;
            }
            table { 
              page-break-inside: auto; 
              width: 100%; 
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black !important;
              background: white !important;
              color: black !important;
              padding: 8px;
            }
            th {
              background: #f5f5f5 !important;
              font-weight: bold;
            }
            tr { 
              page-break-inside: avoid; 
              page-break-after: auto; 
            }
            .print\\:hidden { display: none !important; }
            .print\\:text-xs { font-size: 10px; }
            .print\\:bg-white { background-color: white !important; }
            .print\\:border-b { border-bottom: 1px solid black; }
            .print\\:border-fire { border-color: black; }
            .print\\:break-inside-avoid { page-break-inside: avoid; }
            .bg-fire, .bg-success-100, .bg-amber-100, .bg-fire-100,
            .bg-gray-50, .bg-fire-50, .bg-amber-100, .bg-info-100 {
              background: white !important;
              color: black !important;
            }
            .text-fire, .text-success, .text-amber,
            .text-fire-dark, .text-success-dark, .text-amber-dark,
            .text-amber, .text-info, .text-gray-600 {
              color: black !important;
            }
            .border-fire, .border-fire-300, .border-fire-200,
            .border-gray-300, .border-gray-200 {
              border-color: black !important;
            }
            .rounded-full, .rounded, .rounded-lg, .rounded-md {
              border-radius: 0 !important;
            }
          </style>
        </head>
        <body class="bg-white p-4">
          ${reportContent}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Send Report to Supply Manager
  const handleSendToManager = async () => {
    if (!lastCreatedReorderId) {
      alert('Please submit a reorder first before sending to Supply Manager.');
      return;
    }

    if (!item) {
      alert('Item data not loaded. Please refresh the page.');
      return;
    }

    try {
      setSending(true);
      console.log('Preparing to send reorder to Supply Manager...');

      // Generate PDF data as base64
      const printContent = printRef.current;
      if (!printContent) {
        alert('Report content not found. Please try again.');
        setSending(false);
        return;
      }

      // Create a temporary iframe for PDF conversion
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      let reportContent = printContent.innerHTML;
      
      // Clean up content
      reportContent = reportContent.replace(/🔥|📄|📊|📈|📋|⚠️|🖨️|🚒/g, '');
      reportContent = reportContent.replace(/✕/g, '');
      reportContent = reportContent.replace(/<input[^>]*>/g, '');
      reportContent = reportContent.replace(/<select[^>]*>.*?<\/select>/g, '');
      reportContent = reportContent.replace(/<button[^>]*>.*?<\/button>/g, '');

      // Write content to iframe
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Reorder Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background: #f5f5f5; font-weight: bold; }
          </style>
        </head>
        <body>${reportContent}</body>
        </html>
      `);
      iframeDoc.close();

      // Convert to base64 (simplified - stores HTML as base64)
      const htmlContent = iframeDoc.documentElement.outerHTML;
      const base64PDF = btoa(unescape(encodeURIComponent(htmlContent)));

      // Remove iframe
      document.body.removeChild(iframe);

      // Prepare report data
      const reportData = {
        itemName: item.item_name,
        itemId: item.item_ID,
        category: item.category,
        currentQuantity: item.quantity,
        threshold: item.threshold,
        reorderQuantity: reorderData.quantity,
        priority: reorderData.priority,
        expectedDate: reorderData.expectedDate,
        supplier: reorderData.supplier || 'To be determined',
        notes: reorderData.notes,
        location: item.location,
        condition: item.condition,
        status: item.status,
        submittedAt: new Date().toISOString()
      };

      console.log('Sending to backend...', { reorderId: lastCreatedReorderId });

      // Send to backend
      const response = await sendReorderToManager(lastCreatedReorderId, base64PDF, reportData);

      if (response.success) {
        alert(`Report sent to Supply Manager successfully!\n\nReorder ID: ${response.data.reorderId}\nItem: ${response.data.itemName}\nQuantity: ${response.data.quantity}\nPriority: ${response.data.priority}`);
        console.log('Report sent successfully:', response.data);
      } else {
        alert('Failed to send report to Supply Manager. Please try again.');
      }

    } catch (error) {
      console.error('Send to manager error:', error);
      alert('Error sending report: ' + (error.message || 'Unknown error'));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fire mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reorder form...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-fire mb-4">{error || 'Item not found'}</p>
          <Link to="/inventory" className="text-info hover:underline">
            ← Back to Inventory
          </Link>
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
        <div className="max-w-4xl mx-auto px-4 pt-0 pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reorder Item</h1>
            <p className="text-gray-600">Create reorder for low stock item</p>
          </div>
          <div className="flex gap-3 items-center">
            <Link
              to="/inventory-manager/profile"
              className="bg-fire hover:bg-fire-dark text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <FaUser className="text-sm" />
              Profile
            </Link>
            <Link
              to="/inventory"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              ← Back to Inventory
            </Link>
          </div>
        </div>
      </div>

      {/* Item Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Item Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Item Name</p>
            <p className="text-lg text-gray-900">{item.item_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Item ID</p>
            <p className="text-lg text-gray-900">{item.item_ID}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Category</p>
            <p className="text-lg text-gray-900">{item.category}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Current Stock</p>
            <p className="text-lg text-gray-900">{item.quantity}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Threshold</p>
            <p className="text-lg text-gray-900">{item.threshold}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              (item.threshold > 0 && item.quantity < item.threshold) ? 'bg-amber-100 text-amber-dark' : 'bg-success-100 text-success-dark'
            }`}>
              {(item.threshold > 0 && item.quantity < item.threshold) ? 'Low Stock' : 'Normal'}
            </span>
          </div>
        </div>
      </div>

      {/* Current Reorder Summary */}
      <div className="bg-info-50 rounded-lg border border-info-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-info-dark mb-4">Current Reorder Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded border">
            <p className="text-sm font-medium text-gray-500">Quantity to Order</p>
            <p className="text-2xl font-bold text-info">{reorderData.quantity} units</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm font-medium text-gray-500">Priority</p>
            <p className={`text-lg font-semibold ${
              reorderData.priority === 'Urgent' ? 'text-fire' :
              reorderData.priority === 'High' ? 'text-amber' :
              reorderData.priority === 'Medium' ? 'text-info' : 'text-gray-600'
            }`}>
              {reorderData.priority}
            </p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm font-medium text-gray-500">Expected Date</p>
            <p className="text-lg text-gray-900">{reorderData.expectedDate || 'Not set'}</p>
          </div>
        </div>
        {reorderData.supplier && (
          <div className="mt-4 bg-white p-3 rounded border">
            <p className="text-sm font-medium text-gray-500">Supplier</p>
            <p className="text-lg text-gray-900">{reorderData.supplier}</p>
          </div>
        )}
        {reorderData.notes && (
          <div className="mt-4 bg-white p-3 rounded border">
            <p className="text-sm font-medium text-gray-500">Notes</p>
            <p className="text-gray-900">{reorderData.notes}</p>
          </div>
        )}
      </div>

      {/* Reorder Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reorder Details</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Order *
              </label>
              <input
                type="number"
                name="quantity"
                value={reorderData.quantity}
                onChange={handleInputChange}
                min="1"
                step="1"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  fieldErrors.quantity
                    ? 'border-fire-300 focus:ring-fire focus:border-fire'
                    : fieldErrors.quantity === '' && reorderData.quantity > 0
                    ? 'border-success-300 focus:ring-success focus:border-success'
                    : 'border-gray-300 focus:ring-fire'
                }`}
                placeholder="Enter quantity to order (1-99,999)"
              />
              
              {/* Field-specific error message */}
              {fieldErrors.quantity && (
                <p className="mt-1 text-xs text-fire">
                  {fieldErrors.quantity}
                </p>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                Recommended: {Math.max(10, item.threshold * 2)} units
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                name="priority"
                value={reorderData.priority}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  fieldErrors.priority
                    ? 'border-fire-300 focus:ring-fire focus:border-fire'
                    : reorderData.priority
                    ? 'border-success-300 focus:ring-success focus:border-success'
                    : 'border-gray-300 focus:ring-fire'
                }`}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
              
              {/* Field-specific error message */}
              {fieldErrors.priority && (
                <p className="mt-1 text-xs text-fire">
                  {fieldErrors.priority}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery Date *
              </label>
              <input
                type="date"
                name="expectedDate"
                value={reorderData.expectedDate}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  fieldErrors.expectedDate
                    ? 'border-fire-300 focus:ring-fire focus:border-fire'
                    : fieldErrors.expectedDate === '' && reorderData.expectedDate
                    ? 'border-success-300 focus:ring-success focus:border-success'
                    : 'border-gray-300 focus:ring-fire'
                }`}
              />
              
              {/* Field-specific error message */}
              {fieldErrors.expectedDate && (
                <p className="mt-1 text-xs text-fire">
                  {fieldErrors.expectedDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier
              </label>
              <input
                type="text"
                name="supplier"
                value={reorderData.supplier}
                onChange={handleInputChange}
                placeholder="Enter supplier name (2-100 characters, optional)"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  fieldErrors.supplier
                    ? 'border-fire-300 focus:ring-fire focus:border-fire'
                    : fieldErrors.supplier === '' && reorderData.supplier
                    ? 'border-success-300 focus:ring-success focus:border-success'
                    : 'border-gray-300 focus:ring-fire'
                }`}
              />
              
              {/* Field-specific error message */}
              {fieldErrors.supplier && (
                <p className="mt-1 text-xs text-fire">
                  {fieldErrors.supplier}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
              {reorderData.notes && (
                <span className="text-xs text-gray-500 ml-2">
                  ({reorderData.notes.length}/500 characters)
                </span>
              )}
            </label>
            <textarea
              name="notes"
              value={reorderData.notes}
              onChange={handleInputChange}
              rows="3"
              maxLength="500"
              placeholder="Any additional information about this reorder... (max 500 characters)"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                fieldErrors.notes
                  ? 'border-fire-300 focus:ring-fire focus:border-fire'
                  : 'border-gray-300 focus:ring-fire'
              }`}
            />
            
            {/* Field-specific error message */}
            {fieldErrors.notes && (
              <p className="mt-1 text-xs text-fire">
                {fieldErrors.notes}
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-fire hover:bg-fire-dark disabled:bg-fire-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              {submitting ? 'Submitting...' : 'Submit Reorder'}
            </button>
            <button
              type="button"
              onClick={handleGeneratePDF}
              disabled={!item || !reorderData.quantity}
              className="bg-white text-navy border border-gray-300 hover:bg-gray-50 disabled:opacity-45 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Download PDF Report
            </button>
            <button
              type="button"
              onClick={handleSendToManager}
              disabled={!lastCreatedReorderId || sending}
              className="bg-white text-navy border border-gray-300 hover:bg-gray-50 disabled:opacity-45 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              {sending ? 'Sending...' : 'Send to Supply Manager'}
            </button>
            <Link
              to="/inventory"
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Hidden Printable Component for PDF */}
      <div ref={printRef} className="hidden">
        <div className="print-content p-8 max-w-4xl mx-auto bg-white">
          {/* Official Government Header */}
          <div className="border-b-2 border-fire pb-3 print:pb-2 mb-4 print:mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 print:space-x-2">
                <div className="w-12 h-12 print:w-8 print:h-8 mr-2 flex-shrink-0">
                  <img 
                    src={firelinkLogo} 
                    alt="FireLink-SL Logo" 
                    className="w-full h-full object-contain rounded print:rounded-none"
                    onError={(e) => {
                      console.log('Logo failed to load, showing fallback');
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-fire rounded-full flex items-center justify-center text-white font-bold text-sm print:text-xs hidden">
                    
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-fire print:text-base">FIRELINK-SL</h1>
                  <p className="text-xs font-semibold print:text-[10px] text-gray-700">Fire and Rescue Service</p>
                  <div className="text-[10px] text-gray-600 print:text-[8px] mt-1">
                    <p className="font-medium">Main Fire Station (Head Quarters)</p>
                    <p>T.B. Jaya Mawatha, Colombo 10, Sri Lanka</p>
                    <p>Contact: (+94) 11-1234567</p>
                  </div>
                </div>
              </div>
              
              {/* Report Title & Quick Stats */}
              <div className="text-right">
                <h2 className="text-base font-bold text-gray-800 print:text-sm">INVENTORY REORDER REPORT</h2>
                <p className="text-[10px] text-gray-600 print:text-[8px]">{new Date().toLocaleDateString()} | Item: {item.item_name} | Priority: {reorderData.priority}</p>
              </div>
            </div>
          </div>

          {/* Reorder Summary */}
          <div className="border border-gray-300 p-2 print:p-1 mb-1 print:mb-0">
            <div className="grid grid-cols-4 gap-2 print:gap-1 text-center text-xs print:text-[10px]">
              <div>
                <p className="font-semibold text-gray-700 print:text-[8px]">Current Stock</p>
                <p className="text-sm print:text-[10px] font-bold text-info">{item.quantity}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 print:text-[8px]">Reorder Quantity</p>
                <p className="text-sm print:text-[10px] font-bold text-success">{reorderData.quantity}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 print:text-[8px]">Priority Level</p>
                <p className={`text-sm print:text-[10px] font-bold ${
                  reorderData.priority === 'Urgent' ? 'text-fire' :
                  reorderData.priority === 'High' ? 'text-amber' :
                  reorderData.priority === 'Medium' ? 'text-info' : 'text-gray-600'
                }`}>{reorderData.priority}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 print:text-[8px]">Status</p>
                <p className={`text-sm print:text-[10px] font-bold ${(item.threshold > 0 && item.quantity < item.threshold) ? 'text-fire' : 'text-success'}`}>
                  {(item.threshold > 0 && item.quantity < item.threshold) ? 'LOW STOCK' : 'NORMAL'}
                </p>
              </div>
            </div>
          </div>

          {/* Current Reorder Details */}
          <div className="border border-gray-300 mt-0 print:mt-0 mb-4">
            <h3 className="text-base font-semibold mb-1 print:mb-0 p-2 print:p-1 bg-gray-50 text-fire print:bg-white print:border-b print:border-fire print:text-sm">ITEM DETAILS</h3>
            <div className="p-3 print:p-2">
              <div className="grid grid-cols-3 gap-4 text-sm print:text-xs">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Item Name:</p>
                  <p className="font-semibold text-gray-900">{item.item_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Item ID:</p>
                  <p className="font-semibold text-gray-900">{item.item_ID}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Category:</p>
                  <p className="font-semibold text-gray-900">{item.category}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Current Stock:</p>
                  <p className="font-semibold text-gray-900">{item.quantity} units</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Reorder Threshold:</p>
                  <p className="font-semibold text-gray-900">{item.threshold} units</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Location:</p>
                  <p className="font-semibold text-gray-900">{item.location || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reorder Information */}
          <div className="border border-gray-300 mt-2 print:mt-1 mb-4">
            <h3 className="text-base font-semibold mb-1 print:mb-0 p-2 print:p-1 bg-gray-50 text-fire print:bg-white print:border-b print:border-fire print:text-sm">REORDER DETAILS</h3>
            <div className="p-3 print:p-2">
              <div className="grid grid-cols-2 gap-4 text-sm print:text-xs mb-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Quantity to Order:</p>
                  <p className="text-lg font-bold text-fire">{reorderData.quantity} units</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Priority Level:</p>
                  <p className={`text-lg font-semibold ${
                    reorderData.priority === 'Urgent' ? 'text-fire' :
                    reorderData.priority === 'High' ? 'text-amber' :
                    reorderData.priority === 'Medium' ? 'text-info' : 'text-gray-600'
                  }`}>
                    {reorderData.priority.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Expected Delivery:</p>
                  <p className="font-semibold text-gray-900">{reorderData.expectedDate || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Supplier:</p>
                  <p className="font-semibold text-gray-900">{reorderData.supplier || 'To be determined'}</p>
                </div>
              </div>
              
              {/* Additional Notes */}
              {reorderData.notes && (
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">Additional Notes:</p>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded text-sm">{reorderData.notes}</p>
                </div>
              )}
            </div>
          </div>



          {/* All Reorder Items Table */}
          <div className="border border-gray-300 mt-2 print:mt-1 mb-4">
            <h3 className="text-base font-semibold mb-1 print:mb-0 p-2 print:p-1 bg-gray-50 text-fire print:bg-white print:border-b print:border-fire print:text-sm">REORDER REQUESTS LISTING</h3>
            {allReorders.length > 0 ? (
              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full text-sm print:text-xs">
                  <thead className="bg-fire text-white">
                    <tr>
                      <th className="px-3 py-2 text-left">Item Name</th>
                      <th className="px-3 py-2 text-center">Category</th>
                      <th className="px-3 py-2 text-center">Quantity</th>
                      <th className="px-3 py-2 text-center">Priority</th>
                      <th className="px-3 py-2 text-center">Status</th>
                      <th className="px-3 py-2 text-center">Expected Date</th>
                      <th className="px-3 py-2 text-center print:hidden">Supplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allReorders.map((reorder, index) => (
                      <tr key={reorder._id || index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-3 py-2 border-b">{reorder.item_name}</td>
                        <td className="px-3 py-2 border-b text-center">{reorder.category}</td>
                        <td className="px-3 py-2 border-b text-center">{reorder.quantity}</td>
                        <td className="px-3 py-2 border-b text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            reorder.priority === 'Urgent' ? 'bg-fire-100 text-fire-dark' :
                            reorder.priority === 'High' ? 'bg-amber-100 text-amber-dark' :
                            reorder.priority === 'Medium' ? 'bg-info-100 text-info-dark' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {reorder.priority}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-b text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            reorder.status === 'Pending' ? 'bg-amber-100 text-amber-dark' :
                            reorder.status === 'Approved' ? 'bg-success-100 text-success-dark' :
                            reorder.status === 'In Transit' ? 'bg-info-100 text-info-dark' :
                            reorder.status === 'Delivered' ? 'bg-success-100 text-success-dark' : 'bg-fire-100 text-fire-dark'
                          }`}>
                            {reorder.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-b text-center">
                          {new Date(reorder.expectedDate).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 border-b text-center print:hidden">{reorder.supplier || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 italic">No reorder requests found</div>
            )}
          </div>

          {/* Critical Items Section */}
          {(item.threshold > 0 && item.quantity < item.threshold) && (
            <div className="border border-fire-300 p-4 mt-4 bg-fire-50">
              <h3 className="text-lg font-semibold mb-3 text-fire">
                URGENT REORDER REQUIRED
              </h3>
              <div className="bg-white p-3 rounded border border-fire-200">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">{item.item_name}</span>
                    <span className="text-gray-600 ml-2">({item.item_ID})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-fire font-bold">Stock: {item.quantity}</span>
                    <span className="text-gray-500 ml-2">/ Threshold: {item.threshold}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  <strong>Requesting:</strong> {reorderData.quantity} units | <strong>Priority:</strong> {reorderData.priority}
                </div>
              </div>
            </div>
          )}

          {/* Report Footer */}
          <div className="border-t-2 border-fire mt-6 pt-4 print:mt-4 print:pt-2">
            <div className="grid grid-cols-3 gap-4 text-sm print:text-xs">
              <div>
                <h4 className="font-semibold text-fire mb-2 print:mb-1">SYSTEM INFORMATION</h4>
                <p><strong>Generated By:</strong> FireLink-SL IMS</p>
                <p><strong>Platform Version:</strong> 2.1.0</p>
                <p><strong>Database:</strong> MongoDB Atlas</p>
              </div>
              <div>
                <h4 className="font-semibold text-fire mb-2 print:mb-1">CONTACT INFORMATION</h4>
                <p><strong>Emergency Hotline:</strong> 110</p>
                <p><strong>Admin Office:</strong> +94-11-XXXXXXX</p>
                <p><strong>Email:</strong> inventory@firelink.lk</p>
              </div>
              <div>
                <h4 className="font-semibold text-fire mb-2 print:mb-1">DOCUMENT CONTROL</h4>
                <p><strong>Valid Until:</strong> {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                <p><strong>Next Review:</strong> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                <p><strong>Page:</strong> 1 of 1</p>
              </div>
            </div>
            
            {/* Official Disclaimer */}
            <div className="bg-fire-50 print:bg-gray-100 p-3 print:p-2 rounded print:rounded-none mt-4 print:mt-2 border border-fire-200 print:border-gray-300">
              <p className="text-xs print:text-[10px] text-gray-700 text-center">
                <strong>CONFIDENTIAL DOCUMENT</strong> - This reorder report contains sensitive procurement data of the Fire and Rescue Service of Sri Lanka. 
                Distribution is restricted to authorized personnel only. Any unauthorized disclosure, copying, or distribution is strictly prohibited. 
                For questions regarding this reorder, contact the Inventory Management Department at inventory@firelink.lk
              </p>
            </div>
            
            {/* Report Signature Section */}
            <div className="grid grid-cols-2 gap-8 mt-6 print:mt-4 text-sm print:text-xs">
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2 print:pt-1 mt-8 print:mt-6">
                  <p><strong>Inventory Manager</strong></p>
                  <p className="text-gray-600">Fire and Rescue Service</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2 print:pt-1 mt-8 print:mt-6">
                  <p><strong>Department Head</strong></p>
                  <p className="text-gray-600">Emergency Services Division</p>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default ReorderPage;
