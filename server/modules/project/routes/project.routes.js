import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} from '../controller/project.controller.js';

const router = express.Router();

// Create a new project
router.post('/projects', createProject);

// Get all projects
router.get('/projects', getProjects);

// Get a single project by ID
router.get('/projects/:id', getProjectById);

// Update a project
router.put('/projects/:id', updateProject);

// Delete a project
router.delete('/projects/:id', deleteProject);

export default router;