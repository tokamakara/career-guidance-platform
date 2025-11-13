import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../firebase';
import { API_URL } from '../../utils/apiConfig';

// Helper function to add timeout to fetch
const fetchWithTimeout = (url, options, timeout = 30000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout. Please check your connection and try again.')), timeout)
    )
  ]);
};

export const authService = {
  async register(userData) {
    try {
      console.log('📤 Sending registration request to:', `${API_URL}/auth/register`);
      console.log('📝 Registration data:', { ...userData, password: '***' });
      
      const response = await fetchWithTimeout(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      }, 30000); // 30 second timeout

      console.log('📥 Registration response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Registration response data:', data);
      
      if (!response.ok) {
        // Extract error message from response
        const errorMessage = data.message || data.error || 'Registration failed';
        console.error('❌ Registration failed:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('✅ Registration successful');
      return data;
    } catch (error) {
      console.error('💥 Registration error:', error);
      
      // Handle network errors
      if (error.message.includes('timeout') || error.message.includes('Failed to fetch')) {
        throw new Error('Connection timeout. Please check if the server is running and try again.');
      }
      
      // If error already has a message, use it; otherwise create a user-friendly message
      if (error.message) {
        throw error;
      }
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  },

  async login(email, password) {
    try {
      // First verify password with Firebase Auth (this ensures password is correct)
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get ID token for backend authentication
      const idToken = await userCredential.user.getIdToken();
      
      // Now call backend to get user profile and custom token
      const response = await fetchWithTimeout(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ email, password }),
      }, 30000); // 30 second timeout

      const data = await response.json();
      
      if (!response.ok) {
        // If backend fails, sign out from Firebase
        await auth.signOut();
        throw new Error(data.message || 'Login failed');
      }

      // Store additional user data
      localStorage.setItem('authToken', idToken);
      localStorage.setItem('userProfile', JSON.stringify(data.data.user));

      return {
        ...data,
        user: userCredential.user
      };
    } catch (error) {
      // Handle Firebase Auth errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password.');
      }
      
      // Handle network errors
      if (error.message.includes('timeout') || error.message.includes('Failed to fetch')) {
        throw new Error('Connection timeout. Please check if the server is running and try again.');
      }
      
      throw new Error(error.message || 'Login failed');
    }
  },

  async logout() {
    try {
      await auth.signOut();
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');
      return { success: true };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async resetPassword(email) {
    try {
      const response = await fetchWithTimeout(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }, 30000);

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      return data;
    } catch (error) {
      if (error.message.includes('timeout') || error.message.includes('Failed to fetch')) {
        throw new Error('Connection timeout. Please check if the server is running and try again.');
      }
      throw new Error(error.message);
    }
  },

  async verifyEmail(token) {
    try {
      const response = await fetchWithTimeout(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      }, 30000);

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Email verification failed');
      }

      return data;
    } catch (error) {
      if (error.message.includes('timeout') || error.message.includes('Failed to fetch')) {
        throw new Error('Connection timeout. Please check if the server is running and try again.');
      }
      throw new Error(error.message);
    }
  }
};

export default authService;