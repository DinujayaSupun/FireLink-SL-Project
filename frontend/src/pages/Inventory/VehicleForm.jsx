import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createVehicle, updateVehicle, getVehicleById } from '../../api/inventoryVehicleApi';
import Sidebar from '../UserManagement/Sidebar';

const VehicleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  // Get user data for sidebar
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/staff-login");
  };

  const [formData, setFormData] = useState({
    vehicle_ID: '',
    vehicle_name: '',
    vehicle_type: '',
    license_plate: '',
    capacity: '',
    status: 'Available',
    location: '',
    nextMaintenance: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      loadVehicleData();
    }
  }, [id]);

  const loadVehicleData = async () => {
    try {
      setLoading(true);
      const response = await getVehicleById(id);
      if (response.success) {
        const vehicle = response.data;
        setFormData({
          vehicle_ID: vehicle.vehicle_ID,
          vehicle_name: vehicle.vehicle_name,
          vehicle_type: vehicle.vehicle_type,
          license_plate: vehicle.license_plate,
          capacity: vehicle.capacity,
          status: vehicle.status,
          location: vehicle.location,
          nextMaintenance: vehicle.nextMaintenance ? new Date(vehicle.nextMaintenance).toISOString().split('T')[0] : '',
          notes: vehicle.notes || ''
        });
      }
    } catch (err) {
      setError(err.message);
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
  };

  const validateForm = () => {
    if (!formData.vehicle_ID || !formData.vehicle_name || !formData.vehicle_type || 
        !formData.license_plate || !formData.capacity || !formData.location) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const submitData = {
        ...formData,
        nextMaintenance: formData.nextMaintenance ? new Date(formData.nextMaintenance) : new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)
      };

      if (isEditing) {
        await updateVehicle(id, submitData);
      } else {
        await createVehicle(submitData);
      }

      navigate('/inventory/vehicles');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/inventory/vehicles');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-info mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicle data...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update vehicle information' : 'Create a new fire response vehicle'}
            </p>
          </div>
          <Link
            to="/inventory/vehicles"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            ← Back to Vehicles
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-6 p-4 bg-fire-50 border border-fire-200 rounded-md">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle ID *
                </label>
                <input
                  type="text"
                  name="vehicle_ID"
                  value={formData.vehicle_ID}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-info"
                  placeholder="e.g., V001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Name *
                </label>
                <input
                  type="text"
                  name="vehicle_name"
                  value={formData.vehicle_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-info"
                  placeholder="e.g., Fire Truck - Engine 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type *
                </label>
                <select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-info"
                >
                  <option value="">Select vehicle type</option>
                  <option value="Fire Engine">Fire Engine</option>
                  <option value="Ladder Truck">Ladder Truck</option>
                  <option value="Ambulance">Ambulance</option>
                  <option value="Rescue Vehicle">Rescue Vehicle</option>
                  <option value="Command Vehicle">Command Vehicle</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Plate *
                </label>
                <input
                  type="text"
                  name="license_plate"
                  value={formData.license_plate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-info"
                  placeholder="e.g., FT-001"
                />
              </div>
            </div>
          </div>

          {/* Capacity and Status */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Capacity and Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="text"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-info"
                  placeholder="e.g., 500 gallons"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-info"
                >
                  <option value="Available">Available</option>
                  <option value="In Use">In Use</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location and Maintenance */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Location and Maintenance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-info"
                  placeholder="e.g., Main Station - Vehicle Bay 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Maintenance Date
                </label>
                <input
                  type="date"
                  name="nextMaintenance"
                  value={formData.nextMaintenance}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-info"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to set 6 months from now
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-info"
              placeholder="Additional notes about the vehicle..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-info hover:bg-info-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info disabled:bg-info-300"
            >
              {submitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Vehicle' : 'Create Vehicle')}
            </button>
          </div>
        </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleForm;
