import axios from 'axios';
import { API_BASE_URL as API_ORIGIN } from "../config/api";

const API_BASE_URL = `${API_ORIGIN}/api`;

// Create a new reorder
export const createReorder = async (reorderData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/inventory-reorders`, reorderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create reorder' };
  }
};

// Get all reorders with filtering and pagination
export const getReorders = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/inventory-reorders`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get reorders' };
  }
};

// Get specific reorder by ID
export const getReorderById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/inventory-reorders/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get reorder' };
  }
};

// Update reorder
export const updateReorder = async (id, updateData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/inventory-reorders/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update reorder' };
  }
};

// Delete reorder
export const deleteReorder = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/inventory-reorders/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete reorder' };
  }
};

// Get reorder statistics
export const getReorderStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/inventory-reorders/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get reorder statistics' };
  }
};

// Approve reorder
export const approveReorder = async (id, approvedBy) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/inventory-reorders/${id}/approve`, { approvedBy });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to approve reorder' };
  }
};

// Mark reorder as delivered
export const markDelivered = async (id, actualQuantity) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/inventory-reorders/${id}/deliver`, { actualQuantity });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to mark reorder as delivered' };
  }
};

// Helper functions for common queries
export const getPendingReorders = async () => {
  return getReorders({ status: 'Pending' });
};

export const getUrgentReorders = async () => {
  return getReorders({ priority: 'Urgent' });
};

export const getReordersBySupplier = async (supplier) => {
  return getReorders({ supplier });
};

export const searchReorders = async (searchTerm) => {
  return getReorders({ search: searchTerm });
};

// Send reorder report to Supply Manager
export const sendReorderToManager = async (id, pdfData, reportData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/inventory-reorders/${id}/send-to-manager`, {
      pdfData,
      reportData
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to send reorder to manager' };
  }
};

// Get all reorders sent to Supply Manager (for Supply Manager to view)
export const getSentReorders = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/inventory-reorders/sent/to-manager`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get sent reorders' };
  }
};

// Get specific sent reorder details with PDF (for Supply Manager to view)
export const getSentReorderDetails = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/inventory-reorders/${id}/sent-details`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get sent reorder details' };
  }
};
