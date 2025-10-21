import express from 'express';
import { uploadSample, reviewSample, getSamples, getAllSamples, getSupplierSamples, createSampleRequest } from '../controller/sample.controller.js';
import { authMiddleware } from '../../auth/middleware/authMiddleware.js';
import { supplierMiddleware } from '../middleware/supplierMiddleware.js';

const router = express.Router();

// Get all samples (must come before /:supplierId route)
router.get('/all', getAllSamples);

// Supplier-specific route to get their own samples
router.get('/my-samples', authMiddleware, supplierMiddleware, getSupplierSamples);
router.get('/mine', authMiddleware, supplierMiddleware, getSupplierSamples);

// Procurement officer creates sample request (no auth required for now)
router.post('/upload', createSampleRequest);

// Supplier uploads sample (if needed separately)
router.post('/supplier-upload', authMiddleware, supplierMiddleware, uploadSample);

// Management reviews sample
router.patch('/:id/review', reviewSample);

// Get samples for a supplier
router.get('/:supplierId', getSamples);

export default router;
