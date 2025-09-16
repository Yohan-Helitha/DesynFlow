import express from 'express';
import {
  getSuppliersWithRatings,
  getAllOrders,
  getOrderTracking,
  getSystemLogs
} from '../controller/dashboard.controller.js';

const router = express.Router();

// View all suppliers and their ratings
router.get('/suppliers', getSuppliersWithRatings);

// View all requests, approvals, deliveries
router.get('/orders', getAllOrders);

// See live tracking of current orders
router.get('/orders/:purchaseOrderId/tracking', getOrderTracking);

// Check system logs
router.get('/logs', getSystemLogs);

export default router;
