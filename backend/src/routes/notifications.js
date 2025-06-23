const express = require('express');
const router = express.Router();
const { register, login} = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

// Example route
router.get('/', auth, authController.getNotifications);

router.post('/register', register);
router.post('/login', login);
router.patch('/requestStatus', auth, authController.updateRequestStatus);
router.patch('/:id/read', auth, authController.markAsRead);

module.exports = router;