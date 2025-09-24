import express from 'express';
import {
  createTask,
  getAllTasks,
  getTasksByProject,
  updateTaskStatus
} from '../controller/task.controller.js';

const router = express.Router();

// Get all tasks
router.get('/tasks', getAllTasks);

// Create a new task (assign to team or member)
router.post('/tasks', createTask);

// Get all tasks for a project
router.get('/tasks/project/:projectId', getTasksByProject);

// Update task status and completion percentage
router.put('/tasks/:id', updateTaskStatus);

export default router;
