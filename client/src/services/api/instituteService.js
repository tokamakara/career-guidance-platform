import axios from 'axios';
import { dataCache } from '../../utils/dataCache';
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
  },

  // Institute user methods
  async getDashboard() {
    try {
      const response = await api.get('/institute/my-applications');
      const applications = response.data.data || [];
      
      // Get courses
      const coursesResponse = await api.get('/institute/faculties');
      const faculties = coursesResponse.data.data || [];
      
      // Calculate stats
      const stats = {
        totalApplications: applications.length,
        totalCourses: faculties.reduce((sum, f) => sum + (f.courseCount || 0), 0),
        pendingApplications: applications.filter(app => app.status === 'pending').length,
        admittedStudents: applications.filter(app => app.status === 'admitted').length
      };
      
      return stats;
    } catch (error) {
      console.error('Get dashboard error:', error);
      return {
        totalApplications: 0,
        totalCourses: 0,
        pendingApplications: 0,
        admittedStudents: 0
      };
    }
  },

  async getApplications() {
    try {
      const response = await api.get('/institute/my-applications');
      return response.data.data || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch applications');
    }
  },

  async getCourses() {
    try {
      // Get all faculties and their courses
      const facultiesResponse = await api.get('/institute/faculties');
      const faculties = facultiesResponse.data.data || [];
      
      const allCourses = [];
      for (const faculty of faculties) {
        if (faculty.courses && Array.isArray(faculty.courses)) {
          allCourses.push(...faculty.courses);
        }
      }
      
      return allCourses;
    } catch (error) {
      console.error('Get courses error:', error);
      return [];
    }
  },

  async getFaculties() {
    try {
      const response = await api.get('/institute/faculties');
      return response.data.data || [];
    } catch (error) {
      console.error('Get faculties error:', error);
      return [];
    }
  },

  async addFaculty(facultyData) {
    try {
      const response = await api.post('/institute/faculties', facultyData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add faculty');
    }
  },

  async deleteFaculty(facultyId) {
    try {
      const response = await api.delete(`/institute/faculties/${facultyId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete faculty');
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/institute/profile');
      return response.data.data || {};
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await api.put('/institute/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  async updateAdmissionStatus(applicationId, status) {
    try {
      const response = await api.patch(`/institute/applications/${applicationId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update admission status');
    }
  },

  async getCourseApplications(courseId) {
    try {
      const response = await api.get(`/institute/courses/${courseId}/applications`);
      return response.data.data || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch course applications');
    }
  },

  async publishAdmissions(courseId) {
    try {
      const response = await api.post(`/institute/courses/${courseId}/publish-admissions`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to publish admissions');
    }
  },

  async createCourse(courseData) {
    try {
      const response = await api.post('/institute/courses', courseData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create course');
    }
  }
};

export default institutionService;