import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService as apiAuthService } from '../services/api/authService';
import { authService as firebaseAuthService } from '../services/firebase/auth';
import { signInWithEmailAndPassword, getIdToken } from 'firebase/auth';
import { auth } from '../services/firebase';

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
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    console.log('🔄 AuthProvider mounted - Initializing authentication...');
    
    // Step 1: Check if user is already authenticated on app start
    const initializeAuthState = async () => {
      try {
        console.log('🔍 Checking for existing authentication session...');
        setLoading(true);
        
        // Get current user from Firebase Auth persistence
        const checkCurrentUser = () => {
          return new Promise((resolve) => {
            // Use the auth state change listener to get current state
            const unsubscribe = firebaseAuthService.onAuthStateChange((user) => {
              unsubscribe(); // Immediately unsubscribe after first check
              resolve(user);
            });
          });
        };

        const existingUser = await checkCurrentUser();
        
        if (existingUser) {
          console.log('✅ User found in persisted session:', existingUser.email);
          
          // Allow unverified users to stay logged in (they can verify email later)
          // The ProtectedRoute will handle redirecting them to verification page if needed
          setCurrentUser(existingUser);
          
          // Log email verification status
          if (!existingUser.emailVerified) {
            console.warn('⚠️ Email not verified - user can stay logged in to verify email');
          } else {
            console.log('✅ Email verified');
          }
          
          // Get and store Firebase ID token for API authentication
          try {
            const idToken = await getIdToken(existingUser);
            localStorage.setItem('authToken', idToken);
            console.log('✅ ID token stored for API authentication');
          } catch (tokenError) {
            console.error('❌ Failed to get ID token:', tokenError);
          }
          
          // Step 2: Load user profile from Firestore
          try {
            console.log('📋 Loading user profile data from Firestore...');
            const profile = await firebaseAuthService.getUserProfile(existingUser.uid);
            
            if (profile) {
              console.log('✅ User profile loaded successfully:', {
                role: profile.role,
                name: `${profile.firstName} ${profile.lastName}`,
                status: profile.status
              });
              setUserProfile(profile);
              
              // Check account status
              if (profile.status === 'pending') {
                console.warn('⚠️ Account pending approval');
                setError('Your account is pending admin approval. You will be notified when approved.');
              } else if (profile.status === 'suspended') {
                console.error('❌ Account suspended');
                setError('Your account has been suspended. Please contact administrator.');
                await firebaseAuthService.logout();
                setCurrentUser(null);
                setUserProfile(null);
              }
            } else {
              console.warn('⚠️ User profile not found in Firestore');
              setError('User profile data missing. Please contact support.');
            }
          } catch (profileError) {
            console.error('❌ Failed to load user profile:', profileError);
            setError('Failed to load user profile data. Some features may be limited.');
          }
        } else {
          console.log('🔒 No user session found - user is not authenticated');
          setCurrentUser(null);
          setUserProfile(null);
          // Clear token if no user
          localStorage.removeItem('authToken');
        }
      } catch (initError) {
        console.error('❌ Auth initialization failed:', initError);
        setError('Failed to initialize authentication system.');
      } finally {
        setLoading(false);
        setAuthInitialized(true);
        console.log('🏁 Authentication initialization complete');
      }
    };

    initializeAuthState();

    // Step 3: Set up real-time auth state listener for future changes
    console.log('👂 Setting up real-time auth state listener...');
    const unsubscribe = firebaseAuthService.onAuthStateChange(async (user) => {
      console.log('🔄 Auth state change detected:', user ? `User: ${user.email}` : 'User signed out');
      
      if (user) {
        // Allow unverified users to stay logged in (they need to verify their email)
        // Only block them from accessing protected routes, don't sign them out
        // This allows them to see the verification message and resend verification email
        setCurrentUser(user);
        
        // Log email verification status
        if (!user.emailVerified) {
          console.warn('⚠️ Email not verified - user can stay logged in to verify email');
          console.warn('⚠️ User should be redirected to verification page');
        } else {
          console.log('✅ Email verified');
        }
        
        // Get and store Firebase ID token for API authentication
        try {
          const idToken = await getIdToken(user);
          localStorage.setItem('authToken', idToken);
          console.log('✅ ID token refreshed on auth state change');
        } catch (tokenError) {
          console.error('❌ Failed to get ID token:', tokenError);
        }
        
        try {
          // Reload profile data on auth state change
          const profile = await firebaseAuthService.getUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
            console.log('✅ Profile updated on auth state change');
            
            // Validate account status on each auth state change
            if (profile.status === 'suspended') {
              console.error('❌ Account suspended during session');
              setError('Your account has been suspended. Please contact administrator.');
              await firebaseAuthService.logout();
              setCurrentUser(null);
              setUserProfile(null);
            }
          }
        } catch (profileError) {
          console.error('❌ Profile reload failed on auth change:', profileError);
        }
      } else {
        // User signed out
        console.log('👋 User signed out - clearing auth state');
        setCurrentUser(null);
        setUserProfile(null);
        setError(''); // Clear any previous errors on logout
        // Clear token on logout
        localStorage.removeItem('authToken');
      }
    });

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up auth state listener...');
      unsubscribe();
    };
  }, []);

  // Enhanced register function with detailed logging - Uses backend API
  const register = async (userData) => {
    console.log('🚀 Starting registration process for:', userData.email);
    console.log('📝 Registration data:', {
      role: userData.role,
      name: `${userData.firstName} ${userData.lastName}`,
      hasInstitutionData: !!userData.institutionName,
      hasCompanyData: !!userData.companyName
    });

    try {
      setError('');
      setLoading(true);
      
      // Use backend API for registration (creates user in Firebase Auth + Firestore)
      const result = await apiAuthService.register(userData);
      
      console.log('🎉 Registration successful:', {
        userId: result.data.uid,
        email: result.data.email,
        role: result.data.role,
        message: result.message
      });
      
      // After backend registration, sign in the user with email/password to get Firebase session
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          userData.email, 
          userData.password
        );
        
        // Get ID token for API authentication
        const idToken = await getIdToken(userCredential.user);
        localStorage.setItem('authToken', idToken);
        
        return {
          ...result,
          user: userCredential.user
        };
      } catch (signInError) {
        console.warn('⚠️ Auto sign-in after registration failed:', signInError);
        // Registration succeeded, but auto sign-in failed - user can sign in manually
        return result;
      }
    } catch (error) {
      console.error('💥 Registration failed:', {
        errorCode: error.code,
        errorMessage: error.message,
        userEmail: userData.email
      });
      
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
      console.log('🏁 Registration process completed');
    }
  };

  // Enhanced login function with detailed logging - Uses backend API
  const login = async (email, password) => {
    console.log('🔐 Attempting login for:', email);
    
    try {
      setError('');
      setLoading(true);
      
      // Use backend API for login (handles profile recovery if needed)
      const result = await apiAuthService.login(email, password);
      
      console.log('✅ Login successful:', {
        userId: result.user.uid,
        email: result.user.email,
        emailVerified: result.user.emailVerified
      });
      
      return result;
    } catch (error) {
      console.error('❌ Login failed:', {
        email: email,
        errorCode: error.code,
        errorMessage: error.message
      });
      
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
      console.log('🏁 Login process completed');
    }
  };

  // Enhanced logout function
  const logout = async () => {
    console.log('🚪 Initiating logout process...');
    
    try {
      setError('');
      console.log('📤 Calling Firebase logout...');
      
      await firebaseAuthService.logout();
      
      console.log('✅ Logout successful - local state cleared');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      setError(error.message);
      throw error;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    console.log('🔐 Attempting Google login...');
    
    try {
      setError('');
      setLoading(true);
      
      const result = await firebaseAuthService.loginWithGoogle();
      
      console.log('✅ Google login successful:', {
        userId: result.user.uid,
        email: result.user.email
      });
      
      return result;
    } catch (error) {
      console.error('❌ Google login failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced profile update function
  const updateProfile = async (updates) => {
    console.log('📝 Updating user profile:', {
      userId: currentUser?.uid,
      updates: Object.keys(updates)
    });
    
    try {
      setError('');
      const result = await firebaseAuthService.updateUserProfile(currentUser.uid, updates);
      
      // Update local state
      setUserProfile(prev => {
        const updated = { ...prev, ...updates };
        console.log('✅ Profile updated locally:', Object.keys(updates));
        return updated;
      });
      
      return result;
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      setError(error.message);
      throw error;
    }
  };

  // Enhanced password reset function
  const resetPassword = async (email) => {
    console.log('📧 Sending password reset email to:', email);
    
    try {
      setError('');
      const result = await firebaseAuthService.resetPassword(email);
      console.log('✅ Password reset email sent successfully');
      return result;
    } catch (error) {
      console.error('❌ Password reset failed:', error);
      setError(error.message);
      throw error;
    }
  };

  const value = {
    // State
    currentUser,
    userProfile,
    loading,
    error,
    authInitialized,
    
    // Actions
    register,
    login,
    loginWithGoogle,
    logout,
    updateProfile,
    resetPassword,
    
    // Computed values
    isAuthenticated: !!currentUser,
    isEmailVerified: currentUser?.emailVerified || false,
    userRole: userProfile?.role,
    accountStatus: userProfile?.status || 'unknown',
    fullName: userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : '',
    
    // Helper methods
    hasRole: (role) => userProfile?.role === role,
    isAccountActive: () => userProfile?.status === 'active',
    canAccessDashboard: () => {
      if (!currentUser || !userProfile) return false;
      if (userProfile.status !== 'active') return false;
      return ['student', 'institute', 'company', 'admin'].includes(userProfile.role);
    },
    // Resend email verification
    resendEmailVerification: async () => {
      try {
        setError('');
        setLoading(true);
        const result = await firebaseAuthService.resendEmailVerification();
        return result;
      } catch (error) {
        setError(error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    }
  };

  console.log('🎯 AuthContext value updated:', {
    isAuthenticated: !!currentUser,
    userRole: userProfile?.role,
    loading: loading,
    hasError: !!error
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };