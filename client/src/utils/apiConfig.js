/**
 * API Configuration Utility
 * Automatically detects environment and uses appropriate API URL
 */

const getApiUrl = () => {
  // Get current hostname and origin
  const hostname = window.location.hostname.toLowerCase();
  const port = window.location.port;
  const origin = window.location.origin;
  const protocol = window.location.protocol;
  
  // PRIORITY 1: Check if we're running on localhost (EXACT match only)
  const isLocalhost = hostname === 'localhost' || 
                      hostname === '127.0.0.1' ||
                      hostname === '0.0.0.0';

  // PRIORITY 2: Check if we're on a production domain (Render.com, etc.)
  const isProductionDomain = hostname.includes('render.com') ||
                             hostname.includes('netlify.app') ||
                             hostname.includes('vercel.app') ||
                             hostname.includes('github.io') ||
                             hostname.includes('herokuapp.com') ||
                             (protocol === 'https:' && !isLocalhost);

  // PRIORITY 3: Check if we're in development mode (only if actually on localhost)
  const isDevelopment = process.env.NODE_ENV === 'development' && isLocalhost;

  // PRIORITY 4: Check if port is 3000 AND we're on localhost (React dev server)
  const isDevPort = (port === '3000' || port === '') && isLocalhost;

  console.log('🔍 Environment detection:', {
    hostname,
    port,
    origin,
    protocol,
    isLocalhost,
    isProductionDomain,
    NODE_ENV: process.env.NODE_ENV,
    isDevelopment,
    isDevPort,
    hasEnvVar: !!process.env.REACT_APP_API_URL
  });

  // DECISION: Use localhost API ONLY if actually on localhost
  if (isLocalhost && (isDevelopment || isDevPort || port === '3000')) {
    const localApiUrl = 'http://localhost:5000/api';
    console.log('✅ LOCAL MODE - Using local API:', localApiUrl);
    if (process.env.REACT_APP_API_URL) {
      console.warn('⚠️ REACT_APP_API_URL is set but ignored because running on localhost');
    }
    return localApiUrl;
  }

  // If on production domain or HTTPS, use production API
  if (isProductionDomain || protocol === 'https:') {
    // Check for explicit REACT_APP_API_URL first
    if (process.env.REACT_APP_API_URL) {
      console.log('🌐 Using explicit REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
      return process.env.REACT_APP_API_URL;
    }

    // Default to production URL
    const prodApiUrl = 'https://career-guidance-backend-70ny.onrender.com/api';
    console.log('✅ PRODUCTION MODE - Using production API:', prodApiUrl);
    return prodApiUrl;
  }

  // Fallback: If NOT on localhost and no production domain detected, check env var
  if (process.env.REACT_APP_API_URL) {
    console.log('🌐 Using explicit REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }

  // Last resort: Default to production URL
  const prodApiUrl = 'https://career-guidance-backend-70ny.onrender.com/api';
  console.log('✅ PRODUCTION MODE (fallback) - Using production API:', prodApiUrl);
  return prodApiUrl;
};

export const API_URL = getApiUrl();

// Always log the API URL being used
console.log('🌐 API URL:', API_URL);

export default API_URL;

