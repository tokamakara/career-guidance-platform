export const validators = {
  // Email validation
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'Email is required';
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return null;
  },

  // Password validation
  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters long';
    if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
    return null;
  },

  // Confirm password validation
  confirmPassword: (value, password) => {
    if (!value) return 'Please confirm your password';
    if (value !== password) return 'Passwords do not match';
    return null;
  },

  // Required field validation
  required: (value, fieldName = 'This field') => {
    if (!value || value.toString().trim() === '') {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Enhanced name validation - STRICTER VERSION
  name: (value, fieldName = 'Name') => {
    const error = validators.required(value, fieldName);
    if (error) return error;
    
    const trimmedValue = value.trim();
    
    if (trimmedValue.length < 2) return `${fieldName} must be at least 2 characters long`;
    if (trimmedValue.length > 50) return `${fieldName} must be less than 50 characters`;
    
    // STRICT regex: Only letters, spaces, hyphens, apostrophes - NO numbers or special symbols
    const nameRegex = /^[A-Za-zÀ-ÿ]+([ '-][A-Za-zÀ-ÿ]+)*$/;
    if (!nameRegex.test(trimmedValue)) {
      return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes in proper format`;
    }
    
    // Check for consecutive special characters
    if (/(\-\-)|(\'\')|(\s\s)/.test(trimmedValue)) {
      return `${fieldName} cannot have consecutive special characters`;
    }
    
    // Check if starts/ends with special character
    if (/^[\-\'\s]|[\-\'\s]$/.test(trimmedValue)) {
      return `${fieldName} cannot start or end with spaces, hyphens, or apostrophes`;
    }
    
    // Check for invalid patterns like multiple words without proper separation
    if (/[A-Za-z]{20,}/.test(trimmedValue.replace(/[^A-Za-z]/g, ''))) {
      return `${fieldName} appears to contain invalid character sequences`;
    }
    
    return null;
  },

  // First name validation (even stricter)
  firstName: (value) => {
    return validators.name(value, 'First name');
  },

  // Last name validation
  lastName: (value) => {
    return validators.name(value, 'Last name');
  },

  // Institution/Company name validation
  organizationName: (value, fieldName = 'Name') => {
    const error = validators.required(value, fieldName);
    if (error) return error;
    
    const trimmedValue = value.trim();
    
    if (trimmedValue.length < 2) return `${fieldName} must be at least 2 characters long`;
    if (trimmedValue.length > 100) return `${fieldName} must be less than 100 characters`;
    
    // Allow letters, numbers, spaces, hyphens, apostrophes, and & for organization names
    const orgRegex = /^[A-Za-zÀ-ÿ0-9&]+([ '-][A-Za-zÀ-ÿ0-9&]+)*$/;
    if (!orgRegex.test(trimmedValue)) {
      return `${fieldName} can only contain letters, numbers, spaces, hyphens, apostrophes, and ampersands`;
    }
    
    return null;
  },

  // Phone number validation
  phone: (value) => {
    if (!value) return 'Phone number is required';
    
    // Remove all non-digit characters except + at start
    const cleanPhone = value.replace(/[^\d+]/g, '');
    
    // Validate phone format (international format allowed)
    const phoneRegex = /^[\+]?[1-9][\d]{7,14}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return 'Please enter a valid phone number (8-15 digits, can start with +)';
    }
    return null;
  },

  // URL validation
  url: (value) => {
    if (!value) return null; // URL is optional
    
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'URL must start with http:// or https://';
      }
      return null;
    } catch {
      return 'Please enter a valid URL (e.g., https://example.com)';
    }
  },

  // Number validation
  number: (value, fieldName = 'Number') => {
    if (!value) return `${fieldName} is required`;
    
    const num = Number(value);
    if (isNaN(num)) return `${fieldName} must be a valid number`;
    if (!/^\d+$/.test(value.toString())) return `${fieldName} must contain only digits`;
    
    return null;
  },

  // Positive number validation
  positiveNumber: (value, fieldName = 'Number') => {
    const error = validators.number(value, fieldName);
    if (error) return error;
    
    if (Number(value) <= 0) return `${fieldName} must be greater than 0`;
    
    return null;
  },

  // Date validation
  date: (value, fieldName = 'Date') => {
    if (!value) return `${fieldName} is required`;
    
    const date = new Date(value);
    if (isNaN(date.getTime())) return `${fieldName} must be a valid date`;
    
    // Check if date is not in the future (for birth dates, etc.)
    if (date > new Date()) return `${fieldName} cannot be in the future`;
    
    // Check if person is at least 13 years old
    const minAgeDate = new Date();
    minAgeDate.setFullYear(minAgeDate.getFullYear() - 13);
    if (date > minAgeDate) return 'You must be at least 13 years old';
    
    return null;
  },

  // File validation
  file: (file, options = {}) => {
    const { required = false, maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options;
    
    if (!file) {
      if (required) return 'File is required';
      return null;
    }

    // Check file size (default 5MB)
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      const allowedExtensions = allowedTypes.map(type => type.split('/')[1]).join(', ');
      return `File type not allowed. Allowed types: ${allowedExtensions}`;
    }

    return null;
  },

  // Array validation
  array: (value, fieldName = 'Selection', minLength = 1) => {
    if (!value || !Array.isArray(value)) return `${fieldName} is required`;
    if (value.length < minLength) return `Please select at least ${minLength} ${fieldName.toLowerCase()}`;
    return null;
  },

  // Text validation for descriptions, etc.
  text: (value, fieldName = 'Text', minLength = 10, maxLength = 1000) => {
    const error = validators.required(value, fieldName);
    if (error) return error;
    
    const trimmedValue = value.trim();
    
    if (trimmedValue.length < minLength) return `${fieldName} must be at least ${minLength} characters long`;
    if (trimmedValue.length > maxLength) return `${fieldName} must be less than ${maxLength} characters`;
    
    // Basic sanity check for text content
    if (/[<>]/.test(trimmedValue)) {
      return `${fieldName} contains invalid characters`;
    }
    
    return null;
  }
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};

  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];
    
    if (Array.isArray(rules)) {
      for (const rule of rules) {
        const error = rule(value, formData);
        if (error) {
          // Ensure error is always a string
          errors[field] = typeof error === 'string' ? error : String(error);
          break;
        }
      }
    } else if (typeof rules === 'function') {
      const error = rules(value, formData);
      if (error) {
        // Ensure error is always a string
        errors[field] = typeof error === 'string' ? error : String(error);
      }
    } else if (typeof rules === 'object') {
      // Handle nested objects (like salaryRange: {min, max})
      Object.keys(rules).forEach(subField => {
        const subRules = rules[subField];
        const subValue = value ? value[subField] : undefined;
        
        if (Array.isArray(subRules)) {
          for (const rule of subRules) {
            const error = rule(subValue, formData);
            if (error) {
              // Ensure error is always a string
              errors[`${field}.${subField}`] = typeof error === 'string' ? error : String(error);
              break;
            }
          }
        }
      });
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Real-time input validation for form fields
export const validateInput = (value, rules, formData = {}) => {
  if (Array.isArray(rules)) {
    for (const rule of rules) {
      const error = rule(value, formData);
      if (error) return error;
    }
  } else if (typeof rules === 'function') {
    return rules(value, formData);
  }
  return null;
};

// Common validation schemas
export const validationSchemas = {
  login: {
    email: [
      (value) => validators.required(value, 'Email address'),
      validators.email
    ],
    password: [
      (value) => validators.required(value, 'Password')
    ]
  },

  register: {
    firstName: [validators.firstName],
    lastName: [validators.lastName],
    email: [
      (value) => {
        if (!value || value.toString().trim() === '') {
          return 'Email is required';
        }
        return null;
      },
      validators.email
    ],
    password: [
      (value) => validators.required(value, 'Password'),
      validators.password
    ],
    confirmPassword: [(value, formData) => validators.confirmPassword(value, formData.password)],
    role: [(value) => {
      if (!value || value.toString().trim() === '') {
        return 'Role is required';
      }
      return null;
    }]
  },

  studentRegister: {
    firstName: [validators.firstName],
    lastName: [validators.lastName],
    email: [validators.required, validators.email],
    password: [validators.required, validators.password],
    confirmPassword: [(value, formData) => validators.confirmPassword(value, formData.password)],
    dateOfBirth: [(value) => validators.date(value, 'Date of birth')],
    phone: [validators.phone],
    highSchool: [validators.required]
  },

  institutionRegister: {
    firstName: [validators.firstName],
    lastName: [validators.lastName],
    email: [validators.required, validators.email],
    password: [validators.required, validators.password],
    confirmPassword: [(value, formData) => validators.confirmPassword(value, formData.password)],
    institutionName: [(value) => validators.organizationName(value, 'Institution name')],
    institutionType: [validators.required],
    location: [validators.required],
    phone: [validators.phone],
    website: [validators.url]
  },

  companyRegister: {
    firstName: [validators.firstName],
    lastName: [validators.lastName],
    email: [validators.required, validators.email],
    password: [validators.required, validators.password],
    confirmPassword: [(value, formData) => validators.confirmPassword(value, formData.password)],
    companyName: [(value) => validators.organizationName(value, 'Company name')],
    industry: [validators.required],
    size: [validators.required],
    website: [validators.url],
    phone: [validators.phone]
  },

  studentProfile: {
    dateOfBirth: [(value) => validators.date(value, 'Date of birth')],
    phone: [validators.phone],
    highSchool: [validators.required],
    address: [(value) => validators.text(value, 'Address', 10, 200)]
  },

  institutionProfile: {
    institutionName: [(value) => validators.organizationName(value, 'Institution name')],
    institutionType: [validators.required],
    location: [validators.required],
    phone: [validators.phone],
    website: [validators.url],
    description: [(value) => validators.text(value, 'Description', 20, 500)]
  },

  companyProfile: {
    companyName: [(value) => validators.organizationName(value, 'Company name')],
    industry: [validators.required],
    size: [validators.required],
    website: [validators.url],
    description: [(value) => validators.text(value, 'Description', 20, 500)],
    phone: [validators.phone]
  },

  jobPost: {
    title: [validators.required],
    department: [validators.required],
    type: [validators.required],
    location: [validators.required],
    description: [(value) => validators.text(value, 'Description', 20, 1000)],
    requirements: [(value) => validators.array(value, 'Requirements')],
    qualifications: [(value) => validators.array(value, 'Qualifications')],
    salaryRange: {
      min: [(value) => validators.positiveNumber(value, 'Minimum salary')],
      max: [(value) => validators.positiveNumber(value, 'Maximum salary')]
    },
    applicationDeadline: [(value) => validators.required(value, 'Application deadline')]
  },

  courseApplication: {
    institutionId: [validators.required],
    facultyId: [validators.required],
    courseId: [validators.required]
  }
};