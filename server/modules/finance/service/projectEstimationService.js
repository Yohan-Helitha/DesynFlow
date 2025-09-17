import ProjectEstimation from '../model/project_estimation.js';

// Create or update estimate (new version)
export async function createOrUpdateEstimate({ projectId, laborCost, materialCost, serviceCost, contingencyCost }) {
  // Find latest version
  const latest = await ProjectEstimation.findOne({ projectId }).sort({ version: -1 });
  const version = latest ? latest.version + 1 : 1;
  const estimate = new ProjectEstimation({
    projectId,
    laborCost,
    materialCost,
    serviceCost,
    contingencyCost,
    version
    // total will be auto-calculated by pre-save hook
  });
  await estimate.save();
  return estimate;
}

// Get all estimates for a project (version history)
export async function getEstimatesByProject(projectId) {
  return ProjectEstimation.find({ projectId }).sort({ version: -1 });
}

// Get all estimates (all projects)
export async function getAllEstimates() {
  return ProjectEstimation.find();
}

// Get latest estimate for a project
export async function getLatestEstimate(projectId) {
  return ProjectEstimation.findOne({ projectId }).sort({ version: -1 });
}
