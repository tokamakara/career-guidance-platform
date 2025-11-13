/**
 * API Configuration Utility
 * Automatically detects environment and uses appropriate API URL
 */

const getApiUrl = () => {
  // Get current hostname and port FIRST (before checking env vars)
  const hostname = window.location.hostname.toLowerCase();
  const port = window.location.port;
  const origin = window.location.origin;
  
  // PRIORITY 1: Check if we're running on localhost (ALWAYS use local API if on localhost)
  const isLocalhost = hostname === 'localhost' || 
                      hostname === '127.0.0.1' ||
                      hostname === '' ||
                      hostname === '0.0.0.0' ||
                      origin.includes('localhost') ||
                      origin.includes('127.0.0.1');

  // PRIORITY 2: Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  // PRIORITY 3: Check if port is 3000 (React dev server default)
  const isDevPort = port === '3000' || port === '';

  console.log('🔍 Environment detection:', {
    hostname,
    port,
    origin,
    isLocalhost,
    NODE_ENV: process.env.NODE_ENV,
    isDevelopment,
    isDevPort,
    hasEnvVar: !!process.env.REACT_APP_API_URL
  });

  // DECISION: ALWAYS use localhost API if running on localhost (ignore REACT_APP_API_URL)
  if (isLocalhost || isDevelopment || isDevPort) {
    const localApiUrl = 'http://localhost:5000/api';
    console.log('✅ LOCAL MODE - Using local API:', localApiUrl);
    if (process.env.REACT_APP_API_URL) {
      console.warn('⚠️ REACT_APP_API_URL is set but ignored because running on localhost');
    }
    return localApiUrl;
  }

  // If NOT on localhost, check for explicit REACT_APP_API_URL
  if (process.env.REACT_APP_API_URL) {
    console.log('🌐 Using explicit REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }

  // Default to production URL (only if clearly not local and no env var)
  const prodApiUrl = 'https://career-guidance-backend-70ny.onrender.com/api';
  console.log('✅ PRODUCTION MODE - Using production API:', prodApiUrl);
  return prodApiUrl;
};

export const API_URL = getApiUrl();

// Always log the API URL being used
console.log('🌐 API URL:', API_URL);

export default API_URL;

