import express from 'express';
import { addSupplier, updateSupplier, getSuppliers, deleteSupplier, linkSuppliersToUsers, getCurrentSupplier } from '../controller/supplier.controller.js';

const router = express.Router();

// Add new supplier
router.post('/', addSupplier);

// Update supplier details
router.put('/:id', updateSupplier);

// Get all suppliers
router.get('/', getSuppliers);

// Get current supplier profile
router.get('/me', getCurrentSupplier);

// Delete supplier
router.delete('/:id', deleteSupplier);

// Link suppliers to users
router.post('/link-users', linkSuppliersToUsers);

export default router;
