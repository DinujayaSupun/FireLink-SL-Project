import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getAllVehicleItems, assignItemToVehicle, updateVehicleItem, removeVehicleItem } from '../../api/inventoryVehicleItemsApi';
import { getItems } from '../../api/inventoryApi';
import { getVehicles } from '../../api/inventoryVehicleApi';
import Sidebar from '../UserManagement/Sidebar';

const VehicleItemsPage = () => {
  const { vehicleId } = useParams(); // Get vehicleId from URL if present
  const navigate = useNavigate();

  // Get user data for sidebar
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/staff-login");
  };

  const [vehicleItems, setVehicleItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  // Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ vehicle_ID: vehicleId || '', item_ID: '', quantity: 1 });
  const [editForm, setEditForm] = useState({ id: '', quantity: 1 });
  const [feedback, setFeedback] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleId || ''); // Auto-select if vehicleId in URL
  const [selectedItem, setSelectedItem] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Update selected vehicle when vehicleId from URL changes
    if (vehicleId && vehicleId !== selectedVehicle) {
      setSelectedVehicle(vehicleId);
    }
  }, [vehicleId]);

  useEffect(() => {
    loadVehicleItemsData();
  }, [currentPage, itemsPerPage, selectedVehicle, selectedItem]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [itemsResponse, vehiclesResponse] = await Promise.all([
        getItems({ limit: 1000 }), // Get all items for filter dropdown
        getVehicles(1, 1000) // Get all vehicles for filter dropdown
      ]);
      
      if (itemsResponse.success) {
        setAvailableItems(itemsResponse.data);
      }
      
      if (vehiclesResponse.success) {
        setAvailableVehicles(vehiclesResponse.data);
      }
      
      await loadVehicleItemsData();
    } catch (err) {
      setError('Failed to load initial data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicleItemsData = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedVehicle) filters.vehicle_ID = selectedVehicle;
      if (selectedItem) filters.item_ID = selectedItem;

      const response = await getAllVehicleItems(currentPage, itemsPerPage, filters);
      
      if (response.success) {
        setVehicleItems(response.data);
        setTotalItems(response.pagination.totalItems);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err) {
      setError('Failed to load vehicle items data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helpers for feedback
  const flash = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Assign modal handlers
  const openAssignModal = () => {
    setAssignForm({ vehicle_ID: selectedVehicle || '', item_ID: '', quantity: 1 });
    setShowAssignModal(true);
  };
  const closeAssignModal = () => setShowAssignModal(false);

  const handleAssignChange = (e) => {
    const { name, value } = e.target;
    setAssignForm(prev => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const submitAssign = async (e) => {
    e.preventDefault();
    if (!assignForm.vehicle_ID || !assignForm.item_ID || assignForm.quantity < 1) {
      flash('All fields are required and quantity must be >=1', 'error');
      return;
    }
    try {
      setActionLoading(true);
      await assignItemToVehicle(assignForm.vehicle_ID, assignForm.item_ID, assignForm.quantity);
      flash('Item assigned successfully');
      closeAssignModal();
      await loadVehicleItemsData();
    } catch (err) {
      flash(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit quantity handlers
  const openEditModal = (assignment) => {
    setEditForm({ id: assignment._id, quantity: assignment.quantity });
    setShowEditModal(true);
  };
  const closeEditModal = () => setShowEditModal(false);
  const handleEditChange = (e) => {
    setEditForm(prev => ({ ...prev, quantity: Number(e.target.value) }));
  };
  const submitEdit = async (e) => {
    e.preventDefault();
    if (editForm.quantity < 1) { flash('Quantity must be >=1', 'error'); return; }
    try {
      setActionLoading(true);
      await updateVehicleItem(editForm.id, editForm.quantity);
      flash('Quantity updated');
      closeEditModal();
      await loadVehicleItemsData();
    } catch (err) {
      flash(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Remove assignment
  const removeAssignment = async (assignment) => {
    if (!window.confirm('Remove this assigned item from vehicle? Stock will be returned.')) return;
    try {
      setActionLoading(true);
      await removeVehicleItem(assignment._id);
      flash('Assignment removed');
      await loadVehicleItemsData();
    } catch (err) {
      flash(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    loadVehicleItemsData();
  };

  const clearFilters = () => {
    setSelectedVehicle('');
    setSelectedItem('');
    setCurrentPage(1);
    loadVehicleItemsData();
  };

  const getExpiryStatus = (expireDate) => {
    if (!expireDate) return 'No Expiry';
    const expiry = new Date(expireDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    if (expiry < now) return 'Expired';
    if (expiry <= thirtyDaysFromNow) return 'Expiring Soon';
    return 'OK';
  };

  const getExpiryColor = (expireDate) => {
    const status = getExpiryStatus(expireDate);
    switch (status) {
      case 'Expired': return 'bg-fire-100 text-fire-dark';
      case 'Expiring Soon': return 'bg-amber-100 text-amber-dark';
      case 'OK': return 'bg-success-100 text-success-dark';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && vehicleItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-info mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicle items...</p>
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
        <div className="max-w-7xl mx-auto px-4 pt-0 pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {vehicleId ? 'Vehicle Items - Specific Vehicle' : 'Vehicle Items Management'}
            </h1>
            <p className="text-gray-600">
              {vehicleId 
                ? `Viewing items for selected vehicle${selectedVehicle ? ` (${availableVehicles.find(v => v._id === selectedVehicle)?.vehicle_name || 'Loading...'})` : ''}`
                : 'Manage items assigned to vehicles'
              }
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={openAssignModal}
              className="bg-white text-navy border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-60"
              disabled={actionLoading}
            >Assign Item</button>
            {vehicleId && (
              <Link
                to={`/inventory/vehicles/${vehicleId}`}
                className="bg-white text-navy border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Back to Vehicle
              </Link>
            )}
            <Link
              to="/inventory"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Back to Inventory
            </Link>
            <Link
              to="/dashboard"
              className="bg-white text-navy border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
                    <select
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
                    >
                      <option value="">All Vehicles</option>
                      {availableVehicles.map(vehicle => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.vehicle_name} ({vehicle.vehicle_type})
                        </option>
                      ))}
                    </select>
                  </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item</label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
            >
              <option value="">All Items</option>
              {availableItems.map(item => (
                <option key={item._id} value={item._id}>
                  {item.item_name} ({item.category})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleFilterChange}
              className="bg-white text-navy border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors duration-200 mr-2"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`mb-4 p-3 rounded-md border text-sm ${feedback.type === 'error' ? 'bg-fire-50 border-fire-200 text-fire-dark' : 'bg-success-50 border-success-200 text-success-dark'}`}>{feedback.msg}</div>
      )}

      {/* Vehicle Items Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Vehicle Items</h2>
        </div>

        {error && (
          <div className="px-6 py-3 bg-fire-50 border-b border-fire-200">
            <p className="text-fire-dark">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
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
                  Assigned Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicleItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No vehicle items found
                  </td>
                </tr>
              ) : (
                vehicleItems.map((vehicleItem) => (
                  <tr key={vehicleItem._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {vehicleItem.vehicle_ID?.vehicle_name || 'Unknown Vehicle'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {vehicleItem.vehicle_ID?.vehicle_type || 'Unknown Type'}
                      </div>
                    </td>
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
                      <div className="text-sm text-gray-900">
                        {vehicleItem.quantity}
                      </div>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(vehicleItem.assignedDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(vehicleItem)}
                          className="px-2 py-1 text-xs rounded bg-white text-navy border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                          disabled={actionLoading}
                        >Edit</button>
                        <button
                          onClick={() => removeAssignment(vehicleItem)}
                          className="px-2 py-1 text-xs rounded bg-fire text-white hover:bg-fire-dark disabled:opacity-50"
                          disabled={actionLoading}
                        >Remove</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-5 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Assign Item to Vehicle</h3>
              <button onClick={closeAssignModal} className="text-gray-500 hover:text-gray-700">✖</button>
            </div>
            <form onSubmit={submitAssign} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                <select
                  name="vehicle_ID"
                  value={assignForm.vehicle_ID}
                  onChange={handleAssignChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-info"
                  required
                >
                  <option value="">Select a vehicle</option>
                  {availableVehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.vehicle_name} ({v.vehicle_type})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                <select
                  name="item_ID"
                  value={assignForm.item_ID}
                  onChange={handleAssignChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-info"
                  required
                >
                  <option value="">Select an item</option>
                  {availableItems.map(i => (
                    <option key={i._id} value={i._id}>{i.item_name} (Stock: {i.quantity})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  min={1}
                  value={assignForm.quantity}
                  onChange={handleAssignChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-info"
                  required
                />
                {assignForm.item_ID && (
                  <p className="text-xs text-gray-500 mt-1">
                    Max available: {availableItems.find(i => i._id === assignForm.item_ID)?.quantity ?? '—'}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeAssignModal} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 rounded bg-white text-navy border border-gray-300 hover:bg-gray-50 text-sm disabled:opacity-60">
                  {actionLoading ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="px-5 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Edit Assigned Quantity</h3>
              <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700">✖</button>
            </div>
            <form onSubmit={submitEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={editForm.quantity}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-info"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeEditModal} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 rounded bg-white text-navy border border-gray-300 hover:bg-gray-50 text-sm disabled:opacity-60">
                  {actionLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default VehicleItemsPage;
