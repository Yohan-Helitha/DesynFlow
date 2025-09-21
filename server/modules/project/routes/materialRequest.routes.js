import express from 'express';
import {
  createMaterialRequest,
  updateMaterialRequest,
  deleteMaterialRequest,
  getMaterialRequestsByProject
} from '../controller/materialRequest.controller.js';

const router = express.Router();

// Create a new material request
router.post('/', createMaterialRequest);

// Edit a material request
router.put('/:id', updateMaterialRequest);

// Delete a material request
router.delete('/:id', deleteMaterialRequest);

// Get all requests for a project
router.get('/project/:projectId', getMaterialRequestsByProject);

export default router;
