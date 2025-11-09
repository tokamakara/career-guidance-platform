const { admin, db } = require('../config/firebaseAdmin');

const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get user profile from Firestore
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found'
        });
      }

      const userProfile = userDoc.data();
      req.userProfile = userProfile;

      // Check if user role is allowed
      if (!allowedRoles.includes(userProfile.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions. Required roles: ' + allowedRoles.join(', ')
        });
      }

      // Check if account is approved (for institutes and companies)
      if ((userProfile.role === 'institute' || userProfile.role === 'company') && 
          userProfile.status !== 'approved') {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending approval'
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

// Specific role middlewares
const requireAdmin = requireRole(['admin']);
const requireInstitute = requireRole(['institute']);
const requireStudent = requireRole(['student']);
const requireCompany = requireRole(['company']);
const requireAuthenticated = requireRole(['admin', 'institute', 'student', 'company']);

module.exports = {
  requireRole,
  requireAdmin,
  requireInstitute,
  requireStudent,
  requireCompany,
  requireAuthenticated
};