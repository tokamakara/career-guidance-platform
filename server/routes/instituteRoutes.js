const express = require('express');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const instituteController = require('../controllers/instituteController');
const applicationController = require('../controllers/applicationController');

const router = express.Router();

// Institute management
router.get(
  '/institutions',
  instituteController.getInstitutions
);

router.get(
  '/institutions/:institutionId',
  instituteController.getInstitutionDetails
);

router.get(
  '/institutions/:institutionId/faculties/:facultyId/courses',
  instituteController.getFacultyCourses
);

router.get(
  '/institutions/all',
  instituteController.getAllInstitutionsWithCourses
);

router.get(
  '/courses/qualified',
  authenticateToken,
  requireRole(['student']),
  instituteController.getQualifiedCourses
);

// Institute-specific routes (require institute role)
router.post(
  '/faculties',
  authenticateToken,
  requireRole(['institute']),
  instituteController.createFaculty
);

router.post(
  '/courses',
  authenticateToken,
  requireRole(['institute']),
  instituteController.createCourse
);

router.get(
  '/my-applications',
  authenticateToken,
  requireRole(['institute']),
  applicationController.getInstituteApplications
);

router.patch(
  '/applications/:applicationId/status',
  authenticateToken,
  requireRole(['institute']),
  applicationController.updateApplicationStatus
);

// Institute profile routes
router.get(
  '/profile',
  authenticateToken,
  requireRole(['institute']),
  instituteController.getInstituteProfile
);

router.put(
  '/profile',
  authenticateToken,
  requireRole(['institute']),
  instituteController.updateInstituteProfile
);

// PDF Export
router.get(
  '/export/admitted/:courseId?',
  authenticateToken,
  requireRole(['institute']),
  instituteController.exportAdmittedStudents
);

module.exports = router;