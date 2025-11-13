import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Fixed path
import Loader from './Loader';
import PendingApproval from './PendingApproval';

const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  allowedRoles = [],
  redirectTo = '/login' 
}) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!currentUser) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user has the required role or is in allowed roles
  if (requiredRole && userProfile?.role !== requiredRole) {
    // If user doesn't have required role, redirect to their appropriate dashboard
    const redirectPath = getRoleRedirectPath(userProfile?.role);
    return <Navigate to={redirectPath} replace />;
  }
  
  // Check allowed roles if specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile?.role)) {
    const redirectPath = getRoleRedirectPath(userProfile?.role);
    return <Navigate to={redirectPath} replace />;
  }

  // Block pending companies/institutes from accessing any pages except profile/settings
  // Allow profile and settings pages for pending users
  const isPendingCompanyOrInstitute = (userProfile?.status === 'pending' && 
                                       (userProfile?.role === 'company' || userProfile?.role === 'institute'));
  const isProfileOrSettingsPage = location.pathname.includes('/profile') || location.pathname.includes('/settings');
  
  if (isPendingCompanyOrInstitute && !isProfileOrSettingsPage) {
    return <PendingApproval />;
  }

  return children;
};

// Helper function to get redirect path based on role
const getRoleRedirectPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'institute':
      return '/institute/dashboard';
    case 'company':
      return '/company/dashboard';
    case 'student':
      return '/student/dashboard';
    default:
      return '/';
  }
};

export default ProtectedRoute;