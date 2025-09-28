import express from 'express';
import {
  createMaterialRequest,
  updateMaterialRequest,
  deleteMaterialRequest,
  getMaterialRequestsByProject,
  getMaterialRequestById
} from '../controller/materialRequest.controller.js';

const router = express.Router();

// Create a new material request
router.post('/material-requests', createMaterialRequest);

// Get all requests for a project
router.get('/material-requests/project/:projectId', getMaterialRequestsByProject);

// Get a single material request by ID
router.get('/material-requests/:id', getMaterialRequestById);

// Edit a material request
router.put('/material-requests/:id', updateMaterialRequest);

// Delete a material request
router.delete('/material-requests/:id', deleteMaterialRequest);

export default router;
