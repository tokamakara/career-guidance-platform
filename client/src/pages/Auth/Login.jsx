import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { validateForm, validationSchemas } from '../../utils/validators';
import Navbar from '../../components/common/Navbar/Navbar';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  
  const { login, loginWithGoogle, currentUser, userProfile, resendEmailVerification } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';
  const registrationMessage = location.state?.message;
  const registrationEmail = location.state?.email;
  const shouldShowResend = location.state?.showResend;

  // Show registration message if coming from registration
  useEffect(() => {
    if (registrationMessage) {
      addNotification({
        type: 'info',
        title: 'Email Verification Required',
        message: registrationMessage
      });
      if (shouldShowResend) {
        setShowResendVerification(true);
      }
    }
  }, [registrationMessage, shouldShowResend, addNotification]);

  // Redirect if already authenticated
  useEffect(() => {
    if (currentUser && userProfile && location.pathname === '/login') {
      const redirectPath = getRedirectPath(userProfile.role);
      // Show success notification only once when redirecting after login
      addNotification({
        type: 'success',
        title: 'Login Successful',
        message: 'Welcome back!'
      });
      navigate(redirectPath, { replace: true });
    } else if (currentUser && userProfile) {
      // Already logged in, just redirect without notification
      const redirectPath = getRedirectPath(userProfile.role);
      navigate(redirectPath, { replace: true });
    }
  }, [currentUser, userProfile, navigate, location.pathname, addNotification]);

  const getRedirectPath = (role) => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate single field on blur
    const { errors: fieldErrors } = validateForm(
      { [name]: formData[name] }, 
      { [name]: validationSchemas.login[name] }
    );
    
    if (fieldErrors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors[name]
      }));
    } else {
      // Clear error if validation passes
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateAllFields = () => {
    const { errors: newErrors, isValid } = validateForm(formData, validationSchemas.login);
    setErrors(newErrors);
    setTouched({
      email: true,
      password: true
    });
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous errors
    setErrors({});
    
    if (!validateAllFields()) {
      // Don't show notification - errors are already displayed in the form
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      // Don't show success notification here - it will be shown after redirect
      // Navigation will be handled by the useEffect
    } catch (error) {
      // Handle different error types
      let errorMessage = 'Invalid email or password';
      
      // Check error code or message for Firebase auth errors
      const errorCode = error.code || (error.message?.includes('auth/') ? error.message.match(/auth\/[a-z-]+/)?.[0] : null);
      
      if (errorCode === 'auth/user-not-found' || 
          errorCode === 'auth/wrong-password' || 
          errorCode === 'auth/invalid-credential' ||
          errorCode === 'auth/invalid-login-credentials' ||
          error.message?.includes('Invalid email or password') ||
          error.message?.includes('Wrong password') ||
          error.message?.includes('user does not exist')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format';
        setErrors({ email: 'Invalid email address format' });
      } else if (errorCode === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.message?.includes('verify your email') || 
                 error.message?.includes('email verification') ||
                 error.message?.includes('User profile not found')) {
        errorMessage = error.message;
        setShowResendVerification(true);
      } else if (error.message && !error.message.includes('Validation Error') && !error.message?.includes('fix the errors')) {
        errorMessage = error.message;
      }
      
      // Only show notification if it's not a validation error (those are shown in form)
      if (!error.message?.includes('Validation Error') && !error.message?.includes('fix the errors')) {
        addNotification({
          type: 'error',
          title: 'Login Failed',
          message: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  return (
    <div className="auth-container">
      <Navbar />
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="Enter your email"
              className={getFieldError('email') ? 'error' : ''}
              disabled={loading}
            />
            {getFieldError('email') && (
              <span className="error-text">
                {typeof errors.email === 'string' ? errors.email : 'Email address is required'}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="Enter your password"
              className={getFieldError('password') ? 'error' : ''}
              disabled={loading}
            />
            {getFieldError('password') && (
              <span className="error-text">
                {typeof errors.password === 'string' ? errors.password : 'Password is required'}
              </span>
            )}
          </div>

          <button 
            type="submit" 
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          onClick={async () => {
            try {
              setLoading(true);
              console.log('🔵 Google sign-in button clicked');
              await loginWithGoogle();
              console.log('✅ Google sign-in successful');
              addNotification({
                type: 'success',
                title: 'Login Successful',
                message: 'Welcome!'
              });
              
              // Wait a moment for userProfile to update, then navigate
              setTimeout(() => {
                const profile = userProfile || {};
                if (profile.role) {
                  navigate(`/${profile.role}/dashboard`);
                } else {
                  navigate('/student/dashboard'); // Default for Google sign-in
                }
              }, 500);
            } catch (error) {
              console.error('❌ Google sign-in error:', error);
              let errorMessage = error.message || 'Failed to sign in with Google';
              
              // Provide helpful error messages
              if (errorMessage.includes('popup') || errorMessage.includes('blocked')) {
                errorMessage = 'Popup was blocked. Please allow popups for this site and try again.';
              } else if (errorMessage.includes('redirect_uri_mismatch')) {
                errorMessage = 'Configuration error. Please contact support.';
              } else if (errorMessage.includes('not verified')) {
                errorMessage = 'This app is not verified. Please contact support.';
              }
              
              addNotification({
                type: 'error',
                title: 'Login Failed',
                message: errorMessage
              });
            } finally {
              setLoading(false);
            }
          }}
          className="auth-button google"
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: '8px' }}>
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.156 6.656 3.58 9 3.58z"/>
          </svg>
          Sign in with Google
        </button>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Sign Up here
            </Link>
          </p>
          <p>
            <Link to="/reset-password" className="auth-link">
              Forgot your password?
            </Link>
          </p>
          {(showResendVerification || registrationEmail) && (
            <p style={{ marginTop: '12px', marginBottom: '0' }}>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setLoading(true);
                    // If we have a user but they're not verified, use that user
                    // Otherwise, we need to sign them in first to resend
                    if (!currentUser) {
                      if (registrationEmail) {
                        addNotification({
                          type: 'info',
                          title: 'Sign In Required',
                          message: 'Please sign in first with your email and password, then you can resend the verification email.'
                        });
                      } else {
                        addNotification({
                          type: 'info',
                          title: 'Sign In Required',
                          message: 'Please sign in first, then you can resend the verification email.'
                        });
                      }
                      setLoading(false);
                      return;
                    }
                    
                    // User is signed in, resend verification
                    const result = await resendEmailVerification();
                    addNotification({
                      type: 'success',
                      title: 'Verification Email Sent',
                      message: result.message || 'Please check your inbox (and spam folder) for the verification link. The link will expire in 1 hour.'
                    });
                    setShowResendVerification(false);
                  } catch (error) {
                    addNotification({
                      type: 'error',
                      title: 'Failed to Send Email',
                      message: error.message || 'Failed to resend verification email. Please try again later.'
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
                className="auth-link"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  textDecoration: 'underline',
                  color: '#007bff',
                  opacity: loading ? 0.6 : 1,
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Resend verification email'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;