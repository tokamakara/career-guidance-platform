import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { validateForm, validationSchemas, validators } from '../../utils/validators';
import Navbar from '../../components/common/Navbar/Navbar';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    // Role-specific fields
    institutionName: '',
    institutionType: 'university',
    companyName: '',
    industry: '',
    size: '',
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

  // Prevent invalid characters from being typed in name fields
  const handleNameKeyPress = (e) => {
    const char = e.key;
    // Allow: letters, spaces, hyphens, apostrophes, and backspace/delete/arrow keys
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter'];
    
    if (allowedKeys.includes(char)) {
      return; // Allow control keys
    }
    
    // Only allow letters, spaces, hyphens, and apostrophes
    if (!/^[A-Za-zÀ-ÿ\s'-]$/.test(char)) {
      e.preventDefault(); // Block invalid characters
    }
  };

  // Prevent invalid characters in name fields
  const handleNameInput = (e) => {
    const { name, value } = e.target;
    
    // Only allow letters, spaces, hyphens, and apostrophes for name fields
    if (name === 'firstName' || name === 'lastName') {
      // Remove any characters that are not letters, spaces, hyphens, or apostrophes
      const sanitizedValue = value.replace(/[^A-Za-zÀ-ÿ\s'-]/g, '');
      
      // Prevent consecutive special characters
      const cleanedValue = sanitizedValue.replace(/(\-\-)|(\'\')|(\s\s)/g, (match) => {
        return match[0];
      });
      
      setFormData(prev => ({
        ...prev,
        [name]: cleanedValue
      }));
      
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
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
    validateField(name, formData[name]);
  };

  const validateField = (fieldName, value) => {
    let validationRule;
    
    if (step === 1) {
      const step1Fields = ['firstName', 'lastName', 'email', 'role'];
      if (step1Fields.includes(fieldName)) {
        if (fieldName === 'role') {
          validationRule = [(value) => {
            if (!value || value.toString().trim() === '') {
              return 'Role is required';
            }
            return null;
          }];
        } else {
          validationRule = validationSchemas.register[fieldName];
        }
      }
    } else {
      // Step 2 validation
      if (fieldName === 'password' || fieldName === 'confirmPassword') {
        validationRule = validationSchemas.register[fieldName];
      } else if (fieldName === 'highSchool' && formData.role === 'student') {
        validationRule = [(value) => validators.required(value, 'High school name')];
      } else if (fieldName === 'institutionName' && formData.role === 'institute') {
        validationRule = [(value) => validators.organizationName(value, 'Institution name')];
      } else if (fieldName === 'phone' && formData.role === 'institute') {
        validationRule = [
          (value) => validators.required(value, 'Phone number'),
          validators.phone
        ];
      } else if (fieldName === 'companyName' && formData.role === 'company') {
        validationRule = [(value) => validators.organizationName(value, 'Company name')];
      } else if (fieldName === 'industry' && formData.role === 'company') {
        validationRule = [(value) => validators.required(value, 'Industry')];
      } else if (fieldName === 'size' && formData.role === 'company') {
        validationRule = [(value) => validators.required(value, 'Company size')];
      } else if (fieldName === 'phone' && formData.role === 'company') {
        validationRule = [
          (value) => validators.required(value, 'Phone number'),
          validators.phone
        ];
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
      role: [(value) => {
        if (!value || value.toString().trim() === '') {
          return 'Role is required';
        }
        return null;
      }]
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
      validationRules.highSchool = [(value) => validators.required(value, 'High school name')];
    } else if (formData.role === 'institute') {
      validationRules.institutionName = [(value) => validators.organizationName(value, 'Institution name')];
      validationRules.phone = [
        (value) => validators.required(value, 'Phone number'),
        validators.phone
      ];
    } else if (formData.role === 'company') {
      validationRules.companyName = [(value) => validators.organizationName(value, 'Company name')];
      validationRules.industry = [(value) => validators.required(value, 'Industry')];
      validationRules.size = [(value) => validators.required(value, 'Company size')];
      validationRules.phone = [
        (value) => validators.required(value, 'Phone number'),
        validators.phone
      ];
    }

    console.log('🔍 Validating step 2 with rules:', Object.keys(validationRules));
    console.log('🔍 Form data for validation:', {
      password: formData.password ? '***' : 'empty',
      confirmPassword: formData.confirmPassword ? '***' : 'empty',
      institutionName: formData.institutionName,
      phone: formData.phone,
      role: formData.role
    });

    const { errors: newErrors, isValid } = validateForm(formData, validationRules);
    
    console.log('🔍 Validation errors:', newErrors);
    console.log('🔍 Is valid:', isValid);
    
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
              <span className="error-text">
                {typeof errors.highSchool === 'string' ? errors.highSchool : 'High school name is required'}
              </span>
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
                <span className="error-text">
                  {typeof errors.institutionName === 'string' ? errors.institutionName : 'Institution name is required'}
                </span>
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
                <span className="error-text">
                  {typeof errors.companyName === 'string' ? errors.companyName : 'Company name is required'}
                </span>
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
                <span className="error-text">
                  {typeof errors.industry === 'string' ? errors.industry : 'Industry is required'}
                </span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="size">Company Size *</label>
              <select
                id="size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldError('size') ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Select Company Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501+">501+ employees</option>
              </select>
              {getFieldError('size') && (
                <span className="error-text">
                  {typeof errors.size === 'string' ? errors.size : 'Company size is required'}
                </span>
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
                <span className="error-text">
                  {typeof errors.phone === 'string' ? errors.phone : 'Phone number is required'}
                </span>
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
    e.stopPropagation();
    
    console.log('🔵 Form submit triggered', { step, role: formData.role });
    console.log('🔵 Form data:', formData);
    
    const isValid = validateStep2();
    console.log('🔵 Validation result:', isValid);
    console.log('🔵 Current errors:', errors);
    
    if (!isValid) {
      console.warn('⚠️ Validation failed, showing errors');
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form before submitting'
      });
      return;
    }

    console.log('✅ Validation passed, starting registration...');
    setLoading(true);

    try {
      console.log('📤 Calling register with data:', {
        email: formData.email,
        role: formData.role,
        hasInstitutionName: !!formData.institutionName,
        hasPhone: !!formData.phone
      });
      
      await register(formData);
      
      console.log('✅ Registration successful');
      addNotification({
        type: 'success',
        title: 'Sign Up Successful',
        message: 'Please check your email inbox to verify your email address. You must verify your email before you can log in.'
      });
      // Navigate to login with state to show message and allow resend
      navigate('/login', { 
        state: { 
          message: 'Please check your email inbox to verify your email address. You must verify your email before you can log in. If you don\'t see the email, check your spam folder or click "Resend verification email" below.',
          email: formData.email,
          showResend: true
        } 
      });
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Extract error message
      let errorMessage = error.message || 'Sign up failed. Please try again.';
      
      // Check if it's an email already registered error
      if (errorMessage.toLowerCase().includes('already registered') || 
          errorMessage.toLowerCase().includes('email is already')) {
        errorMessage = 'This email is already registered. Please use a different email or sign in instead.';
      }
      
      addNotification({
        type: 'error',
        title: 'Sign Up Failed',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Navbar />
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join the Career Guidance Platform</p>
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
                    onChange={handleNameInput}
                    onKeyPress={handleNameKeyPress}
                    onBlur={handleBlur}
                    placeholder="Enter your first name"
                    className={getFieldError('firstName') ? 'error' : ''}
                    disabled={loading}
                    title="Only letters, spaces, hyphens, and apostrophes are allowed"
                  />
                  {getFieldError('firstName') && (
                    <span className="error-text">
                      {typeof errors.firstName === 'string' ? errors.firstName : 'First name is required'}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleNameInput}
                    onKeyPress={handleNameKeyPress}
                    onBlur={handleBlur}
                    placeholder="Enter your last name"
                    className={getFieldError('lastName') ? 'error' : ''}
                    disabled={loading}
                    title="Only letters, spaces, hyphens, and apostrophes are allowed"
                  />
                  {getFieldError('lastName') && (
                    <span className="error-text">
                      {typeof errors.lastName === 'string' ? errors.lastName : 'Last name is required'}
                    </span>
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
                  <span className="error-text">
                    {typeof errors.email === 'string' ? errors.email : 'Email address is required'}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldError('role') ? 'error' : ''}
                  disabled={loading}
                >
                  <option value="">Select a role</option>
                  <option value="student">Student</option>
                  <option value="institute">Institute</option>
                  <option value="company">Company</option>
                </select>
                {getFieldError('role') && (
                  <span className="error-text">
                    {typeof errors.role === 'string' ? errors.role : 'Role is required'}
                  </span>
                )}
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
                  <span className="error-text">
                    {typeof errors.password === 'string' ? errors.password : 'Password is required'}
                  </span>
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
                  <span className="error-text">
                    {typeof errors.confirmPassword === 'string' ? errors.confirmPassword : 'Please confirm your password'}
                  </span>
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