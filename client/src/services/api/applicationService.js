import axios from 'axios';
import { dataCache } from '../../utils/dataCache';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

export const applicationService = {
  // Apply to a course
  async applyToCourse(applicationData) {
    try {
      const response = await api.post('/applications/student/apply', applicationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit application');
    }
  },

  // Get student's applications
  async getStudentApplications(status = null) {
    // Only cache first page without status filter
    const cacheKey = !status ? 'applications:student:all' : null;
    if (cacheKey) {
      const cached = dataCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const params = status ? { status } : {};
      const response = await api.get('/applications/student/my-applications', { params });
      const data = response.data;
      
      // Cache for 2 minutes
      if (cacheKey) {
        dataCache.set(cacheKey, data, 2 * 60 * 1000);
      }
      
      return data;
    } catch (error) {
      // Handle server errors gracefully - return empty data instead of throwing
      const status = error.response?.status;
      
      // For 500 errors or network errors, return empty data (user might have no applications)
      if (status === 500 || status >= 500 || !error.response) {
        console.warn('Server error or network issue, returning empty applications:', error.message);
        return { success: true, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
      }
      
      // For auth errors, still throw (user needs to know they're not authenticated)
      if (status === 401 || status === 403) {
        throw new Error(error.response?.data?.message || 'Authentication required');
      }
      
      // For other errors, return empty data gracefully
      console.warn('Error fetching applications, returning empty data:', error.message);
      return { success: true, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  },

  // Accept admission offer
  async acceptAdmission(applicationId) {
    try {
      const response = await api.post(`/applications/student/accept-admission/${applicationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to accept admission');
    }
  },

  // Get institute applications (for institute users)
  async getInstituteApplications(filters = {}) {
    try {
      const response = await api.get('/applications/institute/applications', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch applications');
    }
  },

  // Update application status (for institute users)
  async updateApplicationStatus(applicationId, statusData) {
    try {
      const response = await api.patch(`/applications/institute/applications/${applicationId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update application status');
    }
  }
};

export default applicationService;