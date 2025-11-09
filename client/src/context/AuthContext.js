import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (user) {
        setCurrentUser(user);
        // Get additional user profile from Firestore
        try {
          const profile = await authService.getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setError('Failed to load user profile');
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      setError('');
      setLoading(true);
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      const result = await authService.login(email, password);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setError('');
      await authService.logout();
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (updates) => {
    try {
      setError('');
      const result = await authService.updateUserProfile(currentUser.uid, updates);
      setUserProfile(prev => ({ ...prev, ...updates }));
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      setError('');
      return await authService.resetPassword(email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    resetPassword,
    isAuthenticated: !!currentUser,
    isEmailVerified: currentUser?.emailVerified || false,
    userRole: userProfile?.role
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ADD THIS LINE TO EXPORT AuthContext:
export { AuthContext };