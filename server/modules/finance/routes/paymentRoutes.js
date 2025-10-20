import express from 'express';
import * as controller from '../controller/paymentController.js';
import { authMiddleware, roleMiddleware } from '../../auth/middleware/authMiddleware.js';

const router = express.Router();

// Client: create a new payment (Advance/Final) for a project
router.post('/', authMiddleware, roleMiddleware(['client']), controller.createClientPayment);

// Client: update payment with receipt
router.put('/:paymentId', authMiddleware, roleMiddleware(['client']), controller.updateClientPayment);

// Client: list my payments
router.get('/my', authMiddleware, roleMiddleware(['client']), controller.getMyPayments);

// Display all pending payments
router.get('/pending', controller.getPendingPayments);

// Display all approved or rejected payments
router.get('/processed', controller.getProcessedPayments);

// Approve or reject a pending payment
router.patch('/:paymentId/status', controller.updatePaymentStatus);

export default router;
