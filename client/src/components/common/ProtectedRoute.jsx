import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Fixed path
import Loader from './Loader';

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
    if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile?.role)) {
      // Redirect to appropriate dashboard based on user role
      const redirectPath = getRoleRedirectPath(userProfile?.role);
      return <Navigate to={redirectPath} replace />;
    }
    
    if (!requiredRole && allowedRoles.length === 0) {
      return <Navigate to="/unauthorized" replace />;
    }
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