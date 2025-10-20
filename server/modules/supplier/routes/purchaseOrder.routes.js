import express from 'express';
import {
  createPurchaseOrder,
  updatePurchaseOrder,
  getPurchaseOrders,
  forwardToFinance,
  financeApproval,
  getApprovalStatus,
  markAsReceivedAndUpdateReorder
} from '../controller/purchaseOrder.controller.js';

const router = express.Router();

// Create material request
router.post('/', createPurchaseOrder);

// Update material request
router.put('/:id', updatePurchaseOrder);

// Get all material requests
router.get('/', getPurchaseOrders);

// Get supplier's own orders (authenticated endpoint)
router.get('/mine', getPurchaseOrders);

// Forward for finance approval
router.patch('/:id/forward', forwardToFinance);

// Approve or reject finance
router.patch('/:id/finance', financeApproval);

// Get approval status
router.get('/:id/status', getApprovalStatus);

// Update order status
router.put('/:id/status', updatePurchaseOrder);

// Mark as received and update reorder request
router.put('/:id/mark-received', markAsReceivedAndUpdateReorder);

export default router;
