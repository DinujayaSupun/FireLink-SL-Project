
import axios from 'axios';
import { API_BASE_URL } from "../config/api";
// Use global axios instance (interceptors are set in auth context)
// Set baseURL for axios globally if needed
if (!axios.defaults.baseURL) {
  axios.defaults.baseURL = API_BASE_URL;
}

// Inventory API functions
export const inventoryApi = {
  // Get all inventory items with search/filter/pagination
  getItems: async (params = {}) => {
    try {
      //creates HTTP get request to backend and passes query parameters //params is an object containing search, filter, pagination info
      //also waits for the response from backend
      const response = await axios.get('/api/inventory', { params });
      return response.data;// Returns the success object with data and pagination to the caller(e.g., InventoryList.jsx)

    } catch (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }
  },

  // Get single inventory item by ID
  // update 5: This function is called when editing an existing item to fetch its current data 
  getItemById: async (id) => { 
    try {
      //update 9: API receives the response from backend which includes the existing item data
      const response = await axios.get(`/api/inventory/${id}`);// update 4: Sends GET request to backend to fetch item by ID --> look inventoryRoutes.js
      return response.data;// update 10: Returns the existing item data to the form component --> look InventoryForm.jsx
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      throw error;
    }
  },

  //5.This function is called when form submits
  // Create new inventory item
  
  addItem: async (itemData) => {
    try {
      //6. Sends POST request to backend -->look inventoryRoutes.js
      const response = await axios.post('/api/inventory', itemData);//20. THIS is where the backend response is first caught from inventoryController.js
      //21.then this line extracts just the data portion:
      return response.data;//22. Returns the created item data to the form component //Returns only the backend JSON response --> look InventoryForm.jsx

    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;//8. shows error in form if any 
    }
  },

  // Update existing inventory item
  updateItem: async (id, itemData) => {// update 13 : This function is called when editing an existing item and submitting the form
    try {
  const response = await axios.put(`/api/inventory/${id}`, itemData);//update 14 : Sends PUT request to backend to update item by ID
      return response.data;// update 14 A : Returns the updated item data to the form component
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  },

  // Delete inventory item
  deleteItem: async (id) => {
    try {
  const response = await axios.delete(`/api/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  },

  // Generate inventory reports
  generateReport: async (reportType = 'summary') => {
    try {
  const response = await axios.get('/api/inventory/reports', {
        params: { reportType }
      });
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  // Get available categories (for dropdowns)
  getCategories: async () => {
    try {
  const response = await axios.get('/api/inventory', {
        params: { limit: 1000 } // Get all items to extract categories
      });
      
      // Extract unique categories from response
      const categories = [...new Set(response.data.data.map(item => item.category))];
      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get available locations (for dropdowns)
  getLocations: async () => {
    try {
  const response = await axios.get('/api/inventory', {
        params: { limit: 1000 } // Get all items to extract locations
      });
      
      // Extract unique locations from response
      const locations = [...new Set(response.data.data.map(item => item.location).filter(Boolean))];
      return locations.sort();
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },

  // Check if item ID exists
  checkItemIdExists: async (itemId) => {
    try {
  const response = await axios.get(`/api/inventory/check-id/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking item ID:', error);
      return { success: false, exists: false };
    }
  },

  // Get low stock items
  getLowStockItems: async () => {
    try {
      const response = await api.get('/api/inventory', {
        params: { 
          limit: 1000,
          // Filter for items where quantity <= threshold
          // This will be handled by the backend
        }
      });
      
      // Filter low stock items on frontend for now
      const lowStockItems = response.data.data.filter(item => 
        item.quantity <= item.threshold
      );
      
      return lowStockItems;
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  },

  // Get expired items
  getExpiredItems: async () => {
    try {
      const response = await api.get('/api/inventory', {
        params: { limit: 1000 }
      });
      
      // Filter expired items on frontend
      const expiredItems = response.data.data.filter(item => {
        if (!item.expire_date) return false;
        return new Date(item.expire_date) < new Date();
      });
      
      return expiredItems;
    } catch (error) {
      console.error('Error fetching expired items:', error);
      throw error;
    }
  },

  // Get items by condition
  getItemsByCondition: async (condition) => {
    try {
      const response = await api.get('/api/inventory', {
        params: { condition, limit: 1000 }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching items by condition:', error);
      throw error;
    }
  },

  // Get items by status
  getItemsByStatus: async (status) => {
    try {
      const response = await api.get('/api/inventory', {
        params: { status, limit: 1000 }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching items by status:', error);
      throw error;
    }
  },

  // Add quantity to inventory item (Quick Adjust)
  addItemQuantity: async (id, amount, reason = null) => {
    try {
      const response = await axios.post(`/api/inventory/${id}/add-quantity`, {
        amount,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error adding item quantity:', error);
      throw error;
    }
  },

  // Remove quantity from inventory item (Quick Adjust)
  removeItemQuantity: async (id, amount, reason = null) => {
    try {
      const response = await axios.post(`/api/inventory/${id}/remove-quantity`, {
        amount,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error removing item quantity:', error);
      throw error;
    }
  }
};

// Export individual functions for convenience
export const {
  getItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
  generateReport,
  getCategories,
  getLocations,
  checkItemIdExists,
  getLowStockItems,
  getExpiredItems,
  getItemsByCondition,
  getItemsByStatus,
  addItemQuantity,
  removeItemQuantity
} = inventoryApi;

export default inventoryApi;
