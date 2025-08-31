import express from 'express';
import { approveOrRejectSupplier } from '../controller/supplierApproval.controller.js';

const router = express.Router();

// Approve or reject supplier registration
router.patch('/:id/approval', approveOrRejectSupplier);

export default router;
