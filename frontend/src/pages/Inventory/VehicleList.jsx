import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getVehicles, deleteVehicle } from '../../api/inventoryVehicleApi';
import Sidebar from '../UserManagement/Sidebar';

const VehicleList = () => {
  const navigate = useNavigate();

  // Get user data for sidebar
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/staff-login");
  };

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    loadVehicles();
  }, [currentPage, itemsPerPage, searchTerm, selectedType, selectedStatus]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedType) filters.vehicle_type = selectedType;
      if (selectedStatus) filters.status = selectedStatus;

      const response = await getVehicles(currentPage, itemsPerPage, filters);
      
      if (response.success) {
        setVehicles(response.data);
        setTotalItems(response.pagination.totalItems);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      await deleteVehicle(id);
      loadVehicles(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    loadVehicles();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedStatus('');
    setCurrentPage(1);
    loadVehicles();
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

  if (loading && vehicles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-info mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicles...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
            <p className="text-gray-600">Manage all fire response vehicles</p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/inventory"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Back to Inventory
            </Link>
            <Link
              to="/inventory/vehicles/add"
              className="bg-info hover:bg-info-dark text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Add New Vehicle
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
            >
              <option value="">All Types</option>
              <option value="Fire Engine">Fire Engine</option>
              <option value="Ladder Truck">Ladder Truck</option>
              <option value="Ambulance">Ambulance</option>
              <option value="Rescue Vehicle">Rescue Vehicle</option>
              <option value="Command Vehicle">Command Vehicle</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Out of Service">Out of Service</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleFilterChange}
              className="bg-info hover:bg-info-dark text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 mr-2"
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

      {/* Vehicles Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Vehicles</h2>
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
                  Vehicle Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maintenance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No vehicles found
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr key={vehicle._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {vehicle.vehicle_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {vehicle.vehicle_ID}
                      </div>
                      <div className="text-sm text-gray-500">
                        Plate: {vehicle.license_plate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {vehicle.vehicle_type}
                      </div>
                      <div className="text-sm text-gray-500">
                        {vehicle.capacity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {vehicle.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMaintenanceColor(vehicle.nextMaintenance)}`}>
                        {getMaintenanceStatus(vehicle.nextMaintenance)}
                      </span>
                      <div className="text-sm text-gray-500 mt-1">
                        {vehicle.nextMaintenance ? new Date(vehicle.nextMaintenance).toLocaleDateString() : 'No Schedule'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/inventory/vehicles/${vehicle._id}`}
                          className="text-info hover:text-info-dark"
                        >
                          View
                        </Link>
                        <Link
                          to={`/inventory/vehicles/edit/${vehicle._id}`}
                          className="text-success hover:text-success-dark"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(vehicle._id)}
                          className="text-fire hover:text-fire-dark"
                        >
                          Delete
                        </button>
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
      </div>
    </div>
  </div>
  );
};

export default VehicleList;
