import express from 'express';
import * as controller from '../controller/paymentController.js';

const router = express.Router();

// Get all payments
router.get('/', controller.getAllPayments);

// Display all pending payments
router.get('/pending', controller.getPendingPayments);

// Display all approved or rejected payments
router.get('/processed', controller.getProcessedPayments);

// Approve or reject a pending payment
router.patch('/:paymentId/status', controller.updatePaymentStatus);

// Filter payments by project, client, date
router.get('/filter', controller.filterPayments);

// Calculate outstanding balances per client/project
router.get('/outstanding', controller.getOutstandingBalances);

export default router;
