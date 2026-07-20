import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getVehicleById, deleteVehicle } from '../../api/inventoryVehicleApi';
import Sidebar from '../UserManagement/Sidebar';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Get user data for sidebar
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/staff-login");
  };

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadVehicleData();
  }, [id]);

  const loadVehicleData = async () => {
    try {
      setLoading(true);
      const response = await getVehicleById(id);
      if (response.success) {
        setVehicle(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      setDeleting(true);
      await deleteVehicle(id);
      navigate('/inventory/vehicles');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-success-100 text-success-dark';
      case 'In Use': return 'bg-info-100 text-info-dark';
      case 'Maintenance': return 'bg-amber-100 text-amber-dark';
      case 'Out of Service': return 'bg-fire-100 text-fire-dark';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceColor = (nextMaintenance) => {
    if (!nextMaintenance) return 'bg-gray-100 text-gray-800';
    
    const now = new Date();
    const daysUntilMaintenance = Math.ceil((new Date(nextMaintenance) - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilMaintenance < 0) return 'bg-fire-100 text-fire-dark';
    if (daysUntilMaintenance <= 7) return 'bg-amber-100 text-amber-dark';
    if (daysUntilMaintenance <= 30) return 'bg-info-100 text-info-dark';
    return 'bg-success-100 text-success-dark';
  };

  const getMaintenanceStatus = (nextMaintenance) => {
    if (!nextMaintenance) return 'No Schedule';
    
    const now = new Date();
    const daysUntilMaintenance = Math.ceil((new Date(nextMaintenance) - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilMaintenance < 0) return 'Overdue';
    if (daysUntilMaintenance <= 7) return 'Due Soon';
    if (daysUntilMaintenance <= 30) return 'Upcoming';
    return 'Good';
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

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-fire-50 border border-fire-200 rounded-md p-4">
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
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Vehicle not found</p>
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
            <h1 className="text-3xl font-bold text-gray-900">{vehicle.vehicle_name}</h1>
            <p className="text-gray-600">Vehicle Details</p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/inventory/vehicles"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              ← Back to Vehicles
            </Link>
            <Link
              to={`/inventory/vehicles/edit/${vehicle._id}`}
              className="bg-info hover:bg-info-dark text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Edit Vehicle
            </Link>
          </div>
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Basic Information */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle ID</label>
              <p className="text-sm text-gray-900">{vehicle.vehicle_ID}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name</label>
              <p className="text-sm text-gray-900">{vehicle.vehicle_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <p className="text-sm text-gray-900">{vehicle.vehicle_type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
              <p className="text-sm text-gray-900">{vehicle.license_plate}</p>
            </div>
          </div>
        </div>

        {/* Status and Capacity */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Status and Capacity</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                {vehicle.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <p className="text-sm text-gray-900">{vehicle.capacity}</p>
            </div>
          </div>
        </div>

        {/* Location and Maintenance */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Location and Maintenance</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <p className="text-sm text-gray-900">{vehicle.location}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Maintenance</label>
              <p className="text-sm text-gray-900">
                {vehicle.lastMaintenance ? new Date(vehicle.lastMaintenance).toLocaleDateString() : 'Not specified'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Maintenance</label>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMaintenanceColor(vehicle.nextMaintenance)}`}>
                  {getMaintenanceStatus(vehicle.nextMaintenance)}
                </span>
                <span className="text-sm text-gray-900">
                  {vehicle.nextMaintenance ? new Date(vehicle.nextMaintenance).toLocaleDateString() : 'No Schedule'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {vehicle.notes && (
          <>
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-900">{vehicle.notes}</p>
            </div>
          </>
        )}

        {/* Alerts */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Alerts</h2>
        </div>
        <div className="px-6 py-4">
          {vehicle.status === 'Maintenance' && (
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-dark">
                    This vehicle is currently under maintenance
                  </p>
                </div>
              </div>
            </div>
          )}

          {vehicle.status === 'Out of Service' && (
            <div className="mb-3 p-3 bg-fire-50 border border-fire-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-fire-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-fire-dark">
                    This vehicle is out of service
                  </p>
                </div>
              </div>
            </div>
          )}

          {vehicle.nextMaintenance && getMaintenanceStatus(vehicle.nextMaintenance) === 'Overdue' && (
            <div className="mb-3 p-3 bg-fire-50 border border-fire-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-fire-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-fire-dark">
                    Maintenance is overdue! Schedule maintenance immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {vehicle.nextMaintenance && getMaintenanceStatus(vehicle.nextMaintenance) === 'Due Soon' && (
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-dark">
                    Maintenance is due soon. Schedule maintenance within the next 7 days.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!vehicle.nextMaintenance && (
            <div className="p-3 bg-info-50 border border-info-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-info-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-info-dark">
                    No maintenance schedule set. Consider scheduling regular maintenance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/inventory/vehicle-items?vehicleId=${vehicle._id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-info hover:bg-info-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info"
            >
              View Assigned Items
            </Link>
            <Link
              to={`/inventory/vehicles/edit/${vehicle._id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info"
            >
              Edit Vehicle
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-fire hover:bg-fire-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fire disabled:bg-fire-300"
            >
              {deleting ? 'Deleting...' : 'Delete Vehicle'}
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default VehicleDetail;
