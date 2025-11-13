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

export const adminService = {
  // Get dashboard statistics
  async getDashboardStats() {
    try {
      console.log('📡 Calling /admin/dashboard API...');
      console.log('🌐 API Base URL:', api.defaults.baseURL);
      const response = await api.get('/admin/dashboard', {
        timeout: 30000 // 30 second timeout (Render can be slow on first request)
      });
      console.log('✅ Dashboard API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Dashboard API error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your connection and try again.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You do not have permission to view the dashboard.');
      } else if (error.response?.status === 404) {
        throw new Error('Dashboard endpoint not found. Please contact support.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch dashboard statistics');
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

  // Get admissions report (for Admissions Monitor)
  async getAdmissionsReport() {
    try {
      // Use getInstituteApplications to get admission data
      const response = await this.getInstituteApplications({});
      
      if (response.success && response.data) {
        // Transform the data to match what AdmissionsMonitor expects
        const admissionsData = response.data.map(app => ({
          institutionName: app.institutionName || 'Unknown',
          courseName: app.courseName || 'Unknown',
          totalApplications: 1, // Each app is one application
          admitted: app.status === 'admitted' || app.status === 'accepted' ? 1 : 0,
          waitlist: app.status === 'waiting' || app.status === 'waitlisted' ? 1 : 0
        }));

        // Group by institution and course
        const grouped = {};
        admissionsData.forEach(item => {
          const key = `${item.institutionName}-${item.courseName}`;
          if (!grouped[key]) {
            grouped[key] = {
              institutionName: item.institutionName,
              courseName: item.courseName,
              totalApplications: 0,
              admitted: 0,
              waitlist: 0
            };
          }
          grouped[key].totalApplications += item.totalApplications;
          grouped[key].admitted += item.admitted;
          grouped[key].waitlist += item.waitlist;
        });

        return Object.values(grouped);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting admissions report:', error);
      // Return empty array on error instead of throwing
      return [];
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