const express = require('express');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const applicationController = require('../controllers/applicationController');
const jobController = require('../controllers/jobController');

const router = express.Router();

// Student applications
router.post(
  '/apply/course',
  authenticateToken,
  requireRole(['student']),
  applicationController.createApplication
);

router.get(
  '/my-applications',
  authenticateToken,
  requireRole(['student']),
  applicationController.getStudentApplications
);

router.post(
  '/accept-admission/:applicationId',
  authenticateToken,
  requireRole(['student']),
  applicationController.acceptAdmission
);

// Student jobs
router.get(
  '/job-recommendations',
  authenticateToken,
  requireRole(['student']),
  jobController.getJobRecommendations
);

router.post(
  '/apply/job',
  authenticateToken,
  requireRole(['student']),
  jobController.applyToJob
);

module.exports = router;