import express from 'express';
import {
  createTask,
  getAllTasks,
  getTasksByProject,
  getTaskById,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getTeamMembers
} from '../controller/task.controller.js';

const router = express.Router();

// Create a new task
router.post('/tasks', createTask);

// Get all tasks
router.get('/tasks', getAllTasks);

// Get all tasks for a project
router.get('/tasks/project/:projectId', getTasksByProject);

// Get a single task by ID
router.get('/tasks/:id', getTaskById);

// Update task (full update)
router.put('/tasks/:id', updateTask);

// Update task status only
router.patch('/tasks/:id/status', updateTaskStatus);

// Delete a task
router.delete('/tasks/:id', deleteTask);

// Get team members for assignment dropdown
router.get('/team-members/:leaderId', getTeamMembers);

export default router;
