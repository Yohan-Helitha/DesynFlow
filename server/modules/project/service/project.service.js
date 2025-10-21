import Project from '../model/project.model.js';
import Team from '../model/team.model.js';
import Task from '../model/task.model.js';

export const createProject = async (projectName, clientId, inspectionId) => {

  const availableTeam = await Team.findOne({ active: true });
  let status = "On Hold";
  let assignedTeamId = null;

  if (availableTeam) {
    status = 'Active';
    assignedTeamId = availableTeam._id;
  }

  const newProject = new Project({
    projectName,
    clientId,
    inspectionId,
    assignedTeamId,
    status
  });

  await newProject.save();
  return newProject;

};

export const getProjectsService = async () => {
  return await Project.find().populate('assignedTeamId milestones');
};

export const getProjectByIdService = async (id) => {
  return await Project.findById(id).populate('assignedTeamId milestones');
};

export const updateProjectService = async (id, updateData) => {
  if (updateData.assignedTeamId) {
    updateData.status = 'Active';
  } else {
    updateData.status = 'On Hold';
  }
  return await Project.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteProjectService = async (id) => {
  return await Project.findByIdAndDelete(id);
};

// Calculate and update project progress based on completed tasks
export const updateProjectProgressService = async (projectId) => {
  try {
    console.log('🔄 updateProjectProgressService called for project:', projectId);
    
    // Get all tasks for this project
    const tasks = await Task.find({ projectId });
    console.log('📋 Found tasks:', tasks.length, 'for project');
    
    if (tasks.length === 0) {
      // No tasks, set progress to 0
      console.log('❌ No tasks found, setting progress to 0');
      await Project.findByIdAndUpdate(projectId, { progress: 0 });
      return 0;
    }
    
    // Log each task's status and weight for debugging
    tasks.forEach((task, index) => {
      console.log(`📝 Task ${index + 1}: "${task.name}" - Status: ${task.status}, Weight: ${task.weight}`);
    });
    
    // Calculate total weight and completed weight
    const totalWeight = tasks.reduce((sum, task) => sum + (task.weight || 0), 0);
    const completedWeight = tasks
      .filter(task => task.status === 'Done' || task.status === 'Completed')
      .reduce((sum, task) => sum + (task.weight || 0), 0);
    
    console.log('⚖️ Weight calculation:', {
      totalWeight,
      completedWeight,
      completedTasks: tasks.filter(task => task.status === 'Done' || task.status === 'Completed').length
    });
    
    // Calculate progress percentage
    const progress = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
    console.log('📊 Calculated progress:', progress + '%');
    
    // Determine new status based on tasks and progress
    let newStatus;
    const project = await Project.findById(projectId);
    
    if (tasks.length > 0 && progress === 100) {
      // All tasks completed
      newStatus = 'Completed';
    } else if (tasks.length > 0 && project.status === 'Active') {
      // Has tasks but not all completed, change from Active to In Progress
      newStatus = 'In Progress';
    } else if (tasks.length > 0) {
      // Has tasks, keep current status if already In Progress
      newStatus = project.status === 'Active' ? 'In Progress' : project.status;
    } else {
      // No tasks, keep current status
      newStatus = project.status;
    }
    
    console.log('🔄 Status update:', {
      currentStatus: project.status,
      newStatus,
      progress
    });
    
    // Update project progress and status
    await Project.findByIdAndUpdate(projectId, { 
      progress,
      status: newStatus
    });
    
    console.log('✅ Project updated successfully with progress:', progress + '%', 'and status:', newStatus);
    
    return progress;
  } catch (error) {
    console.error('Error updating project progress:', error);
    return null;
  }
};