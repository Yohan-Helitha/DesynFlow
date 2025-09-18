import * as projectEstimationService from '../service/projectEstimationService.js';
import mongoose from 'mongoose';

// Create a new project estimate (version 1 or new version)
export async function createOrUpdateEstimate(req, res) {
  try {
    const { projectId, laborCost, materialCost, serviceCost, contingencyCost } = req.body;
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: 'Invalid projectId' });
    }
    // Coerce to numbers (allow 0 as valid)
    const lc = Number(laborCost ?? 0);
    const mc = Number(materialCost ?? 0);
    const sc = Number(serviceCost ?? 0);
    const cc = Number(contingencyCost ?? 0);
    if ([lc, mc, sc, cc].some(n => Number.isNaN(n))) {
      return res.status(400).json({ error: 'Cost fields must be numbers' });
    }
    const estimate = await projectEstimationService.createOrUpdateEstimate({ projectId, laborCost: lc, materialCost: mc, serviceCost: sc, contingencyCost: cc });
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
