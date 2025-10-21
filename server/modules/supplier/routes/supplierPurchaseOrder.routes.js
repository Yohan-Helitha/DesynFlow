import express from 'express';
import { authMiddleware } from '../../auth/middleware/authMiddleware.js';
import { supplierMiddleware } from '../middleware/supplierMiddleware.js';
import { getSupplierPurchaseOrders } from '../controller/supplierPurchaseOrder.controller.js';

const router = express.Router();

// Supplier-specific purchase order routes (protected)
router.get('/my-purchase-orders', authMiddleware, supplierMiddleware, getSupplierPurchaseOrders);

export default router;