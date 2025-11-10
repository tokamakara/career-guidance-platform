import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { validateForm, validationSchemas } from '../../utils/validators';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const { login } = useAuth();

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

    // Validate single field
    const { errors: fieldErrors } = validateForm(
      { [name]: formData[name] }, 
      { [name]: validationSchemas.login[name] }
    );
    
    if (fieldErrors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors[name]
      }));
    }
  };

  const validateAllFields = () => {
    const { isValid, errors: validationErrors } = validateForm(formData, validationSchemas.login);
    setErrors(validationErrors);
    setTouched({ email: true, password: true });
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateAllFields()) {
      setSubmitError('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setSubmitError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {submitError && <div className="error-message">{submitError}</div>}
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          disabled={loading}
          className={getFieldError('email') ? 'error' : ''}
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
          disabled={loading}
          className={getFieldError('password') ? 'error' : ''}
        />
        {getFieldError('password') && (
          <span className="error-text">{errors.password}</span>
        )}
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="submit-button"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
};

export default LoginForm;