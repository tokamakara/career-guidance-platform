const express = require('express');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const jobController = require('../controllers/jobController');

const router = express.Router();

// Company job management
router.post(
  '/',
  authenticateToken,
  requireRole(['company']),
  jobController.createJob
);

router.get(
  '/:jobId/qualified-candidates',
  authenticateToken,
  requireRole(['company']),
  jobController.getQualifiedCandidates
);

// Public job listings
router.get(
  '/public',
  jobController.getPublicJobs
);

router.get(
  '/public/:jobId',
  jobController.getJobDetails
);

module.exports = router;