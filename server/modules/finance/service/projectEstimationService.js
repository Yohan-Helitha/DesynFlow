// Get only Approved estimations
async function getApprovedEstimates() {
  return ProjectEstimation.find({ status: 'Approved' }).sort({ version: -1 });
}
import ProjectEstimation from '../model/project_estimation.js';

async function createOrUpdateEstimate({ projectId, laborCost, materialCost, serviceCost, contingencyCost, status }) {
  // Find latest version
  const latest = await ProjectEstimation.findOne({ projectId }).sort({ version: -1 });
  const version = latest ? latest.version + 1 : 1;
  const estimate = new ProjectEstimation({
    projectId,
    laborCost,
    materialCost,
    serviceCost,
    contingencyCost,
    version,
    status: status || 'Pending' // default status
    // total will be auto-calculated by pre-save hook
  });
  await estimate.save();
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
