import express from 'express';
import { uploadSample, reviewSample, getSamples, getAllSamples } from '../controller/sample.controller.js';

const router = express.Router();

// Get all samples (must come before /:supplierId route)
router.get('/all', getAllSamples);

// Supplier uploads sample
router.post('/upload', uploadSample);

// Management reviews sample
router.patch('/:id/review', reviewSample);

// Get samples for a supplier
router.get('/:supplierId', getSamples);

export default router;
