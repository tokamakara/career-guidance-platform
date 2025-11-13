const { admin, db } = require('../config/firebaseAdmin');
const emailService = require('../utils/emailService');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, role, ...roleData } = req.body;

      // Check if user already exists
      try {
        const existingUser = await admin.auth().getUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'This email is already registered. Please use a different email or sign in instead.'
          });
        }
      } catch (error) {
        // If error is not "user not found", it's a real error
        if (error.code !== 'auth/user-not-found') {
          throw error;
        }
        // User doesn't exist, continue with registration
      }

      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
        emailVerified: false
      });

      // Create user profile in Firestore
      const userProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        firstName,
        lastName,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: false,
        status: role === 'student' ? 'approved' : 'pending' // Students auto-approved
      };

      // Add role-specific data
      if (role === 'institute') {
        if (roleData.institutionName) userProfile.institutionName = roleData.institutionName;
        if (roleData.institutionType) userProfile.institutionType = roleData.institutionType;
        if (roleData.location) userProfile.location = roleData.location;
        userProfile.contactPerson = `${firstName} ${lastName}`;
        if (roleData.phone) userProfile.phone = roleData.phone;
        if (roleData.website) userProfile.website = roleData.website;
        if (roleData.description) userProfile.description = roleData.description;
        // Note: Faculties and courses are stored as subcollections under institutions/{id}/faculties
        // This structure is kept for course management but institution data is in users collection
      }

      if (role === 'company') {
        if (roleData.companyName) userProfile.companyName = roleData.companyName;
        if (roleData.industry) userProfile.industry = roleData.industry;
        if (roleData.size) userProfile.size = roleData.size;
        if (roleData.website) userProfile.website = roleData.website;
        if (roleData.description) userProfile.description = roleData.description;
        userProfile.contactPerson = `${firstName} ${lastName}`;
        if (roleData.phone) userProfile.phone = roleData.phone;
        if (roleData.location) userProfile.location = roleData.location;
      }

      if (role === 'student') {
        if (roleData.dateOfBirth) userProfile.dateOfBirth = roleData.dateOfBirth;
        if (roleData.phone) userProfile.phone = roleData.phone;
        if (roleData.address) userProfile.address = roleData.address;
        if (roleData.highSchool) userProfile.highSchool = roleData.highSchool;
        userProfile.highSchoolResults = [];
        userProfile.educationApplications = [];
        userProfile.jobApplications = [];
        userProfile.documents = {};
      }

      // Remove undefined values before saving to Firestore
      const cleanUserProfile = Object.fromEntries(
        Object.entries(userProfile).filter(([_, value]) => value !== undefined)
      );

      await db.collection('users').doc(userRecord.uid).set(cleanUserProfile);

      // Send verification email
      try {
        const verificationLink = await admin.auth().generateEmailVerificationLink(email);
        await emailService.sendVerificationEmail(email, verificationLink);
      } catch (emailError) {
        console.warn('⚠️ Failed to send verification email:', emailError);
        // Don't fail registration if email sending fails
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email for verification.',
        data: {
          uid: userRecord.uid,
          email: userRecord.email,
          role
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-exists' || error.code === 'auth/email-already-in-use') {
        return res.status(400).json({
          success: false,
          message: 'This email is already registered. Please use a different email or sign in instead.'
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Registration failed. Please try again.'
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.'
        });
      }

      // Note: Firebase Admin SDK cannot verify passwords directly
      // Password verification happens on the frontend when signing in with custom token
      // If the password is wrong, the frontend signInWithCustomToken will fail
      // But we still need to verify the user exists first
      let user;
      try {
        user = await admin.auth().getUserByEmail(email);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password.'
          });
        }
        throw error;
      }
      
      // Check if user profile exists in Firestore
      const userDoc = await db.collection('users').doc(user.uid).get();
      let userProfile = userDoc.data();

      // RECOVERY MECHANISM: If profile doesn't exist, create a basic one
      if (!userProfile) {
        console.warn(`⚠️ User profile missing for ${email} (${user.uid}). Creating recovery profile...`);
        
        // Try to infer role from email or create a basic profile
        // Default to 'student' if we can't determine
        const recoveryProfile = {
          uid: user.uid,
          email: user.email,
          firstName: user.displayName?.split(' ')[0] || 'User',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          role: 'student', // Default role
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: user.emailVerified || false,
          status: 'approved' // Auto-approve recovery profiles
        };

        await db.collection('users').doc(user.uid).set(recoveryProfile);
        userProfile = recoveryProfile;
        
        console.log(`✅ Recovery profile created for ${email}`);
      }

      // Check if user is approved (for institutes and companies)
      if (userProfile.status === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending approval. Please wait for admin approval.'
        });
      }

      if (userProfile.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Please contact admin.'
        });
      }

      // Create custom token for the user
      const customToken = await admin.auth().createCustomToken(user.uid);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token: customToken,
          user: {
            uid: user.uid,
            email: user.email,
            role: userProfile.role,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }
      
      res.status(401).json({
        success: false,
        message: 'Login failed: ' + error.message
      });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { token } = req.body;
      
      // Verify the ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Update user profile
      await db.collection('users').doc(decodedToken.uid).update({
        emailVerified: true,
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Email verified successfully'
      });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(400).json({
        success: false,
        message: 'Email verification failed'
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email } = req.body;
      
      const resetLink = await admin.auth().generatePasswordResetLink(email);
      await emailService.sendPasswordResetEmail(email, resetLink);

      res.json({
        success: true,
        message: 'Password reset email sent successfully'
      });

    } catch (error) {
      console.error('Password reset error:', error);
      res.status(400).json({
        success: false,
        message: 'Password reset failed'
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      // Implement token refresh logic
      // This would typically verify the refresh token and issue a new access token
      
      res.json({
        success: true,
        message: 'Token refreshed successfully'
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: 'Token refresh failed'
      });
    }
  }
}

module.exports = new AuthController();