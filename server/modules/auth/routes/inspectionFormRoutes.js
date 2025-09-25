import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js'; // handles file uploads
import {
  createInspectorForm,
  updateInspectorForm,
  getInspectorFormsByRequest,
  getInspectorFormById,
  getInspectorForms,
  deleteInspectorForm,
  submitInspectorForm,
  generateReportFromForm,
  getMyInspectorForms
} from '../controller/inspectorFormController.js';

const router = express.Router();

// Create a new inspection form (inspector) with optional photo uploads
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['inspector']),
  uploadMiddleware.array('room_photo', 5), // accept up to 5 files
  createInspectorForm
);

// Get all inspection forms (admin, csr, finance, inspector)
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['admin', 'csr', 'finance', 'inspector']),
  getInspectorForms
);

// Get a single inspection form by ID (all roles)
router.get(
  '/:formId',
  authMiddleware,
  getInspectorFormById
);

// Update an inspection form (inspector)
router.patch(
  '/:formId',
  authMiddleware,
  roleMiddleware(['inspector']),
  uploadMiddleware.array('room_photo', 5), // allow updating photos
  updateInspectorForm
);

// Delete an inspection form (inspector only)
router.delete(
  '/:formId',
  authMiddleware,
  roleMiddleware(['inspector']),
  deleteInspectorForm
);

// Submit an inspection form (mark as submitted)
router.post(
  '/submit/:formId',
  authMiddleware,
  roleMiddleware(['inspector']),
  submitInspectorForm
);

// Generate report from an inspection form
router.post(
  '/generate-report/:formId',
  authMiddleware,
  roleMiddleware(['inspector']),
  generateReportFromForm
);

// Get logged-in inspector's own forms
router.get(
  '/my',
  authMiddleware,
  roleMiddleware(['inspector']),
  getMyInspectorForms
);

export default router;
