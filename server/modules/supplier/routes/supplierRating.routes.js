import express from 'express';
import { addRating, getTopRatedSuppliers } from '../controller/supplierRating.controller.js';

const router = express.Router();

// Record feedback after delivery
router.post('/', addRating);

// Get top-rated suppliers
router.get('/top', getTopRatedSuppliers);

export default router;
