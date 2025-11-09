import React from 'react';
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
  ...props
}) => {
  const handleChange = (e) => {
    const value = type === 'checkbox' ? e.target.checked : e.target.value;
    onChange(name, value);
  };

  const handleBlur = () => {
    onBlur(name);
  };

  const showError = touched && error;

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            rows={rows || 4}
            disabled={disabled}
            className={`form-field ${showError ? 'error' : ''}`}
            {...props}
          />
        );

      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`form-field ${showError ? 'error' : ''}`}
            {...props}
          >
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
            id={name}
            name={name}
            checked={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className="form-checkbox"
            {...props}
          />
        );

      default:
        return (
          <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`form-field ${showError ? 'error' : ''}`}
            {...props}
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
      
      {showError && (
        <div className="error-message">{error}</div>
      )}
    </div>
  );
};

export default FormField;