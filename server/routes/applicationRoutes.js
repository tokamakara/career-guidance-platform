const express = require('express');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateRequest, applicationSchemas } = require('../middlewares/validationMiddleware');
const applicationController = require('../controllers/applicationController');

const router = express.Router();

// Student routes
router.post(
  '/student/apply',
  authenticateToken,
  requireRole(['student']),
  validateRequest(applicationSchemas.createApplication),
  applicationController.createApplication
);

router.get(
  '/student/my-applications',
  authenticateToken,
  requireRole(['student']),
  applicationController.getStudentApplications
);

router.post(
  '/student/accept-admission/:applicationId',
  authenticateToken,
  requireRole(['student']),
  applicationController.acceptAdmission
);

// Institute routes
router.get(
  '/institute/applications',
  authenticateToken,
  requireRole(['institute']),
  applicationController.getInstituteApplications
);

router.patch(
  '/institute/applications/:applicationId/status',
  authenticateToken,
  requireRole(['institute']),
  validateRequest(applicationSchemas.updateApplicationStatus),
  applicationController.updateApplicationStatus
);

module.exports = router;