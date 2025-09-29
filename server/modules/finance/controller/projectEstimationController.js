
import * as projectEstimationService from '../service/projectEstimationService.js';
import mongoose from 'mongoose';
import Project from '../../project/model/project.model.js';
import InspectionRequest from '../../auth/model/inspectionRequest.model.js';


async function getApprovedEstimates(req, res) {
  try {
    const estimates = await projectEstimationService.getApprovedEstimates();
    res.json(estimates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createOrUpdateEstimate(req, res) {
  try {
    const { projectId, laborCost, materialCost, serviceCost, contingencyCost, status } = req.body;
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
    const estimate = await projectEstimationService.createOrUpdateEstimate({ projectId, laborCost: lc, materialCost: mc, serviceCost: sc, contingencyCost: cc, status });
    res.status(201).json(estimate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateEstimateStatus(req, res) {
  try {
    const { estimateId } = req.params;
    const { status } = req.body;
    const updated = await projectEstimationService.setStatus(estimateId, status);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getEstimatesByProject(req, res) {
  try {
    const { projectId } = req.params;
    const estimates = await projectEstimationService.getEstimatesByProject(projectId);
    res.json(estimates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAllEstimates(req, res) {
  try {
    const estimates = await projectEstimationService.getAllEstimates();
    res.json(estimates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getLatestEstimate(req, res) {
  try {
    const { projectId } = req.params;
    const estimate = await projectEstimationService.getLatestEstimate(projectId);
    res.json(estimate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getProjectsWithInspections(req, res) {
  try {
    // Get all projects with inspection data, focusing on projects without estimates created
    const projects = await Project.find({ estimateCreated: false })
      .populate({
        path: 'inspectionId',
        model: 'InspectionRequest',
        select: 'clientName email phone siteLocation propertyType floors status assignedInspectorId createdAt'
      })
      .populate('projectManagerId', 'name email')
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });

    // Filter out projects without valid inspection data
    const validProjects = projects.filter(project => project.inspectionId);

    res.json(validProjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export {
  createOrUpdateEstimate,
  updateEstimateStatus,
  getEstimatesByProject,
  getAllEstimates,
  getLatestEstimate,
  getApprovedEstimates,
  getProjectsWithInspections
};
