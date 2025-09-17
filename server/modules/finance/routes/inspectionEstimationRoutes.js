import express from 'express';
import * as controller from '../controller/inspectionEstimationController.js';

const router = express.Router();

// 1. View inspection requests with status 'Pending'
router.get('/pending', controller.getPendingRequests);

// 2. View inspection request details by inspectionRequestId
router.get('/:inspectionRequestId', controller.getRequestDetails);

// 3. Generate estimate based on distance
router.post('/:inspectionRequestId/estimate', controller.generateEstimate);

// 4. Approve/reject payment
router.post('/:inspectionRequestId/verify-payment', controller.verifyPayment);

// 5. View inspection requests with status 'PaymentVerified' or 'PaymentRejected'
router.get('/payment-status/filter', controller.getByPaymentStatus);

// View inspection requests with status 'PaymentPending'
router.get('/payment-pending', controller.getPaymentPendingRequests);

export default router;
