const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

router.post('/newSchedule', auth, authController.createSchedule);

module.exports = router;