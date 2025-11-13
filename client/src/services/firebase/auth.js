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
    let user = null;
    try {
      const { email, password, firstName, lastName, role, ...roleData } = userData;
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user = userCredential.user;

      // Update auth profile with display name
      await updateAuthProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // Send email verification
      try {
        await sendEmailVerification(user);
        console.log('✅ Email verification sent');
      } catch (verifyError) {
        console.warn('⚠️ Failed to send verification email:', verifyError);
        // Don't fail registration if email verification fails
      }

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
          if (roleData.location && roleData.location.trim() !== '') {
            userProfile.location = roleData.location;
          }
          userProfile.contactPerson = `${firstName} ${lastName}`;
          userProfile.phone = roleData.phone;
          if (roleData.website && roleData.website.trim() !== '') {
            userProfile.website = roleData.website;
          }
          if (roleData.description && roleData.description.trim() !== '') {
            userProfile.description = roleData.description;
          }
          userProfile.status = 'pending'; // Needs admin approval
          break;

        case 'company':
          userProfile.companyName = roleData.companyName;
          userProfile.industry = roleData.industry;
          // Size is required for companies - validate it exists
          if (!roleData.size || roleData.size.trim() === '') {
            throw new Error('Company size is required');
          }
          userProfile.size = roleData.size;
          if (roleData.website && roleData.website.trim() !== '') {
            userProfile.website = roleData.website;
          }
          if (roleData.description && roleData.description.trim() !== '') {
            userProfile.description = roleData.description;
          }
          userProfile.contactPerson = `${firstName} ${lastName}`;
          userProfile.phone = roleData.phone;
          userProfile.status = 'pending'; // Needs admin approval
          break;

        case 'admin':
          // Admin users are typically created manually
          userProfile.status = 'active';
          break;
      }

      // Remove undefined values from userProfile before saving to Firestore
      const cleanUserProfile = Object.fromEntries(
        Object.entries(userProfile).filter(([_, value]) => value !== undefined)
      );
      
      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), cleanUserProfile);

      // Get and store Firebase ID token for API authentication
      const idToken = await getIdToken(user);
      localStorage.setItem('authToken', idToken);

      // If institution or company, also create in their respective collections
      if (role === 'institute') {
        try {
          const institutionData = {
            id: user.uid,
            name: roleData.institutionName,
            type: roleData.institutionType,
            location: roleData.location || '',
            description: roleData.description || '',
            website: roleData.website || '',
            contactEmail: email,
            phone: roleData.phone || '',
            status: 'pending',
            createdAt: new Date(),
            adminId: user.uid
          };
          
          // Remove undefined values
          const cleanInstitutionData = Object.fromEntries(
            Object.entries(institutionData).filter(([_, value]) => value !== undefined)
          );
          
          console.log('📝 Creating institution record:', cleanInstitutionData);
          await setDoc(doc(db, 'institutions', user.uid), cleanInstitutionData);
          console.log('✅ Institution record created successfully in institutions collection');
        } catch (institutionError) {
          console.error('❌ Failed to create institution record:', institutionError);
          console.error('Error code:', institutionError.code);
          console.error('Error message:', institutionError.message);
          // Don't fail the entire registration if institution creation fails
          // The user profile is already created, so they can still login
          // But log the error for debugging
          throw new Error(`Registration completed but institution record creation failed: ${institutionError.message || institutionError.code}. Please contact support.`);
        }
      }

      if (role === 'company') {
        try {
          const companyData = {
            id: user.uid,
            name: roleData.companyName,
            industry: roleData.industry,
            size: roleData.size, // Size is required, already validated above
            contactEmail: email,
            phone: roleData.phone || '',
            status: 'pending',
            createdAt: new Date(),
            adminId: user.uid
          };
          if (roleData.location && roleData.location.trim() !== '') {
            companyData.location = roleData.location;
          }
          if (roleData.website && roleData.website.trim() !== '') {
            companyData.website = roleData.website;
          }
          if (roleData.description && roleData.description.trim() !== '') {
            companyData.description = roleData.description;
          }
          
          // Remove undefined values
          const cleanCompanyData = Object.fromEntries(
            Object.entries(companyData).filter(([_, value]) => value !== undefined)
          );
          
          console.log('📝 Creating company record:', cleanCompanyData);
          await setDoc(doc(db, 'companies', user.uid), cleanCompanyData);
          console.log('✅ Company record created successfully in companies collection');
        } catch (companyError) {
          console.error('❌ Failed to create company record:', companyError);
          console.error('Error code:', companyError.code);
          console.error('Error message:', companyError.message);
          throw new Error(`Registration completed but company record creation failed: ${companyError.message || companyError.code}. Please contact support.`);
        }
      }

      return { 
        success: true, 
        user,
        message: 'Registration successful! Please check your email for verification.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      // If user was created in Auth but Firestore failed, try to clean up
      if (user && error.code !== 'auth/email-already-in-use') {
        try {
          // Check if profile exists
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (!userDoc.exists()) {
            // Profile doesn't exist, so Auth user was created but Firestore failed
            // Delete the Auth user to clean up
            console.log('🧹 Cleaning up partial registration...');
            await signOut(auth);
            // Note: We can't delete the user from client-side, but we can sign them out
            // The user will need to try again
          }
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      }
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check your account status.');
      } else if (error.message && error.message.includes('Unsupported field value: undefined')) {
        throw new Error('Registration failed: Some required fields are missing. Please fill in all required fields (Company Size is required for companies).');
      } else if (error.message && error.message.includes('undefined')) {
        throw new Error('Registration failed: Some required fields are missing. Please fill in all required fields.');
      } else if (error.code) {
        throw new Error(this.getFriendlyErrorMessage(error.code));
      } else {
        throw new Error(error.message || 'An unexpected error occurred. Please try again.');
      }
    }
  },

  // Login user
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check email verification first
      if (!user.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
      }
      
      // Get user profile to check status
      const userProfile = await this.getUserProfile(user.uid);
      
      // Allow pending users to login - they'll see a message on dashboard
      // Only block suspended users
      if (userProfile.status === 'suspended') {
        await signOut(auth);
        throw new Error('Your account has been suspended. Please contact admin.');
      }

      // Get and store Firebase ID token for API authentication
      const idToken = await getIdToken(user);
      localStorage.setItem('authToken', idToken);

      return { success: true, user, userProfile };
    } catch (error) {
      console.error('Login error:', error);
      // If error message already contains user-friendly message, use it
      if (error.message && !error.message.includes('auth/')) {
        throw error;
      }
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
      
      // Allow pending users to login - they'll see a message on dashboard
      // Only block suspended users
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
      // Profile doesn't exist - this might be a partial registration
      console.warn('⚠️ User profile not found for uid:', uid);
      throw new Error('User profile not found. Please complete your registration.');
    } catch (error) {
      console.error('Get profile error:', error);
      // Re-throw with original message if it's already a user-friendly message
      if (error.message.includes('User profile not found')) {
        throw error;
      }
      throw new Error('Failed to load user profile');
    }
  },

  // Resend email verification
  async resendEmailVerification(user = null) {
    try {
      const userToVerify = user || auth.currentUser;
      if (!userToVerify) {
        throw new Error('No user is currently signed in. Please sign in first to resend verification email.');
      }
      
      // Reload user to get latest emailVerified status
      await userToVerify.reload();
      
      // Check if email is already verified
      if (userToVerify.emailVerified) {
        throw new Error('Email is already verified. You can now log in.');
      }
      
      // Send verification email with action code settings
      const actionCodeSettings = {
        url: `${window.location.origin}/login?emailVerified=true`,
        handleCodeInApp: false
      };
      
      console.log('📧 Sending verification email to:', userToVerify.email);
      await sendEmailVerification(userToVerify, actionCodeSettings);
      
      console.log('✅ Email verification sent successfully');
      return {
        success: true,
        message: 'Verification email sent! Please check your inbox (and spam folder). The verification link will expire in 1 hour.'
      };
    } catch (error) {
      console.error('❌ Resend verification error:', error);
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many verification emails sent. Please wait a few minutes before requesting another.');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('User not found. Please make sure you are signed in.');
      } else if (error.message) {
        throw error;
      }
      throw new Error(this.getFriendlyErrorMessage(error.code) || 'Failed to send verification email. Please try again later.');
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
      'auth/invalid-login-credentials': 'Invalid email or password. Please check your credentials and try again.',
      'auth/wrong-password': 'Invalid email or password. Please check your credentials and try again.',
      'auth/user-not-found': 'Invalid email or password. Please check your credentials and try again.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection and try again.'
    };

    // For newer Firebase versions, invalid-credential can mean either wrong password or user not found
    // We'll provide a combined message
    if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/invalid-login-credentials' || 
        errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
      return 'Invalid email or password. Please check your credentials and try again.';
    }

    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }
};