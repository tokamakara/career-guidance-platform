import axios from 'axios';

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

export const adminService = {
  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/dashboard');
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
  async getReports(reportType, dateRange = {}) {
    try {
      const params = { type: reportType, ...dateRange };
      const response = await api.get('/admin/reports', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reports');
    }
  },

  // Get Applications Overview - Institute Applications
  async getInstituteApplications(filters = {}) {
    try {
      const response = await api.get('/admin/applications/institute', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch institute applications');
    }
  },

  // Get Applications Overview - Company Applications
  async getCompanyApplications(filters = {}) {
    try {
      const response = await api.get('/admin/applications/company', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch company applications');
    }
  },

  // Get Applications Overview - Combined Applications
  async getCombinedApplications(filters = {}) {
    try {
      const response = await api.get('/admin/applications/combined', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch combined applications');
    }
  },

  // Get Analytics & Reports - Institute Analytics
  async getInstituteAnalytics(filters = {}) {
    try {
      const response = await api.get('/admin/analytics/institute', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch institute analytics');
    }
  },

  // Get Analytics & Reports - Company Analytics
  async getCompanyAnalytics(filters = {}) {
    try {
      const response = await api.get('/admin/analytics/company', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch company analytics');
    }
  },

  // Get Analytics & Reports - Combined Analytics
  async getCombinedAnalytics(filters = {}) {
    try {
      const response = await api.get('/admin/analytics/combined', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch combined analytics');
    }
  },

  // Export Company Admitted Candidates (PDF)
  async exportCompanyAdmittedCandidates(companyId, jobId = null) {
    try {
      const url = jobId 
        ? `/admin/export/company/${companyId}/admitted?jobId=${jobId}`
        : `/admin/export/company/${companyId}/admitted`;
      const response = await api.get(url, { responseType: 'blob' });
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `admitted-candidates-${companyId}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
      
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export admitted candidates');
    }
  },

  // Export Institute Admitted Students (PDF)
  async exportInstituteAdmittedStudents(institutionId, courseId = null) {
    try {
      const url = courseId 
        ? `/admin/export/institute/${institutionId}/admitted?courseId=${courseId}`
        : `/admin/export/institute/${institutionId}/admitted`;
      const response = await api.get(url, { responseType: 'blob' });
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `admitted-students-${institutionId}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
      
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export admitted students');
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