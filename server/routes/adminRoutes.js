const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Use ONLY the methods that exist in your adminController
router.get('/dashboard', authenticateToken, requireRole(['admin']), adminController.getDashboardStats);
router.get('/users', authenticateToken, requireRole(['admin']), adminController.getUsers);
router.put('/approve/:userId', authenticateToken, requireRole(['admin']), adminController.approveRegistration);
router.put('/suspend/:userId', authenticateToken, requireRole(['admin']), adminController.suspendUser);
router.put('/reactivate/:userId', authenticateToken, requireRole(['admin']), adminController.reactivateUser);
router.delete('/users/:userId', authenticateToken, requireRole(['admin']), adminController.deleteUser);
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