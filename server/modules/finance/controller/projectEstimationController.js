import * as projectEstimationService from '../service/projectEstimationService.js';

// Create a new project estimate (version 1 or new version)
export async function createOrUpdateEstimate(req, res) {
  try {
    const { projectId, laborCost, materialCost, serviceCost, contingencyCost } = req.body;
    const estimate = await projectEstimationService.createOrUpdateEstimate({ projectId, laborCost, materialCost, serviceCost, contingencyCost });
    res.status(201).json(estimate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Retrieve all estimates for a project (version history)
export async function getEstimatesByProject(req, res) {
  try {
    const { projectId } = req.params;
    const estimates = await projectEstimationService.getEstimatesByProject(projectId);
    res.json(estimates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Display all estimates (all projects)
export async function getAllEstimates(req, res) {
  try {
    const estimates = await projectEstimationService.getAllEstimates();
    res.json(estimates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get latest estimate for a project
export async function getLatestEstimate(req, res) {
  try {
    const { projectId } = req.params;
    const estimate = await projectEstimationService.getLatestEstimate(projectId);
    res.json(estimate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
