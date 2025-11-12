const express = require('express');
const authController = require('../controllers/authController');
const { authLimiter, passwordResetLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/verify-email', authLimiter, authController.verifyEmail);
router.post('/reset-password', passwordResetLimiter, authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;