import Task from '../model/task.model.js';
import Team from '../model/team.model.js';

// Create a new task
export const createTaskService = async (taskData) => {
  const newTask = new Task(taskData);
  await newTask.save();
  return newTask;
};

// Get all tasks (without population for now due to User model not available)
export const getAllTasksService = async () => {
  return await Task.find().sort({ createdAt: -1 });
};

// Get all tasks for a project
export const getTasksByProjectService = async (projectId) => {
  return await Task.find({ projectId }).sort({ createdAt: -1 });
};

// Get a single task by ID
export const getTaskByIdService = async (taskId) => {
  return await Task.findById(taskId);
};

// Update task status and completion percentage
export const updateTaskStatusService = async (taskId, status, progressPercentage) => {
  const update = { status };
  if (progressPercentage !== undefined) update.progressPercentage = progressPercentage;
  if (status === 'Done') update.completedAt = new Date();
  return await Task.findByIdAndUpdate(taskId, update, { new: true });
};

// Update a task
export const updateTaskService = async (taskId, updateData) => {
  return await Task.findByIdAndUpdate(taskId, updateData, { new: true });
};

// Delete a task
export const deleteTaskService = async (taskId) => {
  return await Task.findByIdAndDelete(taskId);
};
