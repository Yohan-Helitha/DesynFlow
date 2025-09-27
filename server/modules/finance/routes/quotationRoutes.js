
import express from 'express';
import * as controller from '../controller/quotationController.js';
const router = express.Router();


// List quotations with optional filters (status, projectId, estimateVersion, date range)
router.get('/', controller.getQuotations);

// Create a new quotation
router.post('/', controller.createQuotation);

// Get next version number for a project + estimate version
router.get('/project/:projectId/next-version', controller.getNextQuotationVersion);

export default router;
