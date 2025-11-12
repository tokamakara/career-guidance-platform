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

export const jobService = {
  // Create a new job posting
  async createJob(jobData) {
    try {
      const response = await api.post('/jobs', jobData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create job');
    }
  },

  // Get company's job postings
  async getCompanyJobs() {
    try {
      const response = await api.get('/jobs/company/my-jobs');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch jobs');
    }
  },

  // Get qualified candidates for a job
  async getQualifiedCandidates(jobId) {
    try {
      const response = await api.get(`/jobs/${jobId}/qualified-candidates`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch candidates');
    }
  },

  // Get public job listings
  async getPublicJobs(filters = {}) {
    try {
      const response = await api.get('/jobs/public', { params: filters });
      return response.data;
    } catch (error) {
      // Handle server errors gracefully - return empty data instead of throwing
      const status = error.response?.status;
      
      // For 500 errors or network errors, return empty data (no jobs available)
      if (status === 500 || status >= 500 || !error.response) {
        console.warn('Server error or network issue, returning empty jobs:', error.message);
        return { success: true, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
      }
      
      // For auth errors, still throw (user needs to know they're not authenticated)
      if (status === 401 || status === 403) {
        throw new Error(error.response?.data?.message || 'Authentication required');
      }
      
      // For other errors, return empty data gracefully
      console.warn('Error fetching jobs, returning empty data:', error.message);
      return { success: true, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  },

  // Get job details
  async getJobDetails(jobId) {
    try {
      const response = await api.get(`/jobs/public/${jobId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch job details');
    }
  },

  // Apply to a job
  async applyToJob(jobId, coverLetter = '') {
    try {
      const response = await api.post('/student/apply/job', {
        jobId,
        coverLetter
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to apply to job');
    }
  },

  // Get job recommendations for student
  async getJobRecommendations() {
    try {
      const response = await api.get('/student/job-recommendations');
      return response.data;
    } catch (error) {
      // Handle server errors gracefully - return empty data instead of throwing
      const status = error.response?.status;
      
      // For 500 errors or network errors, return empty data (no recommendations available)
      if (status === 500 || status >= 500 || !error.response) {
        console.warn('Server error loading job recommendations, returning empty data:', error.message);
        return { success: true, data: [] };
      }
      
      // For auth errors, still throw
      if (status === 401 || status === 403) {
        throw new Error(error.response?.data?.message || 'Authentication required');
      }
      
      // For other errors, return empty data gracefully
      console.warn('Error fetching job recommendations, returning empty data:', error.message);
      return { success: true, data: [] };
    }
  }
};

export default jobService;