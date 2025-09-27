import express from 'express';
import * as controller from '../controller/purchaseOrderController.js';

const router = express.Router();

// View requests by status
router.get('/', controller.getRequestsByStatus);

// Get single purchase order details
router.get('/:id', controller.getPurchaseOrderDetails);

// Approve request
router.patch('/:requestId/approve', controller.approveRequest);

// Reject request
router.patch('/:requestId/reject', controller.rejectRequest);

export default router;
