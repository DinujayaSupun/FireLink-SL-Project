import axios from 'axios';
import { API_BASE_URL as API_ORIGIN } from "../config/api";

const API_BASE_URL = `${API_ORIGIN}/api`;

// Get all logs with filtering and pagination
export const getLogs = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/inventory-logs`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get logs' };
  }
};

// Get specific log by ID
export const getLogById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/inventory-logs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get log' };
  }
};

// Create new log entry
export const createLog = async (logData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/inventory-logs`, logData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create log' };
  }
};

// Update log entry
export const updateLog = async (id, updateData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/inventory-logs/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update log' };
  }
};

// Delete log entry
export const deleteLog = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/inventory-logs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete log' };
  }
};

// Get log statistics
export const getLogStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/inventory-logs/stats/summary`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get log statistics' };
  }
};

// Helper functions for common queries
export const getLogsByAction = async (action) => {
  return getLogs({ action });
};

export const getLogsByDate = async (startDate, endDate) => {
  return getLogs({ startDate, endDate });
};

export const searchLogs = async (searchTerm) => {
  return getLogs({ search: searchTerm });
};
