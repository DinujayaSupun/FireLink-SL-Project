import React, { useState } from 'react';
import { 
  assignItemToVehicle, 
  updateVehicleItem, 
  removeVehicleItem 
} from '../api/inventoryVehicleItemsApi';
import { getItems } from '../api/inventoryApi';

const InventoryVehicleItemsTable = ({ 
  vehicle_ID, 
  vehicleItems, 
  onRefresh,
  availableItems = [] 
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    item_ID: '',
    quantity: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper functions for expiry status
  const isExpiringSoon = (expireDate) => {
    if (!expireDate) return false;
    const expiry = new Date(expireDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    return expiry <= thirtyDaysFromNow && expiry > now;
  };

  const isExpired = (expireDate) => {
    if (!expireDate) return false;
    return new Date(expireDate) < new Date();
  };

  const getExpiryStatus = (expireDate) => {
    if (isExpired(expireDate)) return 'Expired';
    if (isExpiringSoon(expireDate)) return 'Expiring Soon';
    return 'OK';
  };

  const getExpiryColor = (expireDate) => {
    if (isExpired(expireDate)) return 'bg-fire-100 text-fire-dark';
    if (isExpiringSoon(expireDate)) return 'bg-amber-100 text-amber-dark';
    return 'bg-success-100 text-success-dark';
  };

  // Handle edit quantity
  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditQuantity(item.quantity.toString());
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await updateVehicleItem(editingId, parseInt(editQuantity));
      setEditingId(null);
      setEditQuantity('');
      onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQuantity('');
  };

  // Handle remove item
  const handleRemove = async (id) => {
    if (!window.confirm('Are you sure you want to remove this item from the vehicle?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await removeVehicleItem(id);
      onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle assign new item
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      await assignItemToVehicle(
        vehicle_ID, 
        assignForm.item_ID, 
        parseInt(assignForm.quantity)
      );
      
      setAssignForm({ item_ID: '', quantity: 1 });
      setShowAssignModal(false);
      onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignInputChange = (e) => {
    const { name, value } = e.target;
    setAssignForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Vehicle Items</h3>
          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-info hover:bg-info-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Assign New Item
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-6 py-3 bg-fire-50 border-b border-fire-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-fire-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-fire-dark">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicleItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No items assigned to this vehicle
                </td>
              </tr>
            ) : (
              vehicleItems.map((vehicleItem) => (
                <tr key={vehicleItem._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {vehicleItem.item_ID?.item_name || 'Unknown Item'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {vehicleItem.item_ID?.category || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === vehicleItem._id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <button
                          onClick={handleSaveEdit}
                          disabled={loading}
                          className="text-success hover:text-success-dark text-sm font-medium"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-900">
                        {vehicleItem.quantity}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {vehicleItem.item_ID?.expire_date 
                        ? new Date(vehicleItem.item_ID.expire_date).toLocaleDateString()
                        : 'No expiry'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getExpiryColor(vehicleItem.item_ID?.expire_date)}`}>
                      {getExpiryStatus(vehicleItem.item_ID?.expire_date)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(vehicleItem)}
                        disabled={loading || editingId === vehicleItem._id}
                        className="text-info hover:text-info-dark disabled:text-gray-400"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleRemove(vehicleItem._id)}
                        disabled={loading}
                        className="text-fire hover:text-fire-dark disabled:text-gray-400"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Item Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assign New Item</h3>
              
              <form onSubmit={handleAssignSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Item
                  </label>
                  <select
                    name="item_ID"
                    value={assignForm.item_ID}
                    onChange={handleAssignInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-info focus:border-info"
                  >
                    <option value="">Choose an item...</option>
                    {availableItems.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.item_name} ({item.category})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={assignForm.quantity}
                    onChange={handleAssignInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-info focus:border-info"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-info hover:bg-info-dark disabled:bg-info-300"
                  >
                    {loading ? 'Assigning...' : 'Assign Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryVehicleItemsTable;
