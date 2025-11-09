const { admin, db } = require('../config/firebaseAdmin');
const emailService = require('../utils/emailService');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, role, ...roleData } = req.body;

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
        userProfile.institutionName = roleData.institutionName;
        userProfile.institutionType = roleData.institutionType;
        userProfile.location = roleData.location;
        userProfile.contactPerson = `${firstName} ${lastName}`;
        userProfile.phone = roleData.phone;
        userProfile.website = roleData.website;
        userProfile.description = roleData.description;
        
        // Create institution record
        const institutionData = {
          id: userRecord.uid,
          name: roleData.institutionName,
          type: roleData.institutionType,
          location: roleData.location,
          description: roleData.description,
          website: roleData.website,
          contactEmail: email,
          phone: roleData.phone,
          status: 'pending',
          createdAt: new Date(),
          adminId: userRecord.uid
        };
        await db.collection('institutions').doc(userRecord.uid).set(institutionData);
      }

      if (role === 'company') {
        userProfile.companyName = roleData.companyName;
        userProfile.industry = roleData.industry;
        userProfile.size = roleData.size;
        userProfile.website = roleData.website;
        userProfile.description = roleData.description;
        userProfile.contactPerson = `${firstName} ${lastName}`;
        userProfile.phone = roleData.phone;
        
        // Create company record
        const companyData = {
          id: userRecord.uid,
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
          adminId: userRecord.uid
        };
        await db.collection('companies').doc(userRecord.uid).set(companyData);
      }

      if (role === 'student') {
        userProfile.dateOfBirth = roleData.dateOfBirth;
        userProfile.phone = roleData.phone;
        userProfile.address = roleData.address;
        userProfile.highSchool = roleData.highSchool;
        userProfile.highSchoolResults = [];
        userProfile.educationApplications = [];
        userProfile.jobApplications = [];
        userProfile.documents = {};
      }

      await db.collection('users').doc(userRecord.uid).set(userProfile);

      // Send verification email
      const verificationLink = await admin.auth().generateEmailVerificationLink(email);
      await emailService.sendVerificationEmail(email, verificationLink);

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
      res.status(500).json({
        success: false,
        message: 'Registration failed: ' + error.message
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Verify user exists and get custom token
      const user = await admin.auth().getUserByEmail(email);
      
      // Check if user is approved (for institutes and companies)
      const userDoc = await db.collection('users').doc(user.uid).get();
      const userProfile = userDoc.data();

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