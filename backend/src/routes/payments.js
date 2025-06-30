const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

router.post('/bonus', auth, authController.processBonusPayment);
router.post('/stk-callback', authController.handleSTKCallback);

router.get('/PayRequests', auth, authController.getEcoPayRequests);
router.get('/bonusSum', auth, authController.getBonusSum);

console.log('Payments routes loaded');


module.exports = router;