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

module.exports = router;