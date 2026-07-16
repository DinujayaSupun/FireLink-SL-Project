import axios from 'axios';
import { API_BASE_URL as API_ORIGIN } from "../config/api";

const API_BASE_URL = `${API_ORIGIN}/api/inventory-vehicle-items`;

// Assign an item to a vehicle
export const assignItemToVehicle = async (vehicle_ID, item_ID, quantity) => {
  try {
    const response = await axios.post(API_BASE_URL, {
      vehicle_ID,
      item_ID,
      quantity
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to assign item to vehicle');
  }
};

// Get all items assigned to a specific vehicle
export const getVehicleItems = async (vehicle_ID) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicle/${vehicle_ID}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get vehicle items');
  }
};

// Update vehicle item quantity
export const updateVehicleItem = async (id, quantity) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, { quantity });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update vehicle item');
  }
};

// Remove item from vehicle
export const removeVehicleItem = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to remove vehicle item');
  }
};

// Get vehicle item by ID
export const getVehicleItemById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get vehicle item');
  }
};

// Get all vehicle items (admin)
export const getAllVehicleItems = async (page = 1, limit = 10, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    const response = await axios.get(`${API_BASE_URL}?${params}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get all vehicle items');
  }
};

// Helper functions
export const getVehicleItemsByVehicle = async (vehicle_ID) => {
  return getVehicleItems(vehicle_ID);
};

export const getVehicleItemsByItem = async (item_ID) => {
  try {
    const response = await axios.get(`${API_BASE_URL}?item_ID=${item_ID}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get vehicle items by item');
  }
};
