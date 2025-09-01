import express from 'express';
import {
  createInspectionRequest,
  uploadPaymentReceipt,
  getClientInspectionRequests,
  updateInspectionRequestStatus
} from '../controller/inspectionRequestController.js';
import authMiddleware from '../middleware/authMiddleware.js';
// import uploadMiddleware from '../middleware/uploadMiddleware.js'; // Uncomment and implement for file uploads

const router = express.Router();

// Create a new inspection request (client)
router.post(
  '/',
  authMiddleware(['client']),
  createInspectionRequest
);

// Upload payment receipt (client)
router.post(
  '/:requestId/receipt',
  authMiddleware(['client']),
  /* uploadMiddleware.single('receipt'), */ // Uncomment and implement for file uploads
  uploadPaymentReceipt
);

// Get all inspection requests for the logged-in client
router.get(
  '/',
  authMiddleware(['client']),
  getClientInspectionRequests
);

// Update status of an inspection request (CSR, finance, or admin)
router.patch(
  '/:requestId/status',
  authMiddleware(['csr', 'finance', 'admin']),
  updateInspectionRequestStatus
);

export default router;