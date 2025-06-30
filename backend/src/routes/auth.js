const express = require('express');
const router = express.Router();
const { register, login, sendOTP, resetPassword, getProfile } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Existing routes
router.post('/register', register);
router.post('/login', login);

// Forgot password routes
router.post('/send-otp', sendOTP);
router.post('/reset-password', resetPassword);

// Profile route (protected)
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
