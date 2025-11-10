import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { validateForm, validationSchemas } from '../../../utils/validators';
import FormField from './FormField';
import './RegisterForm.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    // Role-specific fields
    institutionName: '',
    companyName: '',
    institutionType: '',
    industry: '',
    size: '',
    phone: '',
    website: '',
    dateOfBirth: '',
    highSchool: ''
  });
  
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const { register } = useAuth();

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Validate individual field
    const validationRules = getValidationRules();
    if (validationRules[field]) {
      const value = formData[field];
      let error = '';
      
      if (Array.isArray(validationRules[field])) {
        for (const rule of validationRules[field]) {
          const ruleError = rule(value, formData);
          if (ruleError) {
            error = ruleError;
            break;
          }
        }
      }
      
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const getValidationRules = () => {
    const baseRules = validationSchemas.register;
    
    switch (formData.role) {
      case 'student':
        return { ...baseRules, ...validationSchemas.studentRegister };
      case 'institute':
        return { ...baseRules, ...validationSchemas.institutionRegister };
      case 'company':
        return { ...baseRules, ...validationSchemas.companyRegister };
      default:
        return baseRules;
    }
  };

  const validateAllFields = () => {
    const validationRules = getValidationRules();
    const { isValid, errors: validationErrors } = validateForm(formData, validationRules);
    
    setErrors(validationErrors);
    
    // Mark all fields as touched to show errors
    const allTouched = {};
    Object.keys(validationRules).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
    
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
      // Prepare registration data based on role
      const registrationData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      };

      // Add role-specific data
      if (formData.role === 'student') {
        registrationData.dateOfBirth = formData.dateOfBirth;
        registrationData.phone = formData.phone;
        registrationData.highSchool = formData.highSchool;
      } else if (formData.role === 'institute') {
        registrationData.institutionName = formData.institutionName;
        registrationData.institutionType = formData.institutionType;
        registrationData.location = formData.institutionType; // Using type as location for demo
        registrationData.phone = formData.phone;
        registrationData.website = formData.website;
      } else if (formData.role === 'company') {
        registrationData.companyName = formData.companyName;
        registrationData.industry = formData.industry;
        registrationData.size = formData.size;
        registrationData.website = formData.website;
        registrationData.phone = formData.phone;
      }

      await register(registrationData);
    } catch (err) {
      setSubmitError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'student':
        return (
          <>
            <FormField
              label="Date of Birth"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.dateOfBirth}
              touched={touched.dateOfBirth}
              required
              disabled={loading}
              validationRules={validationSchemas.studentRegister.dateOfBirth}
            />
            
            <FormField
              label="Phone Number"
              type="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone}
              touched={touched.phone}
              placeholder="+266 1234 5678"
              required
              disabled={loading}
              validationRules={validationSchemas.studentRegister.phone}
            />
            
            <FormField
              label="High School"
              type="text"
              name="highSchool"
              value={formData.highSchool}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.highSchool}
              touched={touched.highSchool}
              placeholder="Your high school name"
              required
              disabled={loading}
            />
          </>
        );

      case 'institute':
        return (
          <>
            <FormField
              label="Institution Name"
              type="text"
              name="institutionName"
              value={formData.institutionName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.institutionName}
              touched={touched.institutionName}
              placeholder="National University of Lesotho"
              required
              disabled={loading}
              validationRules={validationSchemas.institutionRegister.institutionName}
            />
            
            <FormField
              label="Institution Type"
              type="select"
              name="institutionType"
              value={formData.institutionType}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.institutionType}
              touched={touched.institutionType}
              required
              disabled={loading}
              options={[
                { value: 'university', label: 'University' },
                { value: 'polytechnic', label: 'Polytechnic' },
                { value: 'college', label: 'College' },
                { value: 'vocational', label: 'Vocational School' }
              ]}
            />
            
            <FormField
              label="Phone Number"
              type="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone}
              touched={touched.phone}
              placeholder="+266 1234 5678"
              required
              disabled={loading}
              validationRules={validationSchemas.institutionRegister.phone}
            />
            
            <FormField
              label="Website (Optional)"
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.website}
              touched={touched.website}
              placeholder="https://example.com"
              disabled={loading}
              validationRules={validationSchemas.institutionRegister.website}
            />
          </>
        );

      case 'company':
        return (
          <>
            <FormField
              label="Company Name"
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.companyName}
              touched={touched.companyName}
              placeholder="Your company name"
              required
              disabled={loading}
              validationRules={validationSchemas.companyRegister.companyName}
            />
            
            <FormField
              label="Industry"
              type="select"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.industry}
              touched={touched.industry}
              required
              disabled={loading}
              options={[
                { value: 'technology', label: 'Technology' },
                { value: 'healthcare', label: 'Healthcare' },
                { value: 'education', label: 'Education' },
                { value: 'finance', label: 'Finance' },
                { value: 'manufacturing', label: 'Manufacturing' },
                { value: 'retail', label: 'Retail' },
                { value: 'other', label: 'Other' }
              ]}
            />
            
            <FormField
              label="Company Size"
              type="select"
              name="size"
              value={formData.size}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.size}
              touched={touched.size}
              required
              disabled={loading}
              options={[
                { value: '1-10', label: '1-10 employees' },
                { value: '11-50', label: '11-50 employees' },
                { value: '51-200', label: '51-200 employees' },
                { value: '201-500', label: '201-500 employees' },
                { value: '501+', label: '501+ employees' }
              ]}
            />
            
            <FormField
              label="Phone Number"
              type="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone}
              touched={touched.phone}
              placeholder="+266 1234 5678"
              required
              disabled={loading}
              validationRules={validationSchemas.companyRegister.phone}
            />
            
            <FormField
              label="Website (Optional)"
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.website}
              touched={touched.website}
              placeholder="https://example.com"
              disabled={loading}
              validationRules={validationSchemas.companyRegister.website}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <h2>Create Your Account</h2>
      
      {submitError && (
        <div className="submit-error">
          {submitError}
        </div>
      )}
      
      <div className="form-row">
        <FormField
          label="First Name"
          type="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.firstName}
          touched={touched.firstName}
          placeholder="John"
          required
          disabled={loading}
          validationRules={validationSchemas.register.firstName}
          immediateValidation={true}
        />
        
        <FormField
          label="Last Name"
          type="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.lastName}
          touched={touched.lastName}
          placeholder="Doe"
          required
          disabled={loading}
          validationRules={validationSchemas.register.lastName}
          immediateValidation={true}
        />
      </div>

      <FormField
        label="Email Address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.email}
        touched={touched.email}
        placeholder="john.doe@example.com"
        required
        disabled={loading}
        validationRules={validationSchemas.register.email}
        immediateValidation={true}
      />

      <FormField
        label="I am a"
        type="select"
        name="role"
        value={formData.role}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.role}
        touched={touched.role}
        required
        disabled={loading}
        options={[
          { value: 'student', label: 'Student' },
          { value: 'institute', label: 'Institution' },
          { value: 'company', label: 'Company' }
        ]}
      />

      {renderRoleSpecificFields()}

      <FormField
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.password}
        touched={touched.password}
        placeholder="At least 6 characters"
        required
        disabled={loading}
        validationRules={validationSchemas.register.password}
        immediateValidation={true}
      />

      <FormField
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.confirmPassword}
        touched={touched.confirmPassword}
        placeholder="Re-enter your password"
        required
        disabled={loading}
        validationRules={[(value) => validationSchemas.register.confirmPassword[0](value, formData)]}
        immediateValidation={true}
      />

      <button 
        type="submit" 
        disabled={loading}
        className={`submit-button ${loading ? 'loading' : ''}`}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <div className="form-footer">
        <p>Already have an account? <a href="/login">Sign in</a></p>
      </div>
    </form>
  );
};

export default RegisterForm;