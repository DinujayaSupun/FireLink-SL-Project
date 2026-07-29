import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getReorders, deleteReorder, approveReorder, markDelivered } from '../../api/inventoryReorderApi';
import Sidebar from '../UserManagement/Sidebar';

const ReordersList = () => {
  const navigate = useNavigate();

  // Get user data for sidebar
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/staff-login");
  };

  const [reorders, setReorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    supplier: '',
    search: ''
  });

  useEffect(() => {
    loadReorders();
  }, [currentPage, filters]);

  const loadReorders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      };

      const response = await getReorders(params);
      if (response.success) {
        setReorders(response.data);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err) {
      setError('Failed to load reorders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadReorders();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reorder?')) {
      try {
        await deleteReorder(id);
        loadReorders();
      } catch (err) {
        setError('Failed to delete reorder');
        console.error(err);
      }
    }
  };

  const handleApprove = async (id) => {
    const approvedBy = prompt('Enter your name for approval:');
    if (approvedBy) {
      try {
        await approveReorder(id, approvedBy);
        loadReorders();
      } catch (err) {
        setError('Failed to approve reorder');
        console.error(err);
      }
    }
  };

  const handleMarkDelivered = async (id) => {
    const actualQuantity = prompt('Enter actual quantity delivered:');
    if (actualQuantity && !isNaN(actualQuantity)) {
      try {
        await markDelivered(id, parseInt(actualQuantity));
        loadReorders();
      } catch (err) {
        setError('Failed to mark reorder as delivered');
        console.error(err);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'bg-gray-100 text-gray-800';
      case 'Medium': return 'bg-info-100 text-info-dark';
      case 'High': return 'bg-amber-100 text-amber-dark';
      case 'Urgent': return 'bg-fire-100 text-fire-dark';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-dark';
      case 'Approved': return 'bg-success-100 text-success-dark';
      case 'In Transit': return 'bg-info-100 text-info-dark';
      case 'Delivered': return 'bg-success-100 text-success-dark';
      case 'Cancelled': return 'bg-fire-100 text-fire-dark';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && reorders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fire mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reorders...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Reorder Management</h1>
            <p className="text-gray-600">View and manage all inventory reorders</p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/inventory"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              ← Back to Inventory
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search & Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search items, categories..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
            <input
              type="text"
              placeholder="Filter by supplier"
              value={filters.supplier}
              onChange={(e) => handleFilterChange('supplier', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSearch}
            className="bg-fire hover:bg-fire-dark text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
          >
            Search
          </button>
          <button
            onClick={() => {
              setFilters({
                status: '',
                priority: '',
                supplier: '',
                search: ''
              });
              setCurrentPage(1);
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-fire-100 border border-fire-300 text-fire-dark px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Reorders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reorders.map((reorder) => (
                <tr key={reorder._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{reorder.item_name}</div>
                    <div className="text-sm text-gray-500">ID: {reorder.item_ID}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reorder.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reorder.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(reorder.priority)}`}>
                      {reorder.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reorder.status)}`}>
                      {reorder.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(reorder.expectedDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reorder.supplier || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDelete(reorder._id)}
                        className="text-fire hover:text-fire-dark"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-2">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {reorders.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reorders found</h3>
          <p className="text-gray-500 mb-4">When you create reorders for low stock items, they will appear here.</p>
          <Link
            to="/inventory"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-fire hover:bg-fire-dark"
          >
            Go to Inventory
          </Link>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default ReordersList;
