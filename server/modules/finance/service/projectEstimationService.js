import ProjectEstimation from '../model/project_estimation.js';
import { Project } from '../model/project.js';

// Get only Approved estimations
async function getApprovedEstimates() {
  return ProjectEstimation.find({ status: 'Approved' }).sort({ version: -1 });
}

async function resolveProject(projectId) {
  // Try direct _id match first
  let project = await Project.findById(projectId);
  if (!project) {
    // Fallback: maybe client passed custom projectId field value (stored in projectId field)
    project = await Project.findOne({ projectId });
  }
  return project;
}

async function createOrUpdateEstimate({ projectId, laborCost, materialCost, serviceCost, contingencyCost, status }) {
  const project = await resolveProject(projectId);
  if (!project) {
    throw new Error('Project not found for provided projectId');
  }
  const realProjectId = project._id;
  const latest = await ProjectEstimation.findOne({ projectId: realProjectId }).sort({ version: -1 });
  const version = latest ? latest.version + 1 : 1;
  const estimate = new ProjectEstimation({
    projectId: realProjectId,
    laborCost,
    materialCost,
    serviceCost,
    contingencyCost,
    version,
    status: status || 'Pending'
  });
  await estimate.save();
  if (!project.estimateCreated) {
    await Project.updateOne({ _id: realProjectId }, { estimateCreated: true });
  }
  return estimate;
}

async function setStatus(estimateId, status) {
  const allowed = ['Pending', 'Approved', 'Rejected'];
  if (!allowed.includes(status)) throw new Error('Invalid status');
  const estimate = await ProjectEstimation.findByIdAndUpdate(
    estimateId,
    { status },
    { new: true }
  );
  return estimate;
}

async function getEstimatesByProject(projectId) {
  return ProjectEstimation.find({ projectId }).sort({ version: -1 });
}

async function getAllEstimates() {
  return ProjectEstimation.find();
}

async function getLatestEstimate(projectId) {
  return ProjectEstimation.findOne({ projectId }).sort({ version: -1 });
}

export {
  createOrUpdateEstimate,
  setStatus,
  getEstimatesByProject,
  getAllEstimates,
  getLatestEstimate,
  getApprovedEstimates
};
