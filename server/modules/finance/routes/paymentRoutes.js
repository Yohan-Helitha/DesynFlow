import express from 'express';
import * as controller from '../controller/paymentController.js';

const router = express.Router();

// Display all pending payments
router.get('/pending', controller.getPendingPayments);

// Display all approved or rejected payments
router.get('/processed', controller.getProcessedPayments);

// Approve or reject a pending payment
router.patch('/:paymentId/status', controller.updatePaymentStatus);

export default router;
