import express from 'express';
import {
  createPurchaseOrder,
  updatePurchaseOrder,
  getPurchaseOrders,
  forwardToFinance,
  financeApproval,
  getApprovalStatus
} from '../controller/purchaseOrder.controller.js';

const router = express.Router();

// Create material request
router.post('/', createPurchaseOrder);

// Update material request
router.put('/:id', updatePurchaseOrder);

// Get all material requests
router.get('/', getPurchaseOrders);

// Forward for finance approval
router.patch('/:id/forward', forwardToFinance);

// Approve or reject finance
router.patch('/:id/finance', financeApproval);

// Get approval status
router.get('/:id/status', getApprovalStatus);

// Update order status
router.put('/:id/status', updatePurchaseOrder);

export default router;
