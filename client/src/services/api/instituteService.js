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

export const institutionService = {
  // Get all approved institutions
  async getInstitutions() {
    try {
      const response = await api.get('/institute/institutions');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch institutions');
    }
  },

  // Get institution details with faculties and courses
  async getInstitutionDetails(institutionId) {
    try {
      const response = await api.get(`/institute/institutions/${institutionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch institution details');
    }
  },

  // Get courses for a specific faculty
  async getFacultyCourses(institutionId, facultyId) {
    try {
      const response = await api.get(`/institute/institutions/${institutionId}/faculties/${facultyId}/courses`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch courses');
    }
  },

  // Check course eligibility
  async checkCourseEligibility(courseId, studentSubjects) {
    try {
      const response = await api.post('/applications/check-eligibility', {
        courseId,
        studentSubjects
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check eligibility');
    }
  }
};

export default institutionService;