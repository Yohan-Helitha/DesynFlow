import express from 'express';
import * as controller from '../controller/projectEstimationController.js';

const router = express.Router();

// Get only Approved estimations
router.get('/approved', controller.getApprovedEstimates);

// Get all project estimations (for frontend table)
router.get('/', controller.getAllEstimates);

// Create or update estimate (new version)
router.post('/', controller.createOrUpdateEstimate);

// Update status of an estimate
router.patch('/:estimateId/status', controller.updateEstimateStatus);

// Get all estimates for a project (version history)
router.get('/project/:projectId', controller.getEstimatesByProject);

// Get all estimates (all projects)
router.get('/all', controller.getAllEstimates);

// Get latest estimate for a project
router.get('/latest/:projectId', controller.getLatestEstimate);

export default router;
