import axios from 'axios';
import { API_BASE_URL as API_ORIGIN } from "../config/api";

const API_BASE_URL = `${API_ORIGIN}/api/inventory-vehicles`;

// Create a new vehicle
export const createVehicle = async (vehicleData) => {
  try {
    const response = await axios.post(API_BASE_URL, vehicleData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create vehicle');
  }
};

// Get all vehicles with pagination and filters
export const getVehicles = async (page = 1, limit = 10, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    const response = await axios.get(`${API_BASE_URL}?${params}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get vehicles');
  }
};

// Get vehicle by ID
export const getVehicleById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get vehicle');
  }
};

// Update vehicle
export const updateVehicle = async (id, vehicleData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, vehicleData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update vehicle');
  }
};

// Delete vehicle
export const deleteVehicle = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete vehicle');
  }
};

// Get vehicle statistics
export const getVehicleStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get vehicle statistics');
  }
};

// Helper functions
export const getAvailableVehicles = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}?status=Available&limit=1000`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get available vehicles');
  }
};

export const getVehiclesByType = async (vehicle_type) => {
  try {
    const response = await axios.get(`${API_BASE_URL}?vehicle_type=${vehicle_type}&limit=1000`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get vehicles by type');
  }
};

export const searchVehicles = async (searchTerm) => {
  try {
    const response = await axios.get(`${API_BASE_URL}?search=${searchTerm}&limit=1000`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search vehicles');
  }
};
