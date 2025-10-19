import express from 'express';
import * as controller from '../controller/inspectionEstimationController.js';

const router = express.Router();

//View inspection requests with status 'Pending'
router.get('/pending', controller.getPendingRequests);
//Generate estimate based on distance
router.post('/:inspectionRequestId/estimate', controller.generateEstimate);
//Approve/reject payment
router.post('/:inspectionRequestId/verify-payment', controller.verifyPayment);
// Client uploads receipt URL (can be called by client app)
router.post('/:inspectionRequestId/upload-receipt', controller.uploadReceipt);
//View inspection requests with status 'PaymentVerified' or 'PaymentRejected'
router.get('/payment-status/filter', controller.getByPaymentStatus);
//View inspection requests with status 'PaymentPending'
router.get('/payment-pending', controller.getPaymentPendingRequests);
// Get all estimation records with related inspection request data
router.get('/all-estimation-details', controller.getRequestDetails);

export default router;
