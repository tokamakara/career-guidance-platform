import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Fixed path
import { useNotification } from '../../context/NotificationContext'; // Fixed path
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
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

        <div className="auth-demo">
          <p className="demo-note">Demo Accounts:</p>
          <div className="demo-accounts">
            <div>
              <strong>Admin:</strong> admin@careerplatform.com / admin123
            </div>
            <div>
              <strong>Student:</strong> student@demo.com / student123
            </div>
            <div>
              <strong>Institute:</strong> institute@demo.com / institute123
            </div>
            <div>
              <strong>Company:</strong> company@demo.com / company123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;