const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Use ONLY the methods that actually exist in companyController
router.get('/dashboard', authenticateToken, requireRole(['company']), companyController.getCompanyStats);
router.get('/profile', authenticateToken, requireRole(['company']), companyController.getCompanyProfile);
router.put('/profile', authenticateToken, requireRole(['company']), companyController.updateCompanyProfile);
router.get('/jobs', authenticateToken, requireRole(['company']), companyController.getCompanyJobs);

// PDF Export
router.get('/export/admitted/:jobId?', authenticateToken, requireRole(['company']), companyController.exportAdmittedCandidates);

module.exports = router;