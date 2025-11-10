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
      throw new Error(error.response?.data?.message || 'Failed to fetch jobs');
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
      throw new Error(error.response?.data?.message || 'Failed to get recommendations');
    }
  }
};

export default jobService;