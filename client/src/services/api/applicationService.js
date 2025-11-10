import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://career-guidance-api-eajo.onrender.com/api';

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
    try {
      const params = status ? { status } : {};
      const response = await api.get('/applications/student/my-applications', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch applications');
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