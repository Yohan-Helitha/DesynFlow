
import express from 'express';
import * as controller from '../controller/quotationController.js';
const router = express.Router();


// Create a new quotation
router.post('/', controller.createQuotation);

// Revise (new version)
router.post('/:quotationId/revise', controller.reviseQuotation);

// Send quotation
router.patch('/:quotationId/send', controller.sendQuotation);

// View quotation details
router.get('/:quotationId', controller.getQuotation);

// Fetch all versions for a project
router.get('/project/:projectId/versions', controller.getQuotationVersions);

// Lock/confirm quotation
router.patch('/:quotationId/lock', controller.lockQuotation);

// Update editable fields (if not locked)
router.patch('/:quotationId', controller.updateQuotation);

export default router;
