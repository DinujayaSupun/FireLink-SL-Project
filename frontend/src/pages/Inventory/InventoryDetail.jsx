import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getItemById, deleteItem } from '../../api/inventoryApi';
import Sidebar from '../UserManagement/Sidebar';

const InventoryDetail = () => {
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
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadItemData();
  }, [id]);

  const loadItemData = async () => {
    try {
      setLoading(true);
      const response = await getItemById(id);
      
      if (response.success) {
        setItem(response.data);
      } else {
        setError('Item not found');
      }
    } catch (err) {
      setError('Failed to load item data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        setDeleting(true);
        await deleteItem(id);
        navigate('/inventory');
      } catch (err) {
        setError('Failed to delete item');
        console.error(err);
      } finally {
        setDeleting(false);
      }
    }
  };

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

  const isExpired = (item) => {
    if (!item || !item.expire_date) return false;
    return new Date(item.expire_date) < new Date();
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Good': return 'bg-success-100 text-success-dark';
      case 'Damaged': return 'bg-amber-100 text-amber-dark';
      case 'Expired': return 'bg-fire-100 text-fire-dark';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-success-100 text-success-dark';
      case 'In Use': return 'bg-info-100 text-info-dark';
      case 'Maintenance': return 'bg-amber-100 text-amber-dark';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-info mx-auto mb-4"></div>
          <p className="text-gray-600">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-fire text-6xl mb-4 font-bold">⚠</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested item could not be found.'}</p>
          <Link
            to="/inventory"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-info hover:bg-info-dark"
          >
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
        <div className="min-h-screen bg-gray-50 pt-0 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Link
                  to="/inventory"
                  className="text-info hover:text-info-dark text-sm font-medium"
                >
                  ← Back to Inventory
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{item.item_name}</h1>
              <p className="text-gray-600">Item ID: {item.item_ID}</p>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/inventory/edit/${item._id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Item
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-fire hover:bg-fire-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fire disabled:bg-fire-300"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Item
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {(isLowStock(item) || isExpired(item)) && (
          <div className="mb-6 space-y-3">
            {isLowStock(item) && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-dark">Low Stock Alert</h3>
                    <div className="mt-2 text-sm text-amber-dark">
                      <p>Current stock ({item.quantity}) is below the threshold ({item.threshold}).</p>
                      <div className="mt-3">
                        <Link
                          to={`/inventory/${item._id}/reorder`}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-amber-dark bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber"
                        >
                          Create Reorder
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {isExpired(item) && (
              <div className="bg-fire-50 border border-fire-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-fire-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-fire-dark">Expired Item Alert</h3>
                    <div className="mt-2 text-sm text-fire-dark">
                      <p>This item expired on {new Date(item.expire_date).toLocaleDateString()}. Immediate replacement is required.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Item Details */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Item Details</h2>
          </div>
          
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Item Name</label>
                  <p className="mt-1 text-sm text-gray-900 font-medium">{item.item_name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Item ID</label>
                  <p className="mt-1 text-sm text-gray-900">{item.item_ID}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Category</label>
                  <p className="mt-1 text-sm text-gray-900">{item.category}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Location</label>
                  <p className="mt-1 text-sm text-gray-900">{item.location || 'Not specified'}</p>
                </div>
              </div>

              {/* Stock Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Current Quantity</label>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{item.quantity} units</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Low Stock Threshold</label>
                  <p className="mt-1 text-sm text-gray-900">{item.threshold} units</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Condition</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(item.condition)}`}>
                    {item.condition}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Expiry Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {item.expire_date ? new Date(item.expire_date).toLocaleDateString() : 'Not specified'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(item.lastUpdated).toLocaleDateString()} at {new Date(item.lastUpdated).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              {item.notes && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-500">Notes</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded border">{item.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Link
              to={`/inventory/${item._id}/reorder`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-info hover:bg-info-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info"
            >
              Create Reorder
            </Link>
            <Link
              to="/inventory/reorders"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info"
            >
              View All Reorders
            </Link>
            <Link
              to="/inventory"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info"
            >
              ← Back to Inventory
            </Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default InventoryDetail;
