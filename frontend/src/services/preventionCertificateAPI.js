import axios from 'axios';
import { API_BASE_URL as API_ORIGIN } from "../config/api";

const API_BASE_URL = `${API_ORIGIN}`;

// API service for Prevention Certificate management
class PreventionCertificateAPI {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication if needed
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Get all applications
  async getAllApplications() {
    try {
      const response = await this.api.get('/api/prevention/certificates');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching applications:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: [],
      };
    }
  }

  // Approve application
  async approveApplication(id, assignedOfficer = null) {
    try {
      const response = await this.api.patch(`/api/prevention/certificates/${id}/status`, {
        status: 'Approved',
        assignedOfficer,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error approving application:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // Reject application
  async rejectApplication(id, rejectionReason) {
    try {
      const response = await this.api.patch(`/api/prevention/certificates/${id}/status`, {
        status: 'Rejected',
        rejectionReason,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error rejecting application:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // Delete application - ACTUALLY REMOVES FROM DATABASE
  async deleteApplication(id) {
    try {
      const response = await this.api.delete(`/api/prevention/certificates/${id}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error deleting application:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // Assign payment
  async assignPayment(id, payment) {
    try {
      const response = await this.api.patch(`/api/prevention/certificates/${id}/payment`, {
        payment,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error assigning payment:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // Add inspection notes
  async addInspectionNotes(id, inspectionNotes) {
    try {
      const response = await this.api.patch(`/api/prevention/certificates/${id}/inspection-notes`, {
        inspectionNotes,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error adding inspection notes:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // Mark as inspected
  async markAsInspected(id, inspectionNotes, inspectedBy = null) {
    try {
      const response = await this.api.patch(`/api/prevention/certificates/${id}/inspect`, {
        inspectionNotes,
        inspectedBy,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error marking as inspected:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // Reactivate rejected application (using prevention-officer route)
  async reactivateApplication(id) {
    try {
      const response = await this.api.put(`/api/prevention-officer/applications/${id}/reactivate`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error reactivating application:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // Submit new application (for civilian use)
  async submitApplication(formData) {
    try {
      const response = await this.api.post('/api/prevention/certificates/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error submitting application:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // Update application status to "Payment Assigned"
  async updateToPaymentAssigned(id, payment) {
    try {
      // First assign payment
      const paymentResult = await this.assignPayment(id, payment);
      if (!paymentResult.success) {
        return paymentResult;
      }

      // Then update status
      const response = await this.api.patch(`/api/prevention/certificates/${id}/status`, {
        status: 'Payment Assigned',
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error updating to payment assigned:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // Fetch all inspected applications
  async getInspectedDocuments() {
    try {
      const response = await this.api.get('/api/prevention/certificates/inspected');
      return response.data; // Return the backend response directly
    } catch (error) {
      console.error('Error fetching inspected documents:', error);
      
      // Return error when backend is not available
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        data: [],
      };
    }
  }
}

// Create singleton instance
const preventionCertificateAPI = new PreventionCertificateAPI();

// Named exports for individual functions
export const getInspectedDocuments = () => preventionCertificateAPI.getInspectedDocuments();
export const deleteInspectedDocument = (id) => preventionCertificateAPI.deleteApplication(id);

export default preventionCertificateAPI;