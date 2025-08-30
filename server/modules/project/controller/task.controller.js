import {
  createTaskService,
  getTasksByProjectService,
  updateTaskStatusService
} from '../service/task.service.js';

// Create a new task (assign to team or member)
export const createTask = async (req, res) => {
  try {
    const taskData = req.body;
    const newTask = await createTaskService(taskData);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

// Get all tasks for a project
export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await getTasksByProjectService(projectId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

// Update task status and completion percentage
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progressPercentage } = req.body;
    const updatedTask = await updateTaskStatusService(id, status, progressPercentage);
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};
