import express from 'express';
import {
  createInspectionRequest,
  uploadPaymentReceipt,
  getClientInspectionRequests,
  getAllInspectionRequests,
  updateInspectionRequestStatus,
  getClientProgressTracking
} from '../controller/inspectionRequestController.js';
import {
  createInspectorForm,
  updateInspectorForm,
  submitInspectorForm,
  getMyInspectorForms
} from '../controller/inspectorFormController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js'; // Uncomment and implement for file uploads

const router = express.Router();

// CLIENT ROUTES - Simplified inspection requests
// Create a new inspection request (client)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['client']),
  createInspectionRequest
);

// Upload payment receipt (client)
router.post(
  '/:requestId/receipt',
  authMiddleware,
  roleMiddleware(['client']),
  /* uploadMiddleware.single('receipt'), */ // Uncomment and implement for file uploads
  uploadPaymentReceipt
);

// Get all inspection requests for the logged-in client
router.get(
  '/client',
  authMiddleware,
  roleMiddleware(['client']),
  getClientInspectionRequests
);

// Get client progress tracking data (NEW - for dashboard progress)
router.get(
  '/client/progress',
  authMiddleware,
  roleMiddleware(['client']),
  getClientProgressTracking
);

// Get all inspection requests for CSR
router.get(
  '/all',
  authMiddleware,
  roleMiddleware(['customer service representative', 'csr']),
  getAllInspectionRequests
);

// INSPECTOR ROUTES - Dynamic form handling
// Create inspector form entry (inspector fills after site visit)
router.post(
  '/inspector-form',
  authMiddleware,
  roleMiddleware(['inspector']),
  createInspectorForm
);

// Update inspector form entry
router.put(
  '/inspector-form/:formId',
  authMiddleware,
  roleMiddleware(['inspector']),
  updateInspectorForm
);

// Submit inspector form (complete inspection)
router.patch(
  '/inspector-form/:formId/submit',
  authMiddleware,
  roleMiddleware(['inspector']),
  submitInspectorForm
);

// Get inspector's own forms
router.get(
  '/inspector-forms/my-forms',
  authMiddleware,
  roleMiddleware(['inspector']),
  getMyInspectorForms
);

// ADMIN/CSR ROUTES - Status management
// Update status of an inspection request (CSR, finance, or admin)
router.patch(
  '/:requestId/status',
  authMiddleware,
  roleMiddleware(['csr', 'finance', 'admin']),
  updateInspectionRequestStatus
);

export default router;