const express = require('express');
const router = express.Router();
const { register, login} = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');


router.post('/materials', auth, authController.createMaterial);
router.post('/newRequest', auth, authController.createRequest);
router.post('/register', register);
router.post('/login', login);

router.get('/materials', auth,authController.getMaterials);
router.get('/BookRequest', auth, authController.getMyBookRequests);
router.get('/incomingRequest', auth, authController.getRequestsForMyMaterials);
router.get('/OutgoingRequest', auth, authController.getMyRecyclableRequests);
router.get('/availableMaterials', auth, authController.getAvailableMaterials);
router.get('/DeliveredRequests', auth, authController.getDeliveredRecyclableRequests);
router.get('/materialrequests/papermill/report', auth, authController.generatePaperMillReport);
router.get('/myListings', auth, authController.getMyListings);
router.get('/summary', auth, authController.getActivitySummary);

router.delete('/:id', auth, authController.deleteListing);
router.patch('/requestStatus', auth, authController.updateRequestStatus);

module.exports = router;