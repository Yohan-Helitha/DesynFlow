import express from 'express';
import { authMiddleware } from '../../auth/middleware/authMiddleware.js';
import roleMiddleware from '../../auth/middleware/roleMiddleware.js';
import { getAllSubmittedInspectionReports } from '../controller/inspectionReport.controller.js';

const router = express.Router();

// Get all submitted inspection reports for Project Manager dashboard
router.get(
  '/submitted-inspection-reports',
  authMiddleware,
  roleMiddleware(['project manager', 'admin']),
  getAllSubmittedInspectionReports
);

export default router;