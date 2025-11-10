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

export const studentService = {
  // Get student profile
  async getStudentProfile() {
    try {
      const response = await api.get('/student/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch student profile');
    }
  },

  // Update student profile
  async updateStudentProfile(profileData) {
    try {
      const response = await api.put('/student/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update student profile');
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
      throw new Error(error.response?.data?.message || 'Failed to fetch job applications');
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