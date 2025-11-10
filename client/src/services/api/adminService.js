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

export const adminService = {
  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  },

  // Get all institutions with pagination and filters
  async getInstitutions(page = 1, limit = 10, filters = {}) {
    try {
      const params = { page, limit, ...filters };
      const response = await api.get('/admin/institutions', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch institutions');
    }
  },

  // Get institution by ID
  async getInstitutionById(institutionId) {
    try {
      const response = await api.get(`/admin/institutions/${institutionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch institution');
    }
  },

  // Update institution status (approve/suspend)
  async updateInstitutionStatus(institutionId, status) {
    try {
      const response = await api.patch(`/admin/institutions/${institutionId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update institution status');
    }
  },

  // Get all companies with pagination and filters
  async getCompanies(page = 1, limit = 10, filters = {}) {
    try {
      const params = { page, limit, ...filters };
      const response = await api.get('/admin/companies', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch companies');
    }
  },

  // Get company by ID
  async getCompanyById(companyId) {
    try {
      const response = await api.get(`/admin/companies/${companyId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch company');
    }
  },

  // Update company status (approve/suspend)
  async updateCompanyStatus(companyId, status) {
    try {
      const response = await api.patch(`/admin/companies/${companyId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update company status');
    }
  },

  // Get all users with pagination and filters
  async getUsers(page = 1, limit = 10, filters = {}) {
    try {
      const params = { page, limit, ...filters };
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  // Update user status (active/suspended)
  async updateUserStatus(userId, status) {
    try {
      const response = await api.patch(`/admin/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user status');
    }
  },

  // Get system reports
  async getSystemReports(reportType, dateRange = {}) {
    try {
      const params = { reportType, ...dateRange };
      const response = await api.get('/admin/reports', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reports');
    }
  },

  // Get admission statistics
  async getAdmissionStats() {
    try {
      const response = await api.get('/admin/admissions/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch admission statistics');
    }
  },

  // Get pending approvals count
  async getPendingApprovals() {
    try {
      const response = await api.get('/admin/pending-approvals');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch pending approvals');
    }
  },

  // Export data
  async exportData(dataType, format = 'csv') {
    try {
      const response = await api.get(`/admin/export/${dataType}`, { 
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export data');
    }
  }
};

export default adminService;