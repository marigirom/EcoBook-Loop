const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

// Notifications
router.get('/', auth, authController.getNotifications);
router.patch('/:id/read', auth, authController.markAsRead);
router.delete('/:id', auth, authController.deleteNotification);  
// Auth
router.post('/register', register);
router.post('/login', login);

// Requests
router.patch('/requestStatus', auth, authController.updateRequestStatus);

module.exports = router;
