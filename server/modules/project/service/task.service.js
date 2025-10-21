import Task from '../model/task.model.js';
import Team from '../model/team.model.js';
import ProgressUpdate from '../model/progressupdate.model.js';
import { updateProjectProgressService } from './project.service.js';

// Create a new task
export const createTaskService = async (taskData) => {
  const newTask = new Task(taskData);
  await newTask.save();
  
  // Update project progress and status when a new task is created
  if (newTask.projectId) {
    await updateProjectProgressService(newTask.projectId);
  }
  
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
  console.log('🔄 updateTaskStatusService called:', { taskId, status, progressPercentage });
  
  const update = { status };
  if (progressPercentage !== undefined) update.progressPercentage = progressPercentage;
  if (status === 'Done' || status === 'Completed') update.completedAt = new Date();
  
  const updatedTask = await Task.findByIdAndUpdate(taskId, update, { new: true });
  console.log('✅ Task updated:', updatedTask.name, 'to status:', updatedTask.status);
  
  // Update project progress when task status changes
  if (updatedTask && updatedTask.projectId) {
    console.log('🔄 Calling updateProjectProgressService for project:', updatedTask.projectId);
    await updateProjectProgressService(updatedTask.projectId);
  }
  
  return updatedTask;
};

// Update a task
export const updateTaskService = async (taskId, updateData) => {
  const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true });
  
  // Update project progress if status was changed
  if (updatedTask && updatedTask.projectId && updateData.status) {
    await updateProjectProgressService(updatedTask.projectId);
  }
  
  return updatedTask;
};

// Delete a task
export const deleteTaskService = async (taskId) => {
  return await Task.findByIdAndDelete(taskId);
};

// Block task with issue tracking and create progress update
export const blockTaskWithIssueService = async (taskId, issueDescription, blockedBy) => {
  try {
    // Find the task first
    const task = await Task.findById(taskId);
    if (!task) {
      return { success: false, message: 'Task not found' };
    }

    // Create progress update with flagged issue
    const progressUpdate = new ProgressUpdate({
      projectId: task.projectId,
      submittedBy: blockedBy,
      summary: `Task blocked: ${task.name}`,
      flaggedIssues: [{
        description: issueDescription,
        flaggedAt: new Date(),
        resolved: false
      }]
    });

    await progressUpdate.save();

    // Update task with block details
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        status: 'Blocked',
        'blockDetails.isBlocked': true,
        'blockDetails.blockedAt': new Date(),
        'blockDetails.blockedBy': blockedBy,
        'blockDetails.issueDescription': issueDescription,
        'blockDetails.progressUpdateId': progressUpdate._id
      },
      { new: true }
    );

    // Update project progress
    if (updatedTask.projectId) {
      await updateProjectProgressService(updatedTask.projectId);
    }

    return {
      success: true,
      task: updatedTask,
      progressUpdate: progressUpdate
    };
  } catch (error) {
    console.error('Error in blockTaskWithIssueService:', error);
    return { success: false, message: 'Error blocking task', error: error.message };
  }
};

// Add comment to task
export const addTaskCommentService = async (taskId, content, author) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        $push: {
          comments: {
            author: author,
            content: content,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );
    
    return updatedTask;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Add attachment to task
export const addTaskAttachmentService = async (taskId, attachmentData) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        $push: {
          attachments: {
            ...attachmentData,
            uploadedAt: new Date()
          }
        }
      },
      { new: true }
    );
    
    return updatedTask;
  } catch (error) {
    console.error('Error adding attachment:', error);
    throw error;
  }
};
