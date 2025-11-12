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

  // Get company jobs (alias for getCompanyJobPostings)
  async getCompanyJobs() {
    try {
      const response = await api.get('/company/jobs');
      const result = response.data;
      return result.data || result || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch company jobs');
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

  // Get qualified candidates for a job (ONLY qualified candidates)
  async getQualifiedCandidates(jobId) {
    try {
      const response = await api.get(`/jobs/${jobId}/qualified-candidates`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch qualified candidates');
    }
  },

  // Get all applicants for a job (including rejected)
  async getJobApplicants(jobId) {
    try {
      const response = await api.get(`/jobs/${jobId}/applicants`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch job applicants');
    }
  },

  // Get job applications for a specific job (legacy - use getJobApplicants)
  async getJobApplications(jobId) {
    try {
      const response = await api.get(`/jobs/${jobId}/applicants`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch job applications');
    }
  },

  // Update application status (individual)
  async updateApplicationStatus(applicationId, status, notes) {
    try {
      const response = await api.patch(`/jobs/applications/${applicationId}/status`, { status, notes });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update application status');
    }
  },

  // Bulk update application status
  async bulkUpdateApplicationStatus(jobId, applicationIds, status, notes) {
    try {
      const response = await api.patch(`/jobs/${jobId}/applications/bulk-status`, {
        applicationIds,
        status,
        notes
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to bulk update application status');
    }
  },

  // Export admitted candidates as PDF
  async exportAdmittedCandidates(jobId) {
    try {
      const url = jobId 
        ? `/company/export/admitted/${jobId}`
        : '/company/export/admitted';
      const response = await api.get(url, { responseType: 'blob' });
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `admitted-candidates-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
      
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export admitted candidates');
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