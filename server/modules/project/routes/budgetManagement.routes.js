import express from 'express';
import { authMiddleware } from '../../auth/middleware/authMiddleware.js';
import roleMiddleware from '../../auth/middleware/roleMiddleware.js';
import {
  getAllEstimationsForPM,
  getEstimationDetails,
  approveEstimation,
  rejectEstimation
} from '../controller/budgetManagement.controller.js';

const router = express.Router();

// Get all estimations for Project Manager dashboard
router.get(
  '/estimations',
  authMiddleware,
  roleMiddleware(['project manager', 'admin']),
  getAllEstimationsForPM
);

// Get specific estimation details for PM view
router.get(
  '/estimation/:estimationId',
  authMiddleware,
  roleMiddleware(['project manager', 'admin']),
  getEstimationDetails
);

// Approve estimation (PM only)
router.patch(
  '/estimation/:estimationId/approve',
  authMiddleware,
  roleMiddleware(['project manager', 'admin']),
  approveEstimation
);

// Reject estimation (PM only, requires remarks)
router.patch(
  '/estimation/:estimationId/reject',
  authMiddleware,
  roleMiddleware(['project manager', 'admin']),
  rejectEstimation
);

export default router;