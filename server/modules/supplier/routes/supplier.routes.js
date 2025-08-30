import express from 'express';
import { addSupplier, updateSupplier, approveSupplier, getSuppliers } from '../controller/supplier.controller.js';

const router = express.Router();

// Add new supplier
router.post('/', addSupplier);

// Update supplier details
router.put('/:id', updateSupplier);

// Approve or reject supplier registration
router.patch('/:id/approve', approveSupplier);

// Get all suppliers
router.get('/', getSuppliers);

export default router;
