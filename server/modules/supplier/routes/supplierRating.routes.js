import express from 'express';
import { addRating, getTopRatedSuppliers, getSupplierRatings } from '../controller/supplierRating.controller.js';

const router = express.Router();

// Record feedback after delivery
router.post('/', addRating);

// Get top-rated suppliers
router.get('/top', getTopRatedSuppliers);

// Get ratings for a specific supplier
router.get('/:supplierId', getSupplierRatings);

export default router;
