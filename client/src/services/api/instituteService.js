import axios from 'axios';
import { dataCache } from '../../utils/dataCache';

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

export const institutionService = {
  // Get all approved institutions
  async getInstitutions() {
    const cacheKey = 'institutions:approved';
    const cached = dataCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await api.get('/institute/institutions');
      const data = response.data;
      // Cache for 5 minutes
      dataCache.set(cacheKey, data, 5 * 60 * 1000);
      return data;
    } catch (error) {
      // Handle server errors gracefully - return empty data instead of throwing
      const status = error.response?.status;
      
      if (status === 500 || status >= 500 || !error.response) {
        console.warn('Server error loading institutions, returning empty data:', error.message);
        return { success: true, data: [] };
      }
      
      if (status === 401 || status === 403) {
        throw new Error(error.response?.data?.message || 'Authentication required');
      }
      
      console.warn('Error loading institutions, returning empty data:', error.message);
      return { success: true, data: [] };
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
  },

  // Get all institutions with courses (for browsing)
  async getAllInstitutionsWithCourses() {
    const cacheKey = 'institutions:all:with:courses';
    const cached = dataCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await api.get('/institute/institutions/all');
      const data = response.data;
      // Cache for 10 minutes (longer since this is expensive)
      dataCache.set(cacheKey, data, 10 * 60 * 1000);
      return data;
    } catch (error) {
      // Handle server errors gracefully - return empty data instead of throwing
      const status = error.response?.status;
      
      if (status === 500 || status >= 500 || !error.response) {
        console.warn('Server error loading institutions with courses, returning empty data:', error.message);
        return { success: true, data: [] };
      }
      
      if (status === 401 || status === 403) {
        throw new Error(error.response?.data?.message || 'Authentication required');
      }
      
      console.warn('Error loading institutions with courses, returning empty data:', error.message);
      return { success: true, data: [] };
    }
  },

  // Get qualified courses for student (backend filtering)
  async getQualifiedCourses(filters = {}) {
    try {
      const { institutionId, facultyId, onlyQualified = true } = filters;
      const params = new URLSearchParams();
      
      if (institutionId) params.append('institutionId', institutionId);
      if (facultyId) params.append('facultyId', facultyId);
      if (onlyQualified !== undefined) params.append('onlyQualified', onlyQualified);
      
      const response = await api.get(`/institute/courses/qualified?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch qualified courses');
    }
  }
};

export default institutionService;