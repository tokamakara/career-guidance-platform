// Application Constants

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  INSTITUTE: 'institute',
  COMPANY: 'company',
  ADMIN: 'admin'
};

// Application Statuses
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  REJECTED: 'rejected',
  ACCEPTED: 'accepted',
  WITHDRAWN: 'withdrawn'
};

// Admission Statuses
export const ADMISSION_STATUS = {
  PENDING: 'pending',
  ADMITTED: 'admitted',
  REJECTED: 'rejected',
  WAITLISTED: 'waitlisted',
  ACCEPTED: 'accepted'
};

// Job Application Statuses
export const JOB_APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  SHORTLISTED: 'shortlisted',
  INTERVIEW: 'interview',
  REJECTED: 'rejected',
  OFFERED: 'offered',
  ACCEPTED: 'accepted'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  JOB_MATCH: 'job_match',
  ADMISSION_DECISION: 'admission_decision',
  APPLICATION_UPDATE: 'application_update',
  SYSTEM: 'system',
  GENERAL: 'general'
};

// Document Types
export const DOCUMENT_TYPES = {
  TRANSCRIPT: 'transcript',
  CERTIFICATE: 'certificate',
  RESUME: 'resume',
  COVER_LETTER: 'cover_letter',
  IDENTIFICATION: 'identification',
  OTHER: 'other'
};

// Job Types
export const JOB_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  INTERNSHIP: 'internship',
  REMOTE: 'remote',
  HYBRID: 'hybrid'
};

// Industries
export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Manufacturing',
  'Retail',
  'Hospitality',
  'Construction',
  'Transportation',
  'Agriculture',
  'Government',
  'Non-Profit',
  'Other'
];

// Institution Types
export const INSTITUTION_TYPES = [
  'University',
  'College',
  'Technical Institute',
  'Vocational School',
  'Polytechnic',
  'Other'
];

// Company Sizes
export const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees'
];

// Availability Options
export const AVAILABILITY_OPTIONS = [
  { value: 'immediate', label: 'Immediately' },
  { value: '2_weeks', label: 'Within 2 weeks' },
  { value: '1_month', label: 'Within 1 month' },
  { value: '3_months', label: 'Within 3 months' }
];

// File Upload Constraints
export const FILE_CONFIG = {
  MAX_SIZE: 20 * 1024 * 1024, // 20MB
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ],
  MAX_FILES: 10
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  VERIFY_EMAIL: '/api/auth/verify-email',
  RESET_PASSWORD: '/api/auth/reset-password',
  
  // Student endpoints
  STUDENT_PROFILE: '/api/student/profile',
  STUDENT_APPLICATIONS: '/api/student/applications',
  STUDENT_DOCUMENTS: '/api/student/documents',
  
  // Institute endpoints
  INSTITUTE_PROFILE: '/api/institute/profile',
  INSTITUTE_COURSES: '/api/institute/courses',
  INSTITUTE_APPLICATIONS: '/api/institute/applications',
  
  // Company endpoints
  COMPANY_PROFILE: '/api/company/profile',
  COMPANY_JOBS: '/api/company/jobs',
  COMPANY_APPLICANTS: '/api/company/applicants',
  
  // Admin endpoints
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_REPORTS: '/api/admin/reports'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  THEME_PREFERENCE: 'themePreference',
  USER_SETTINGS: 'userSettings'
};

// Route Paths
export const ROUTE_PATHS = {
  // Public routes
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  INSTITUTIONS: '/institutions',
  
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  RESET_PASSWORD: '/reset-password',
  
  // Student routes
  STUDENT_DASHBOARD: '/student',
  STUDENT_EDUCATION: '/student/education',
  STUDENT_CAREER: '/student/career',
  STUDENT_SETTINGS: '/student/settings',
  STUDENT_DOCUMENTS: '/student/documents',
  
  // Institute routes
  INSTITUTE_DASHBOARD: '/institute',
  INSTITUTE_COURSES: '/institute/courses',
  INSTITUTE_APPLICATIONS: '/institute/applications',
  INSTITUTE_ADMISSIONS: '/institute/admissions',
  
  // Company routes
  COMPANY_DASHBOARD: '/company',
  COMPANY_JOBS: '/company/jobs',
  COMPANY_APPLICANTS: '/company/applicants',
  COMPANY_CANDIDATES: '/company/candidates',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_INSTITUTIONS: '/admin/institutions',
  ADMIN_COMPANIES: '/admin/companies',
  ADMIN_REPORTS: '/admin/reports'
};

// Error Messages
export const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already exists',
  USER_NOT_FOUND: 'User not found',
  INVALID_TOKEN: 'Invalid or expired token',
  
  // Validation errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  
  // Application errors
  APPLICATION_LIMIT: 'You can only apply to maximum 2 courses per institution',
  ALREADY_APPLIED: 'You have already applied to this course',
  NOT_QUALIFIED: 'You do not meet the course requirements',
  
  // File errors
  FILE_TOO_LARGE: 'File size must be less than 10MB',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload PDF, DOC, or images',
  
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  
  // General errors
  UNKNOWN_ERROR: 'An unknown error occurred',
  PERMISSION_DENIED: 'You do not have permission to perform this action'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  // Auth success
  REGISTRATION_SUCCESS: 'Registration successful! Please check your email for verification.',
  LOGIN_SUCCESS: 'Login successful!',
  PASSWORD_RESET_SENT: 'Password reset instructions sent to your email',
  PROFILE_UPDATED: 'Profile updated successfully',
  
  // Application success
  APPLICATION_SUBMITTED: 'Application submitted successfully',
  APPLICATION_WITHDRAWN: 'Application withdrawn successfully',
  ADMISSION_ACCEPTED: 'Admission accepted successfully',
  
  // Job success
  JOB_POSTED: 'Job posted successfully',
  APPLICATION_SENT: 'Job application sent successfully',
  
  // General success
  SETTINGS_SAVED: 'Settings saved successfully',
  DOCUMENT_UPLOADED: 'Document uploaded successfully',
  DOCUMENT_DELETED: 'Document deleted successfully'
};

export default {
  USER_ROLES,
  APPLICATION_STATUS,
  ADMISSION_STATUS,
  JOB_APPLICATION_STATUS,
  NOTIFICATION_TYPES,
  DOCUMENT_TYPES,
  JOB_TYPES,
  INDUSTRIES,
  INSTITUTION_TYPES,
  COMPANY_SIZES,
  AVAILABILITY_OPTIONS,
  FILE_CONFIG,
  API_ENDPOINTS,
  STORAGE_KEYS,
  ROUTE_PATHS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};