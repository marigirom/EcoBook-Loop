const express = require('express');
const router = express.Router();
//const { register, login} = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

// Example route
router.post('/bonus', auth, authController.processBonusPayment);
router.post('/stk-callback', authController.handleSTKCallback); // No auth needed for M-Pesa callback

/*router.post('/register', register);
router.post('/login', login);*/


module.exports = router;