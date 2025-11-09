import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { validateForm, validationSchemas } from '../../utils/validators';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login, currentUser, userProfile } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (currentUser && userProfile) {
      const redirectPath = getRedirectPath(userProfile.role);
      navigate(redirectPath, { replace: true });
    }
  }, [currentUser, userProfile, navigate]);

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
    const fieldErrors = validateForm({ [name]: formData[name] }, { [name]: validationSchemas.login[name] });
    if (fieldErrors.errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors.errors[name]
      }));
    }
  };

  const validateAllFields = () => {
    const { errors: newErrors } = validateForm(formData, validationSchemas.login);
    setErrors(newErrors);
    setTouched({
      email: true,
      password: true
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAllFields()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form'
      });
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      addNotification({
        type: 'success',
        title: 'Login Successful',
        message: 'Welcome back!'
      });
      // Navigation will be handled by the useEffect
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: error.message || 'Invalid email or password'
      });
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  return (
    <div className="auth-container">
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
              <span className="error-text">{errors.email}</span>
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
              <span className="error-text">{errors.password}</span>
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

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Sign up here
            </Link>
          </p>
          <p>
            <Link to="/reset-password" className="auth-link">
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;