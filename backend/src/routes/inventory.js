const express = require('express');
const router = express.Router();
const { register, login} = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');


router.post('/materials', auth, authController.createMaterial);
router.post('/register', register);
router.post('/login', login);

module.exports = router;