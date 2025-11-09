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

// Enhanced name validation
name: (value, fieldName = 'Name') => {
  const error = validators.required(value, fieldName);
  if (error) return error;
  
  if (value.length < 2) return `${fieldName} must be at least 2 characters long`;
  if (value.length > 50) return `${fieldName} must be less than 50 characters`;
  
  // Enhanced regex: only letters, spaces, hyphens, apostrophes - no numbers or special characters
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  if (!nameRegex.test(value)) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  }
  
  // Check for consecutive special characters
  if (/(\-\-)|(\'\')|(\s\s)/.test(value)) {
    return `${fieldName} cannot have consecutive special characters`;
  }
  
  // Check if starts/ends with special character
  if (/^[\-\'\s]|[\-\'\s]$/.test(value)) {
    return `${fieldName} cannot start or end with special characters`;
  }
  
  return null;
},

  // Phone number validation
  phone: (value) => {
    if (!value) return null; // Phone is optional
    
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return null;
  },

  // URL validation
  url: (value) => {
    if (!value) return null; // URL is optional
    
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  // Number validation
  number: (value, fieldName = 'Number') => {
    if (!value) return `${fieldName} is required`;
    
    const num = Number(value);
    if (isNaN(num)) return `${fieldName} must be a valid number`;
    
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
          errors[field] = error;
          break;
        }
      }
    } else if (typeof rules === 'function') {
      const error = rules(value, formData);
      if (error) {
        errors[field] = error;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Common validation schemas
export const validationSchemas = {
  login: {
    email: [validators.required, validators.email],
    password: [validators.required]
  },

  register: {
    firstName: [(value) => validators.name(value, 'First name')],
    lastName: [(value) => validators.name(value, 'Last name')],
    email: [validators.required, validators.email],
    password: [validators.required, validators.password],
    confirmPassword: [(value, formData) => validators.confirmPassword(value, formData.password)],
    role: [validators.required]
  },

  studentProfile: {
    dateOfBirth: [(value) => validators.date(value, 'Date of birth')],
    phone: [validators.phone],
    highSchool: [validators.required],
    address: [validators.required]
  },

  institutionProfile: {
    institutionName: [validators.required],
    institutionType: [validators.required],
    location: [validators.required],
    phone: [validators.required, validators.phone],
    website: [validators.url],
    description: [validators.required]
  },

  companyProfile: {
    companyName: [validators.required],
    industry: [validators.required],
    size: [validators.required],
    website: [validators.url],
    description: [validators.required],
    phone: [validators.required, validators.phone]
  },

  jobPost: {
    title: [validators.required],
    department: [validators.required],
    type: [validators.required],
    location: [validators.required],
    description: [validators.required],
    requirements: [(value) => validators.array(value, 'Requirements')],
    qualifications: [(value) => validators.array(value, 'Qualifications')],
    salaryRange: {
      min: [(value) => validators.positiveNumber(value, 'Minimum salary')],
      max: [(value) => validators.positiveNumber(value, 'Maximum salary')]
    },
    applicationDeadline: [(value) => validators.required(value, 'Application deadline')]
  }
};