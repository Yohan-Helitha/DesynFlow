import express from 'express';
import * as warrantyController from '../controller/warrantyController.js';

const router = express.Router();

// Main CRUD operations
router.post('/', warrantyController.createWarranty);
router.get('/', warrantyController.getWarranties);
router.get('/all', warrantyController.getAllWarrantiesWithDetails); // New route for frontend table
router.get('/:id', warrantyController.getWarrantyById);
router.put('/:id', warrantyController.updateWarranty);
router.delete('/:id', warrantyController.deleteWarranty);
router.get('/:id/status', warrantyController.getWarrantyStatus);

// Integrations
router.get('/project/:id', warrantyController.getProjectWarranties);
router.get('/item/:id/warranty-details', warrantyController.getItemWarrantyDetails);
router.get('/client/:id', warrantyController.getClientWarranties);

export default router;
