import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const studentService = {
  // Get student profile
  async getStudentProfile() {
    try {
      const response = await api.get('/student/profile');
      return response.data;
    } catch (error) {
      // Provide more detailed error message
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message || 'Failed to fetch student profile';
      
      if (status === 404) {
        throw new Error('Profile endpoint not found. Please check if the server is running and the API is accessible.');
      } else if (status === 401 || status === 403) {
        throw new Error('Authentication required. Please log in again.');
      } else if (status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(message);
    }
  },

  // Update student profile
  async updateStudentProfile(profileData) {
    try {
      const response = await api.put('/student/profile', profileData);
      return response.data;
    } catch (error) {
      // Provide more detailed error message
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message || 'Failed to update student profile';
      
      if (status === 404) {
        throw new Error('Profile update endpoint not found. Please check if the server is running and the API is accessible.');
      } else if (status === 401 || status === 403) {
        throw new Error('Authentication required. Please log in again.');
      } else if (status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(message);
    }
  },

  // Upload documents (transcripts, certificates)
  async uploadDocuments(documents) {
    try {
      const formData = new FormData();
      Object.keys(documents).forEach(key => {
        formData.append(key, documents[key]);
      });

      const response = await api.post('/student/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload documents');
    }
  },

  // Get student documents
  async getStudentDocuments() {
    try {
      const response = await api.get('/student/documents');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch documents');
    }
  },

  // Get admission results
  async getAdmissionResults() {
    try {
      const response = await api.get('/student/admission-results');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch admission results');
    }
  },

  // Accept admission offer
  async acceptAdmissionOffer(admissionId) {
    try {
      const response = await api.post(`/student/admission/${admissionId}/accept`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to accept admission offer');
    }
  },

  // Get job applications
  async getJobApplications() {
    try {
      const response = await api.get('/student/job-applications');
      return response.data;
    } catch (error) {
      // Handle server errors gracefully - return empty data instead of throwing
      const status = error.response?.status;
      
      // For 500 errors or network errors, return empty data (no applications available)
      if (status === 500 || status >= 500 || !error.response) {
        console.warn('Server error loading job applications, returning empty data:', error.message);
        return { success: true, data: [] };
      }
      
      // For auth errors, still throw
      if (status === 401 || status === 403) {
        throw new Error(error.response?.data?.message || 'Authentication required');
      }
      
      // For other errors, return empty data gracefully
      console.warn('Error fetching job applications, returning empty data:', error.message);
      return { success: true, data: [] };
    }
  },

  // Get job recommendations
  async getJobRecommendations() {
    try {
      const response = await api.get('/student/job-recommendations');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch job recommendations');
    }
  },

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const response = await api.get('/student/dashboard/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  }
};

export default studentService;