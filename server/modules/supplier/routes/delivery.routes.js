import express from 'express';
import { updateDeliveryStatus, getOrderStatus, updateDeliveryLocation, getDeliveryLocation } from '../controller/delivery.controller.js';

const router = express.Router();

// Update delivery status
router.post('/status', updateDeliveryStatus);

// Track live status of orders
router.get('/status/:purchaseOrderId', getOrderStatus);

// Update delivery location
router.patch('/location/:purchaseOrderId', updateDeliveryLocation);

// Get delivery location
router.get('/location/:purchaseOrderId', getDeliveryLocation);

export default router;
