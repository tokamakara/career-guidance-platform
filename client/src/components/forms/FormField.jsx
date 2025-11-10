import React, { useState, useEffect } from 'react';
import { validators, validateForm } from '../../utils/validators';
import './FormField.css';

const FormField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  required = false,
  options = [], // For select fields
  rows, // For textarea
  disabled = false,
  className = '',
  validationRules = [], // New: validation rules array
  immediateValidation = false, // New: validate on change
  ...props
}) => {
  const [localError, setLocalError] = useState('');
  const [isTouched, setIsTouched] = useState(false);

  // Helper function to validate input
  const validateInput = (value, rules) => {
    if (!rules || rules.length === 0) return '';
    
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return '';
  };

  // Validate input when value changes (if immediateValidation is true)
  useEffect(() => {
    if (immediateValidation && validationRules.length > 0 && value) {
      const validationError = validateInput(value, validationRules);
      setLocalError(validationError || '');
    }
  }, [value, validationRules, immediateValidation]);

  const handleChange = (e) => {
    const newValue = type === 'checkbox' ? e.target.checked : e.target.value;
    
    // Real-time validation for certain field types
    if (immediateValidation && validationRules.length > 0) {
      const validationError = validateInput(newValue, validationRules);
      setLocalError(validationError || '');
    }
    
    onChange(name, newValue);
  };

  const handleBlur = (e) => {
    setIsTouched(true);
    
    // Validate on blur
    if (validationRules.length > 0) {
      const validationError = validateInput(value, validationRules);
      setLocalError(validationError || '');
    }
    
    onBlur(name);
  };

  const handleFocus = () => {
    setIsTouched(true);
  };

  const showError = (touched || isTouched) && (error || localError);
  const displayError = error || localError;

  // Input pattern restrictions based on field type
  const getInputProps = () => {
    const baseProps = {
      id: name,
      name: name,
      value: value,
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
      placeholder: placeholder,
      disabled: disabled,
      className: `form-field ${showError ? 'error' : ''}`,
      ...props
    };

    // Add pattern restrictions for specific field types
    switch (type) {
      case 'name':
      case 'firstName':
      case 'lastName':
        return {
          ...baseProps,
          type: 'text',
          pattern: "[A-Za-zÀ-ÿ'\\-\\s]+",
          title: "Only letters, spaces, hyphens, and apostrophes allowed",
          className: `form-field name-field ${showError ? 'error' : ''}`
        };
      
      case 'email':
        return {
          ...baseProps,
          type: 'email',
          autoComplete: 'email'
        };
      
      case 'phone':
        return {
          ...baseProps,
          type: 'tel',
          pattern: "[\\+\\d\\s\\-\\(\\)]+",
          title: "Please enter a valid phone number"
        };
      
      case 'number':
        return {
          ...baseProps,
          type: 'number',
          step: 'any'
        };
      
      default:
        return baseProps;
    }
  };

  const renderField = () => {
    const inputProps = getInputProps();

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...inputProps}
            rows={rows || 4}
          />
        );

      case 'select':
        return (
          <select {...inputProps}>
            <option value="">Select {label}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            {...inputProps}
            className="form-checkbox"
          />
        );

      default:
        return (
          <input
            type={type === 'name' ? 'text' : type}
            {...inputProps}
          />
        );
    }
  };

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      
      {renderField()}
      
      {showError && displayError && (
        <div className="error-message">
          {displayError}
        </div>
      )}
      
      {/* Character counter for text fields */}
      {(type === 'textarea' || type === 'text') && value && (
        <div className={`char-counter ${value.length > (props.maxLength || 1000) * 0.9 ? 'warning' : ''}`}>
          {value.length} / {props.maxLength || '∞'}
        </div>
      )}
    </div>
  );
};

export default FormField;