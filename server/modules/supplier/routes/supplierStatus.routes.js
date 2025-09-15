import express from 'express';
import { updateSupplierStatus, getStatusUpdates } from '../controller/supplierStatus.controller.js';

const router = express.Router();

// Supplier updates status
router.post('/update', updateSupplierStatus);

// Get status updates for a purchase order
router.get('/:purchaseOrderId', getStatusUpdates);

export default router;
