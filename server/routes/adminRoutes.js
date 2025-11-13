const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Use ONLY the methods that exist in your adminController
// Wrap in error handler to catch any unhandled errors
router.get('/dashboard', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    await adminController.getDashboardStats(req, res);
  } catch (error) {
    console.error('❌ Unhandled error in dashboard route:', error);
    if (!res.headersSent) {
      res.status(200).json({
        success: true,
        data: {
          totalUsers: 0,
          totalInstitutions: 0,
          totalCompanies: 0,
          totalApplications: 0,
          totalJobs: 0,
          pendingApprovals: {
            institutions: 0,
            companies: 0
          }
        },
        warning: 'Dashboard data could not be loaded. Showing default values.'
      });
    }
  }
});
router.get('/users', authenticateToken, requireRole(['admin']), adminController.getUsers);
router.put('/approve/:userId', authenticateToken, requireRole(['admin']), adminController.approveRegistration);
router.put('/suspend/:userId', authenticateToken, requireRole(['admin']), adminController.suspendUser);
router.put('/reactivate/:userId', authenticateToken, requireRole(['admin']), adminController.reactivateUser);
router.delete('/users/:userId', authenticateToken, requireRole(['admin']), adminController.deleteUser);
router.delete('/users/by-email', authenticateToken, requireRole(['admin']), adminController.deleteUserByEmail);
router.get('/reports', authenticateToken, requireRole(['admin']), adminController.getReports);

// Applications Overview
router.get('/applications/institute', authenticateToken, requireRole(['admin']), adminController.getInstituteApplications);
router.get('/applications/company', authenticateToken, requireRole(['admin']), adminController.getCompanyApplications);
router.get('/applications/combined', authenticateToken, requireRole(['admin']), adminController.getCombinedApplications);

// Analytics & Reports
router.get('/analytics/institute', authenticateToken, requireRole(['admin']), adminController.getInstituteAnalytics);
router.get('/analytics/company', authenticateToken, requireRole(['admin']), adminController.getCompanyAnalytics);
router.get('/analytics/combined', authenticateToken, requireRole(['admin']), adminController.getCombinedAnalytics);

// PDF Exports
router.get('/export/company/:companyId/admitted', authenticateToken, requireRole(['admin']), adminController.exportCompanyAdmittedCandidates);
router.get('/export/institute/:institutionId/admitted', authenticateToken, requireRole(['admin']), adminController.exportInstituteAdmittedStudents);

module.exports = router;