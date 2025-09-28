import {
  createTaskService,
  getTasksByProjectService,
  getAllTasksService,
  updateTaskStatusService,
  updateTaskService,
  deleteTaskService,
  getTaskByIdService
} from '../service/task.service.js';
import Team from '../model/team.model.js';

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { projectId, name, description, assignedTo, priority, dueDate, weight } = req.body;

    // Validation
    if (!projectId || !name || !assignedTo) {
      return res.status(400).json({ 
        message: 'Project ID, task name, and assigned member are required' 
      });
    }

    const taskData = {
      projectId,
      name,
      description,
      assignedTo,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      weight: weight || 0,
      status: 'Pending',
      progressPercentage: 0
    };

    const newTask = await createTaskService(taskData);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

// Get all tasks
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await getAllTasksService();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all tasks', error: error.message });
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

// Get a single task by ID
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await getTaskByIdService(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
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
    res.status(500).json({ message: 'Error updating task status', error: error.message });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const updatedTask = await updateTaskService(id, updateData);
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await deleteTaskService(id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

// Get team members for task assignment (for dropdown)
export const getTeamMembers = async (req, res) => {
  try {
    const { leaderId } = req.params;
    
    // Find the team where this leaderId is the leader (without population since User model not available)
    const team = await Team.findOne({ leaderId });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found for this leader' });
    }

    // Return team members with their raw data (no User population)
    const members = team.members.map(member => ({
      userId: member.userId.toString(),
      role: member.role,
      availability: member.availability,
      workload: member.workload
    }));

    res.json({
      teamName: team.teamName,
      members: members
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Error fetching team members', error: error.message });
  }
};
