import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getLogs, deleteLog, getLogStats, updateLog } from '../../api/inventoryLogApi';
import Sidebar from '../UserManagement/Sidebar';

const InventoryLogs = () => {
  const navigate = useNavigate();

  // Get user data for sidebar
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/staff-login");
  };

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  
  // Edit modal state
  const [editingLog, setEditingLog] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [currentPage, selectedAction, selectedCategory, startDate, endDate]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [logsResponse, statsResponse] = await Promise.all([
        getLogs({ page: 1, limit: 20 }),
        getLogStats()
      ]);
      
      if (logsResponse.success) {
        setLogs(logsResponse.data);
        setTotalPages(logsResponse.pagination.totalPages);
        setTotalLogs(logsResponse.pagination.totalLogs);
      }
      
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (err) {
      setError('Failed to load logs data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        action: selectedAction || undefined,
        category: selectedCategory || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };

      const response = await getLogs(params);
      
      if (response.success) {
        setLogs(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalLogs(response.pagination.totalLogs);
      }
    } catch (err) {
      setError('Failed to load logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadLogs();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this log entry?')) {
      try {
        await deleteLog(id);
        loadLogs();
      } catch (err) {
        setError('Failed to delete log');
        console.error(err);
      }
    }
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setEditFormData({
      description: log.description,
      notes: log.notes || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateLog(editingLog._id, editFormData);
      setEditingLog(null);
      loadLogs();
    } catch (err) {
      setError('Failed to update log');
      console.error(err);
    }
  };

  const getActionColor = (action) => {
    const colors = {
      CREATE: 'bg-gradient-to-r from-success-100 to-success-200 text-success-dark border border-success-300',
      UPDATE: 'bg-gradient-to-r from-info-100 to-info-200 text-info-dark border border-info-300',
      DELETE: 'bg-gradient-to-r from-fire-100 to-fire-200 text-fire-dark border border-fire-300',
      STOCK_CHANGE: 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-dark border border-amber-300',
      REORDER_CREATED: 'bg-gradient-to-r from-info-100 to-info-200 text-info-dark border border-info-300',
      REORDER_STATUS_CHANGE: 'bg-gradient-to-r from-info-100 to-info-200 text-info-dark border border-info-300'
    };
    return colors[action] || 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fire mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory logs...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Inventory Logs</h1>
            <p className="text-gray-600">Complete audit trail of all inventory activities</p>
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

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg bg-info p-4 text-white shadow-md">
            <div className="text-center">
              <p className="text-info-100 text-xs font-medium">Total Logs</p>
              <p className="text-xl font-bold">{stats.totalLogs}</p>
            </div>
          </div>

          <div className="rounded-lg bg-success p-4 text-white shadow-md">
            <div className="text-center">
              <p className="text-success-100 text-xs font-medium">Today's Activities</p>
              <p className="text-xl font-bold">{stats.todayLogs}</p>
            </div>
          </div>

          <div className="rounded-lg bg-info p-4 text-white shadow-md">
            <div className="text-center">
              <p className="text-info-100 text-xs font-medium">Action Types</p>
              <p className="text-xl font-bold">{stats.actionBreakdown?.length || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search & Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="STOCK_CHANGE">Stock Change</option>
              <option value="REORDER_CREATED">Reorder Created</option>
              <option value="REORDER_STATUS_CHANGE">Reorder Status Change</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-info"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-info hover:bg-info-dark text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-fire-50 border border-fire-200 rounded-md p-4 mb-6">
          <p className="text-fire">{error}</p>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Activity Logs ({totalLogs} total)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Performed By
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {logs.map((log, index) => (
                <tr key={log._id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-2 text-xs font-bold rounded-full ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{log.itemName}</div>
                    <div className="text-sm text-gray-500">{log.itemCategory}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm text-gray-900">{log.description}</div>
                    {log.quantityChange !== 0 && (
                      <div className="text-sm text-gray-500 mt-1">
                        Quantity change: <span className={`font-semibold ${log.quantityChange > 0 ? 'text-success' : 'text-fire'}`}>
                          {log.quantityChange > 0 ? '+' : ''}{log.quantityChange}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                    {log.performedByName}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(log)}
                        className="text-info hover:text-info-dark font-semibold transition-colors duration-200 flex items-center"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(log._id)}
                        className="text-fire hover:text-fire-dark font-semibold transition-colors duration-200 flex items-center"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Log Entry</h3>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-fire hover:bg-fire-dark text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingLog(null)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default InventoryLogs;
