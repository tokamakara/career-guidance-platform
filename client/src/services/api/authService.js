import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../firebase';
import { API_URL } from '../../utils/apiConfig';

export const authService = {
  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      throw new Error(error.message);
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
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ email, password }),
      });

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
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async verifyEmail(token) {
    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Email verification failed');
      }

      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

export default authService;