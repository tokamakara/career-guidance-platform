import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile as updateAuthProfile,
  onAuthStateChanged,
  getIdToken,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './index';

export const authService = {
  // Register new user with role-specific data
  async register(userData) {
    try {
      const { email, password, firstName, lastName, role, ...roleData } = userData;
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update auth profile with display name
      await updateAuthProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // Send email verification
      await sendEmailVerification(user);

      // Create user profile in Firestore
      const userProfile = {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: false
      };

      // Add role-specific data
      switch (role) {
        case 'student':
          userProfile.stage = 'highschool';
          userProfile.educationApplications = [];
          userProfile.jobApplications = [];
          userProfile.documents = {};
          if (roleData.dateOfBirth) userProfile.dateOfBirth = roleData.dateOfBirth;
          if (roleData.phone) userProfile.phone = roleData.phone;
          if (roleData.highSchool) userProfile.highSchool = roleData.highSchool;
          break;

        case 'institute':
          userProfile.institutionName = roleData.institutionName;
          userProfile.institutionType = roleData.institutionType;
          userProfile.location = roleData.location;
          userProfile.contactPerson = `${firstName} ${lastName}`;
          userProfile.phone = roleData.phone;
          userProfile.website = roleData.website;
          userProfile.description = roleData.description;
          userProfile.status = 'pending'; // Needs admin approval
          break;

        case 'company':
          userProfile.companyName = roleData.companyName;
          userProfile.industry = roleData.industry;
          userProfile.size = roleData.size;
          userProfile.website = roleData.website;
          userProfile.description = roleData.description;
          userProfile.contactPerson = `${firstName} ${lastName}`;
          userProfile.phone = roleData.phone;
          userProfile.status = 'pending'; // Needs admin approval
          break;

        case 'admin':
          // Admin users are typically created manually
          userProfile.status = 'active';
          break;
      }

      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), userProfile);

      // Get and store Firebase ID token for API authentication
      const idToken = await getIdToken(user);
      localStorage.setItem('authToken', idToken);

      // If institution or company, also create in their respective collections
      if (role === 'institute') {
        const institutionData = {
          id: user.uid,
          name: roleData.institutionName,
          type: roleData.institutionType,
          location: roleData.location,
          description: roleData.description,
          website: roleData.website,
          contactEmail: email,
          phone: roleData.phone,
          status: 'pending',
          createdAt: new Date(),
          adminId: user.uid
        };
        await setDoc(doc(db, 'institutions', user.uid), institutionData);
      }

      if (role === 'company') {
        const companyData = {
          id: user.uid,
          name: roleData.companyName,
          industry: roleData.industry,
          size: roleData.size,
          location: roleData.location,
          website: roleData.website,
          description: roleData.description,
          contactEmail: email,
          phone: roleData.phone,
          status: 'pending',
          createdAt: new Date(),
          adminId: user.uid
        };
        await setDoc(doc(db, 'companies', user.uid), companyData);
      }

      return { 
        success: true, 
        user,
        message: 'Registration successful! Please check your email for verification.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(this.getFriendlyErrorMessage(error.code));
    }
  },

  // Login user
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user profile to check status
      const userProfile = await this.getUserProfile(user.uid);
      
      if (userProfile.status === 'pending') {
        await signOut(auth);
        throw new Error('Your account is pending approval. Please wait for admin approval.');
      }
      
      if (userProfile.status === 'suspended') {
        await signOut(auth);
        throw new Error('Your account has been suspended. Please contact admin.');
      }

      // Get and store Firebase ID token for API authentication
      const idToken = await getIdToken(user);
      localStorage.setItem('authToken', idToken);

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(this.getFriendlyErrorMessage(error.code));
    }
  },

  // Login with Google
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Get user profile to check if it exists
      let userProfile = await this.getUserProfile(user.uid).catch(() => null);
      
      // If user doesn't exist, create a basic profile
      if (!userProfile) {
        const displayName = user.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        userProfile = {
          uid: user.uid,
          email: user.email,
          firstName,
          lastName,
          role: 'student', // Default role for Google sign-in
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: user.emailVerified
        };
        
        // Save to Firestore
        await setDoc(doc(db, 'users', user.uid), userProfile);
      }
      
      // Check status
      if (userProfile.status === 'pending') {
        await signOut(auth);
        throw new Error('Your account is pending approval. Please wait for admin approval.');
      }
      
      if (userProfile.status === 'suspended') {
        await signOut(auth);
        throw new Error('Your account has been suspended. Please contact admin.');
      }

      // Get and store Firebase ID token for API authentication
      const idToken = await getIdToken(user);
      localStorage.setItem('authToken', idToken);

      return { success: true, user };
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error(this.getFriendlyErrorMessage(error.code));
    }
  },

  // Logout user
  async logout() {
    try {
      await signOut(auth);
      // Clear stored token
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error(this.getFriendlyErrorMessage(error.code));
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { 
        success: true, 
        message: 'Password reset email sent! Check your inbox.' 
      };
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error(this.getFriendlyErrorMessage(error.code));
    }
  },

  // Get user profile from Firestore
  async getUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      throw new Error('User profile not found');
    } catch (error) {
      console.error('Get profile error:', error);
      throw new Error('Failed to load user profile');
    }
  },

  // Update user profile
  async updateUserProfile(uid, updates) {
    try {
      updates.updatedAt = new Date();
      await setDoc(doc(db, 'users', uid), updates, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
    }
  },

  // Check if email exists
  async checkEmailExists(email) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Check email error:', error);
      return false;
    }
  },

  // Auth state listener
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // Helper function for friendly error messages
  getFriendlyErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered. Please use a different email or login.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/user-not-found': 'User does not exist. Please register to create an account.',
      'auth/wrong-password': 'Wrong password. Please try again or reset your password.',
      'auth/invalid-credential': 'Wrong password or user does not exist. Please check your credentials or register.',
      'auth/invalid-login-credentials': 'Wrong password or user does not exist. Please check your credentials or register.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection and try again.'
    };

    // For newer Firebase versions, invalid-credential can mean either wrong password or user not found
    // We'll provide a combined message
    if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/invalid-login-credentials') {
      return 'Wrong password or user does not exist. Please check your credentials or register.';
    }

    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }
};