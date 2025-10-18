import express from 'express';
import { authMiddleware } from '../../auth/middleware/authMiddleware.js';
import roleMiddleware from '../../auth/middleware/roleMiddleware.js';
import {
  getAllQuotationsForPM,
  getQuotationDetails,
  approveQuotation,
  rejectQuotation
} from '../controller/quotationManagement.controller.js';

const router = express.Router();

// Get all quotations for Project Manager dashboard (only 'Sent' status)
router.get(
  '/quotations',
  authMiddleware,
  roleMiddleware(['project manager', 'admin']),
  getAllQuotationsForPM
);

// Get specific quotation details for PM view
router.get(
  '/quotation/:quotationId',
  authMiddleware,
  roleMiddleware(['project manager', 'admin']),
  getQuotationDetails
);

// Approve quotation (PM only) - Changes status from Sent → Confirmed → Locked
router.patch(
  '/quotation/:quotationId/approve',
  authMiddleware,
  roleMiddleware(['project manager', 'admin']),
  approveQuotation
);

// Reject quotation (PM only, requires remarks) - Creates revised version with 'Revised' status
router.patch(
  '/quotation/:quotationId/reject',
  authMiddleware,
  roleMiddleware(['project manager', 'admin']),
  rejectQuotation
);

export default router;