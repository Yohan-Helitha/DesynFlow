import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getClientProjects,
  getClientProjectById
} from '../controller/project.controller.js';
import { authMiddleware } from '../../auth/middleware/authMiddleware.js';

const router = express.Router();

// Create a new project (validation handles file upload requirement)
router.post('/projects', createProject);

// Get all projects
router.get('/projects', getProjects);

// Get a single project by ID
router.get('/projects/:id', getProjectById);

// Update a project
router.put('/projects/:id', updateProject);

// Delete a project
router.delete('/projects/:id', deleteProject);

// Client-specific routes (authenticated)
router.get('/client/projects', authMiddleware, getClientProjects);
router.get('/client/projects/:id', authMiddleware, getClientProjectById);

export default router;