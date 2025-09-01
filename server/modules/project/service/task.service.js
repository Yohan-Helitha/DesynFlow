import Task from '../model/task.model.js';
import Team from '../model/team.model.js';

// Assign task to a team or team member
export const createTaskService = async (taskData) => {
  const newTask = new Task(taskData);
  await newTask.save();
  return newTask;
};

// Get all tasks for a project, with status and completion percentage
export const getTasksByProjectService = async (projectId) => {
  return await Task.find({ projectId });
};

// Update task status and completion percentage
export const updateTaskStatusService = async (taskId, status, progressPercentage) => {
  const update = { status };
  if (progressPercentage !== undefined) update.progressPercentage = progressPercentage;
  if (status === 'Done') update.completedAt = new Date();
  return await Task.findByIdAndUpdate(taskId, update, { new: true });
};
