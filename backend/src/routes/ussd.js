const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// USSD route - no auth middleware required, USSD providers don't send tokens
router.post('/', authController.handleUSSD);

module.exports = router;
