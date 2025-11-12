const express = require('express');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const jobController = require('../controllers/jobController');

const router = express.Router();

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job posting
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - department
 *               - type
 *               - location
 *               - description
 *               - requirements
 *               - applicationDeadline
 *             properties:
 *               title:
 *                 type: string
 *               department:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [full-time, part-time, contract, internship]
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: object
 *               applicationDeadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authenticateToken,
  requireRole(['company']),
  jobController.createJob
);

/**
 * @swagger
 * /api/jobs/{jobId}/qualified-candidates:
 *   get:
 *     summary: Get qualified candidates for a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of qualified candidates
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.get(
  '/:jobId/qualified-candidates',
  authenticateToken,
  requireRole(['company']),
  jobController.getQualifiedCandidates
);

/**
 * @swagger
 * /api/jobs/{jobId}/applicants:
 *   get:
 *     summary: Get all applicants for a job (including rejected)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all applicants with stats
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.get(
  '/:jobId/applicants',
  authenticateToken,
  requireRole(['company']),
  jobController.getJobApplicants
);

/**
 * @swagger
 * /api/jobs/applications/{applicationId}/status:
 *   patch:
 *     summary: Update job application status (individual)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected, hired]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application status updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Application not found
 */
router.patch(
  '/applications/:applicationId/status',
  authenticateToken,
  requireRole(['company']),
  jobController.updateJobApplicationStatus
);

/**
 * @swagger
 * /api/jobs/{jobId}/applications/bulk-status:
 *   patch:
 *     summary: Bulk update job application status
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationIds
 *               - status
 *             properties:
 *               applicationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected, hired]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Applications updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.patch(
  '/:jobId/applications/bulk-status',
  authenticateToken,
  requireRole(['company']),
  jobController.bulkUpdateJobApplicationStatus
);

/**
 * @swagger
 * /api/jobs/public:
 *   get:
 *     summary: Get public job listings with pagination, search, and filters
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for job title, description, company, or department
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [full-time, part-time, contract, internship]
 *         description: Filter by job type
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *     responses:
 *       200:
 *         description: List of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get(
  '/public',
  jobController.getPublicJobs
);

/**
 * @swagger
 * /api/jobs/public/{jobId}:
 *   get:
 *     summary: Get job details by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 */
router.get(
  '/public/:jobId',
  jobController.getJobDetails
);

module.exports = router;