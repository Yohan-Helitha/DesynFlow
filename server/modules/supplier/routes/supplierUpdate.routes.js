import express from 'express';
import { updateSupplierDetails } from '../controller/supplierUpdate.controller.js';

const router = express.Router();

// Update supplier details
router.put('/:id', updateSupplierDetails);

export default router;
