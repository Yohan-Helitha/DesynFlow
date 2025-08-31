import express from 'express';
import { storeSupplier } from '../controller/supplierStore.controller.js';

const router = express.Router();

// Store new supplier data
router.post('/', storeSupplier);

export default router;
