import { useState, useCallback } from 'react';
import { validateForm } from '../utils/validators';

export const useForm = (initialState, validationSchema = {}) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Update form field
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  // Handle field blur
  const handleBlur = useCallback((field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Validate single field
    if (validationSchema[field]) {
      const fieldRules = validationSchema[field];
      let fieldError = '';

      if (Array.isArray(fieldRules)) {
        for (const rule of fieldRules) {
          const error = rule(formData[field], formData);
          if (error) {
            fieldError = error;
            break;
          }
        }
      } else if (typeof fieldRules === 'function') {
        fieldError = fieldRules(formData[field], formData);
      }

      setErrors(prev => ({
        ...prev,
        [field]: fieldError
      }));
    }
  }, [formData, validationSchema]);

  // Validate entire form
  const validate = useCallback(() => {
    const { isValid, errors: validationErrors } = validateForm(formData, validationSchema);
    setErrors(validationErrors);
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    return isValid;
  }, [formData, validationSchema]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);

  // Set form data (useful for editing)
  const setForm = useCallback((data) => {
    setFormData(data);
  }, []);

  // Check if field has error and was touched
  const getFieldError = (field) => {
    return touched[field] ? errors[field] : '';
  };

  // Check if form is valid
  const isValid = Object.keys(errors).every(field => !errors[field]);

  return {
    formData,
    errors,
    touched,
    updateField,
    handleBlur,
    validate,
    resetForm,
    setForm,
    getFieldError,
    isValid,
    setFormData // For complex updates
  };
};