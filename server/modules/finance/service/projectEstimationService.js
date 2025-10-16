import ProjectEstimation from '../model/project_estimation.js';
import Project from '../../project/model/project.model.js';

// Get only Approved estimations
async function getApprovedEstimates() {
  const estimations = await ProjectEstimation.find({ status: 'Approved' })
    .populate('projectId', 'projectName status progress')
    .populate('createdBy', 'name email')
    .populate('lastQuotationId', '_id version status')
    .sort({ createdAt: -1, version: -1 });
    
  console.log('[estimations] Found approved estimations:', estimations.map(e => ({
    id: e._id,
    project: e.projectId?.projectName || e.projectId?._id,
    version: e.version,
    quotationCreated: e.quotationCreated,
    lastQuotationId: e.lastQuotationId?._id
  })));
  
  return estimations;
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
  return ProjectEstimation.find()
    .populate('projectId', 'projectName')
    .sort({ createdAt: -1 });
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
