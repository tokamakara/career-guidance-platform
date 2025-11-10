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

export const companyService = {
  // Get company profile
  async getCompanyProfile() {
    try {
      const response = await api.get('/company/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch company profile');
    }
  },

  // Update company profile
  async updateCompanyProfile(profileData) {
    try {
      const response = await api.put('/company/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update company profile');
    }
  },

  // Create job posting
  async createJobPosting(jobData) {
    try {
      const response = await api.post('/company/jobs', jobData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create job posting');
    }
  },

  // Get company's job postings
  async getCompanyJobPostings() {
    try {
      const response = await api.get('/company/jobs');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch job postings');
    }
  },

  // Update job posting
  async updateJobPosting(jobId, jobData) {
    try {
      const response = await api.put(`/company/jobs/${jobId}`, jobData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update job posting');
    }
  },

  // Delete job posting
  async deleteJobPosting(jobId) {
    try {
      const response = await api.delete(`/company/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete job posting');
    }
  },

  // Get qualified candidates for a job
  async getQualifiedCandidates(jobId) {
    try {
      const response = await api.get(`/company/jobs/${jobId}/qualified-candidates`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch qualified candidates');
    }
  },

  // Get job applications for a specific job
  async getJobApplications(jobId) {
    try {
      const response = await api.get(`/company/jobs/${jobId}/applications`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch job applications');
    }
  },

  // Update application status
  async updateApplicationStatus(applicationId, status) {
    try {
      const response = await api.patch(`/company/applications/${applicationId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update application status');
    }
  },

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const response = await api.get('/company/dashboard/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  }
};

export default companyService;