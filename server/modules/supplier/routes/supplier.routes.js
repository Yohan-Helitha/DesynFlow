import express from 'express';
import { addSupplier, updateSupplier, getSuppliers, deleteSupplier } from '../controller/supplier.controller.js';

const router = express.Router();

// Add new supplier
router.post('/', addSupplier);

// Update supplier details
router.put('/:id', updateSupplier);

// Get all suppliers
router.get('/', getSuppliers);

// Delete supplier
router.delete('/:id', deleteSupplier);

export default router;
