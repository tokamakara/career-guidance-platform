// Role-based authorization utilities

import { USER_ROLES } from './constants';

/**
 * Check if user has specific role
 */
export const hasRole = (user, role) => {
  return user && user.role === role;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (user, roles) => {
  return user && Array.isArray(roles) && roles.includes(user.role);
};

/**
 * Check if user has all of the specified roles
 */
export const hasAllRoles = (user, roles) => {
  return user && Array.isArray(roles) && roles.every(role => user.role === role);
};

/**
 * Get user role display name
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [USER_ROLES.STUDENT]: 'Student',
    [USER_ROLES.INSTITUTE]: 'Institution',
    [USER_ROLES.COMPANY]: 'Company',
    [USER_ROLES.ADMIN]: 'Administrator'
  };
  
  return roleNames[role] || 'User';
};

/**
 * Get user role icon
 */
export const getRoleIcon = (role) => {
  const roleIcons = {
    [USER_ROLES.STUDENT]: '🎓',
    [USER_ROLES.INSTITUTE]: '🏫',
    [USER_ROLES.COMPANY]: '🏢',
    [USER_ROLES.ADMIN]: '⚙️'
  };
  
  return roleIcons[role] || '👤';
};

/**
 * Get user role color
 */
export const getRoleColor = (role) => {
  const roleColors = {
    [USER_ROLES.STUDENT]: 'var(--color-primary)',
    [USER_ROLES.INSTITUTE]: 'var(--color-success)',
    [USER_ROLES.COMPANY]: 'var(--color-warning)',
    [USER_ROLES.ADMIN]: 'var(--color-danger)'
  };
  
  return roleColors[role] || 'var(--color-gray)';
};

/**
 * Check if user can access student features
 */
export const canAccessStudentFeatures = (user) => {
  return hasRole(user, USER_ROLES.STUDENT) || hasRole(user, USER_ROLES.ADMIN);
};

/**
 * Check if user can access institute features
 */
export const canAccessInstituteFeatures = (user) => {
  return hasRole(user, USER_ROLES.INSTITUTE) || hasRole(user, USER_ROLES.ADMIN);
};

/**
 * Check if user can access company features
 */
export const canAccessCompanyFeatures = (user) => {
  return hasRole(user, USER_ROLES.COMPANY) || hasRole(user, USER_ROLES.ADMIN);
};

/**
 * Check if user can access admin features
 */
export const canAccessAdminFeatures = (user) => {
  return hasRole(user, USER_ROLES.ADMIN);
};

/**
 * Check if user can manage users
 */
export const canManageUsers = (user) => {
  return hasRole(user, USER_ROLES.ADMIN);
};

/**
 * Check if user can manage institutions
 */
export const canManageInstitutions = (user) => {
  return hasRole(user, USER_ROLES.ADMIN) || hasRole(user, USER_ROLES.INSTITUTE);
};

/**
 * Check if user can manage companies
 */
export const canManageCompanies = (user) => {
  return hasRole(user, USER_ROLES.ADMIN) || hasRole(user, USER_ROLES.COMPANY);
};

/**
 * Check if user can view applications
 */
export const canViewApplications = (user, application) => {
  if (!user) return false;
  
  switch (user.role) {
    case USER_ROLES.STUDENT:
      return application.studentId === user.uid;
    case USER_ROLES.INSTITUTE:
      return application.institutionId === user.uid;
    case USER_ROLES.ADMIN:
      return true;
    default:
      return false;
  }
};

/**
 * Check if user can edit application
 */
export const canEditApplication = (user, application) => {
  if (!user) return false;
  
  switch (user.role) {
    case USER_ROLES.STUDENT:
      return application.studentId === user.uid && 
             application.status === 'pending';
    case USER_ROLES.INSTITUTE:
      return application.institutionId === user.uid;
    case USER_ROLES.ADMIN:
      return true;
    default:
      return false;
  }
};

/**
 * Check if user can delete application
 */
export const canDeleteApplication = (user, application) => {
  if (!user) return false;
  
  switch (user.role) {
    case USER_ROLES.STUDENT:
      return application.studentId === user.uid && 
             application.status === 'pending';
    case USER_ROLES.ADMIN:
      return true;
    default:
      return false;
  }
};

/**
 * Check if user can create courses
 */
export const canCreateCourses = (user) => {
  return hasRole(user, USER_ROLES.INSTITUTE) || hasRole(user, USER_ROLES.ADMIN);
};

/**
 * Check if user can create jobs
 */
export const canCreateJobs = (user) => {
  return hasRole(user, USER_ROLES.COMPANY) || hasRole(user, USER_ROLES.ADMIN);
};

/**
 * Check if user can view admin dashboard
 */
export const canViewAdminDashboard = (user) => {
  return hasRole(user, USER_ROLES.ADMIN);
};

/**
 * Check if user can view institute dashboard
 */
export const canViewInstituteDashboard = (user) => {
  return hasRole(user, USER_ROLES.INSTITUTE) || hasRole(user, USER_ROLES.ADMIN);
};

/**
 * Check if user can view company dashboard
 */
export const canViewCompanyDashboard = (user) => {
  return hasRole(user, USER_ROLES.COMPANY) || hasRole(user, USER_ROLES.ADMIN);
};

/**
 * Check if user can view student dashboard
 */
export const canViewStudentDashboard = (user) => {
  return hasRole(user, USER_ROLES.STUDENT) || hasRole(user, USER_ROLES.ADMIN);
};

/**
 * Get allowed routes based on user role
 */
export const getAllowedRoutes = (user) => {
  if (!user) return ['/login', '/register', '/', '/about', '/contact', '/institutions'];
  
  const baseRoutes = ['/profile', '/settings', '/logout'];
  const publicRoutes = ['/', '/about', '/contact', '/institutions'];
  
  const roleRoutes = {
    [USER_ROLES.STUDENT]: [
      '/student',
      '/student/education',
      '/student/career',
      '/student/documents'
    ],
    [USER_ROLES.INSTITUTE]: [
      '/institute',
      '/institute/courses',
      '/institute/applications',
      '/institute/admissions',
      '/institute/faculties'
    ],
    [USER_ROLES.COMPANY]: [
      '/company',
      '/company/jobs',
      '/company/applicants',
      '/company/candidates'
    ],
    [USER_ROLES.ADMIN]: [
      '/admin',
      '/admin/institutions',
      '/admin/companies',
      '/admin/reports',
      '/admin/admissions'
    ]
  };
  
  return [
    ...publicRoutes,
    ...baseRoutes,
    ...(roleRoutes[user.role] || [])
  ];
};

/**
 * Check if route is allowed for user
 */
export const isRouteAllowed = (user, path) => {
  const allowedRoutes = getAllowedRoutes(user);
  return allowedRoutes.some(route => path.startsWith(route));
};

/**
 * Get user permissions object
 */
export const getUserPermissions = (user) => {
  if (!user) return {};
  
  return {
    // Student permissions
    canApplyToCourses: hasRole(user, USER_ROLES.STUDENT),
    canApplyToJobs: hasRole(user, USER_ROLES.STUDENT),
    canUploadDocuments: hasRole(user, USER_ROLES.STUDENT),
    canViewApplications: hasRole(user, USER_ROLES.STUDENT),
    
    // Institute permissions
    canCreateCourses: hasRole(user, USER_ROLES.INSTITUTE),
    canManageApplications: hasRole(user, USER_ROLES.INSTITUTE),
    canManageAdmissions: hasRole(user, USER_ROLES.INSTITUTE),
    
    // Company permissions
    canCreateJobs: hasRole(user, USER_ROLES.COMPANY),
    canViewApplicants: hasRole(user, USER_ROLES.COMPANY),
    canManageJobPosts: hasRole(user, USER_ROLES.COMPANY),
    
    // Admin permissions
    canManageUsers: hasRole(user, USER_ROLES.ADMIN),
    canManageInstitutions: hasRole(user, USER_ROLES.ADMIN),
    canManageCompanies: hasRole(user, USER_ROLES.ADMIN),
    canViewReports: hasRole(user, USER_ROLES.ADMIN),
    canViewAllData: hasRole(user, USER_ROLES.ADMIN)
  };
};

/**
 * Check if user can perform action
 */
export const canPerformAction = (user, action) => {
  const permissions = getUserPermissions(user);
  return permissions[action] || false;
};

export default {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  getRoleDisplayName,
  getRoleIcon,
  getRoleColor,
  canAccessStudentFeatures,
  canAccessInstituteFeatures,
  canAccessCompanyFeatures,
  canAccessAdminFeatures,
  canManageUsers,
  canManageInstitutions,
  canManageCompanies,
  canViewApplications,
  canEditApplication,
  canDeleteApplication,
  canCreateCourses,
  canCreateJobs,
  canViewAdminDashboard,
  canViewInstituteDashboard,
  canViewCompanyDashboard,
  canViewStudentDashboard,
  getAllowedRoutes,
  isRouteAllowed,
  getUserPermissions,
  canPerformAction
};