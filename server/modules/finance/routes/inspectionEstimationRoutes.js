const express = require('express');
const router = express.Router();
const controller = require('../controller/inspectionEstimationController');

// View inspection requests with status 'Pending'
router.get('/pending', controller.getPendingRequests);

// View inspection request details by inspectionRequestId
router.get('/:inspectionRequestId', controller.getRequestDetails);

// Generate estimate based on distance
router.post('/:inspectionRequestId/estimate', controller.generateEstimate);

// View inspection requests with status 'Waiting'
router.get('/waiting', controller.getWaitingRequests);

// Approve/reject payment
router.post('/:inspectionRequestId/verify-payment', controller.verifyPayment);

module.exports = router;
