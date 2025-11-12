const express = require('express');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { courseApplicationLimiter, applicationLimiter } = require('../middlewares/rateLimiter');
const applicationController = require('../controllers/applicationController');
const jobController = require('../controllers/jobController');
const studentController = require('../controllers/studentController');

const router = express.Router();

// Student applications
router.post(
  '/apply/course',
  authenticateToken,
  requireRole(['student']),
  courseApplicationLimiter,
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
  applicationLimiter,
  jobController.applyToJob
);

// Student profile routes
router.get(
  '/profile',
  authenticateToken,
  requireRole(['student']),
  studentController.getStudentProfile
);

router.put(
  '/profile',
  authenticateToken,
  requireRole(['student']),
  studentController.updateStudentProfile
);

module.exports = router;