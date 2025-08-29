import Project from '../model/project.model.js';
import Team from '../model/team.model.js';

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
  return await Project.find().populate('projectManagerId clientId assignedTeamId milestones');
};

export const getProjectByIdService = async (id) => {
  return await Project.findById(id).populate('projectManagerId clientId assignedTeamId milestones');
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