// Data formatting utilities

/**
 * Format date to localized string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Format date with time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format file size to human readable string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount, currency = 'LSL') => {
  if (amount === null || amount === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-LS', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) return 'N/A';
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return 'N/A';
  
  // Lesotho phone number format: +266 XX XXX XXXX
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.length === 8) {
    return `+266 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}`;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('266')) {
    return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
  }
  
  return phoneNumber;
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

/**
 * Format application status for display
 */
export const formatApplicationStatus = (status) => {
  const statusMap = {
    'pending': 'Pending',
    'under_review': 'Under Review',
    'shortlisted': 'Shortlisted',
    'rejected': 'Rejected',
    'accepted': 'Accepted',
    'admitted': 'Admitted',
    'waitlisted': 'Waitlisted',
    'withdrawn': 'Withdrawn'
  };
  
  return statusMap[status] || capitalizeWords(status);
};

/**
 * Format user role for display
 */
export const formatUserRole = (role) => {
  const roleMap = {
    'student': 'Student',
    'institute': 'Institution',
    'company': 'Company',
    'admin': 'Administrator'
  };
  
  return roleMap[role] || capitalizeWords(role);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substr(0, maxLength) + '...';
};

/**
 * Format duration (e.g., "2 years 6 months")
 */
export const formatDuration = (months) => {
  if (!months || months === 0) return 'Not specified';
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  const parts = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (remainingMonths > 0) parts.push(`${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`);
  
  return parts.join(' ');
};

/**
 * Format grade for display
 */
export const formatGrade = (grade) => {
  const gradeMap = {
    'A*': 'A* (90-100%)',
    'A': 'A (80-89%)',
    'B': 'B (70-79%)',
    'C': 'C (60-69%)',
    'D': 'D (50-59%)',
    'E': 'E (40-49%)',
    'F': 'F (30-39%)',
    'G': 'G (0-29%)'
  };
  
  return gradeMap[grade] || grade;
};

/**
 * Format match score with color class
 */
export const formatMatchScore = (score) => {
  if (score >= 90) return { text: 'Excellent Match', class: 'excellent' };
  if (score >= 80) return { text: 'Great Match', class: 'great' };
  if (score >= 70) return { text: 'Good Match', class: 'good' };
  if (score >= 60) return { text: 'Fair Match', class: 'fair' };
  return { text: 'Poor Match', class: 'poor' };
};

/**
 * Format number with commas
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return formatDate(dateString);
};

/**
 * Format array to comma-separated string
 */
export const formatList = (array, maxItems = null) => {
  if (!array || !Array.isArray(array)) return '';
  
  if (maxItems && array.length > maxItems) {
    return array.slice(0, maxItems).join(', ') + `, +${array.length - maxItems} more`;
  }
  
  return array.join(', ');
};

/**
 * Format course requirements for display
 */
export const formatCourseRequirements = (requirements) => {
  if (!requirements || typeof requirements !== 'object') return 'No specific requirements';
  
  return Object.entries(requirements)
    .map(([subject, grade]) => `${subject}: ${grade}`)
    .join(', ');
};

export default {
  formatDate,
  formatDateTime,
  formatFileSize,
  formatCurrency,
  formatPercentage,
  formatPhoneNumber,
  capitalizeWords,
  formatApplicationStatus,
  formatUserRole,
  truncateText,
  formatDuration,
  formatGrade,
  formatMatchScore,
  formatNumber,
  formatRelativeTime,
  formatList,
  formatCourseRequirements
};