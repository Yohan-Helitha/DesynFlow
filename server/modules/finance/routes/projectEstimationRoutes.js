import express from 'express';
import * as controller from '../controller/projectEstimationController.js';

const router = express.Router();

// Get all project estimations (for frontend table)
router.get('/', controller.getAllEstimates);

// Create or update estimate (new version)
router.post('/', controller.createOrUpdateEstimate);

// Get all estimates for a project (version history)
router.get('/project/:projectId', controller.getEstimatesByProject);

// Get all estimates (all projects)
router.get('/all', controller.getAllEstimates);

// Get latest estimate for a project
router.get('/latest/:projectId', controller.getLatestEstimate);

export default router;
