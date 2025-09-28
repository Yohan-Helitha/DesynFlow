
import express from 'express';
import * as controller from '../controller/quotationController.js';
const router = express.Router();


// List quotations with optional filters (status, projectId, estimateVersion, date range)
router.get('/', controller.getQuotations);

// Create a new quotation
router.post('/', controller.createQuotation);

// Get next version number for a project + estimate version
router.get('/project/:projectId/next-version', controller.getNextQuotationVersion);

// Get a single quotation by id
router.get('/:quotationId', controller.getQuotation);

// Update editable fields of a quotation by id
router.patch('/:quotationId', controller.updateQuotation);

export default router;
