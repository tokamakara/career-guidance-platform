import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { validateForm, validationSchemas, validators } from '../../utils/validators';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    // Role-specific fields
    institutionName: '',
    institutionType: 'university',
    companyName: '',
    industry: '',
    phone: '',
    highSchool: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const { register } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

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
    validateField(name, formData[name]);
  };

  const validateField = (fieldName, value) => {
    let validationRule;
    
    if (step === 1) {
      const step1Fields = ['firstName', 'lastName', 'email', 'role'];
      if (step1Fields.includes(fieldName)) {
        validationRule = validationSchemas.register[fieldName];
      }
    } else {
      // Step 2 validation
      if (fieldName === 'password' || fieldName === 'confirmPassword') {
        validationRule = validationSchemas.register[fieldName];
      } else if (fieldName === 'highSchool' && formData.role === 'student') {
        validationRule = [validators.required];
      } else if ((fieldName === 'institutionName' || fieldName === 'phone') && formData.role === 'institute') {
        validationRule = [validators.required];
      } else if ((fieldName === 'companyName' || fieldName === 'industry' || fieldName === 'phone') && formData.role === 'company') {
        validationRule = [validators.required];
      }
    }

    if (validationRule) {
      const fieldErrors = validateForm({ [fieldName]: value }, { [fieldName]: validationRule });
      if (fieldErrors.errors[fieldName]) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: fieldErrors.errors[fieldName]
        }));
      }
    }
  };

  const validateStep1 = () => {
    const step1Data = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: formData.role
    };
    
    const { errors: newErrors, isValid } = validateForm(step1Data, {
      firstName: validationSchemas.register.firstName,
      lastName: validationSchemas.register.lastName,
      email: validationSchemas.register.email,
      role: validationSchemas.register.role
    });

    setErrors(newErrors);
    setTouched(prev => ({
      ...prev,
      firstName: true,
      lastName: true,
      email: true,
      role: true
    }));

    return isValid;
  };

  const validateStep2 = () => {
    const validationRules = {
      password: validationSchemas.register.password,
      confirmPassword: [(value) => validators.confirmPassword(value, formData.password)]
    };

    // Add role-specific validations
    if (formData.role === 'student') {
      validationRules.highSchool = [validators.required];
    } else if (formData.role === 'institute') {
      validationRules.institutionName = [validators.required];
      validationRules.phone = [validators.required, validators.phone];
    } else if (formData.role === 'company') {
      validationRules.companyName = [validators.required];
      validationRules.industry = [validators.required];
      validationRules.phone = [validators.required, validators.phone];
    }

    const { errors: newErrors, isValid } = validateForm(formData, validationRules);
    setErrors(newErrors);
    setTouched(prev => ({
      ...prev,
      ...Object.keys(validationRules).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    }));

    return isValid;
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  const handleRoleSpecificFields = () => {
    switch (formData.role) {
      case 'student':
        return (
          <div className="form-group">
            <label htmlFor="highSchool">High School *</label>
            <input
              type="text"
              id="highSchool"
              name="highSchool"
              value={formData.highSchool}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your high school name"
              className={getFieldError('highSchool') ? 'error' : ''}
              disabled={loading}
            />
            {getFieldError('highSchool') && (
              <span className="error-text">{errors.highSchool}</span>
            )}
          </div>
        );
      case 'institute':
        return (
          <>
            <div className="form-group">
              <label htmlFor="institutionName">Institution Name *</label>
              <input
                type="text"
                id="institutionName"
                name="institutionName"
                value={formData.institutionName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter institution name"
                className={getFieldError('institutionName') ? 'error' : ''}
                disabled={loading}
              />
              {getFieldError('institutionName') && (
                <span className="error-text">{errors.institutionName}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="institutionType">Institution Type *</label>
              <select
                id="institutionType"
                name="institutionType"
                value={formData.institutionType}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="university">University</option>
                <option value="college">College</option>
                <option value="vocational">Vocational School</option>
                <option value="technical">Technical Institute</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter phone number"
                className={getFieldError('phone') ? 'error' : ''}
                disabled={loading}
              />
              {getFieldError('phone') && (
                <span className="error-text">{errors.phone}</span>
              )}
            </div>
          </>
        );
      case 'company':
        return (
          <>
            <div className="form-group">
              <label htmlFor="companyName">Company Name *</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter company name"
                className={getFieldError('companyName') ? 'error' : ''}
                disabled={loading}
              />
              {getFieldError('companyName') && (
                <span className="error-text">{errors.companyName}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="industry">Industry *</label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className={getFieldError('industry') ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Select Industry</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="finance">Finance</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="retail">Retail</option>
                <option value="other">Other</option>
              </select>
              {getFieldError('industry') && (
                <span className="error-text">{errors.industry}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter phone number"
                className={getFieldError('phone') ? 'error' : ''}
                disabled={loading}
              />
              {getFieldError('phone') && (
                <span className="error-text">{errors.phone}</span>
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const nextStep = () => {
    if (validateStep1()) {
      setStep(2);
    } else {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors before continuing'
      });
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form'
      });
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      addNotification({
        type: 'success',
        title: 'Registration Successful',
        message: 'Please check your email for verification. Your account will be activated after admin approval if required.'
      });
      navigate('/login');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'Registration failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join the Career Guidance Platform</p>
        </div>

        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {step === 1 && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your first name"
                    className={getFieldError('firstName') ? 'error' : ''}
                    disabled={loading}
                  />
                  {getFieldError('firstName') && (
                    <span className="error-text">{errors.firstName}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your last name"
                    className={getFieldError('lastName') ? 'error' : ''}
                    disabled={loading}
                  />
                  {getFieldError('lastName') && (
                    <span className="error-text">{errors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your email"
                  className={getFieldError('email') ? 'error' : ''}
                  disabled={loading}
                />
                {getFieldError('email') && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="role">I am a *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="student">Student</option>
                  <option value="institute">Educational Institute</option>
                  <option value="company">Company/Employer</option>
                </select>
              </div>

              <button 
                type="button" 
                className="auth-button primary"
                onClick={nextStep}
                disabled={loading}
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              {handleRoleSpecificFields()}

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Create a password (min. 6 characters)"
                  className={getFieldError('password') ? 'error' : ''}
                  disabled={loading}
                />
                {getFieldError('password') && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Confirm your password"
                  className={getFieldError('confirmPassword') ? 'error' : ''}
                  disabled={loading}
                />
                {getFieldError('confirmPassword') && (
                  <span className="error-text">{errors.confirmPassword}</span>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="auth-button secondary"
                  onClick={prevStep}
                  disabled={loading}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="auth-button primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;