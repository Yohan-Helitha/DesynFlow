
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
    const { status, remarks } = req.body;
    const userId = req.user ? req.user._id : null; // Get user from auth middleware
    const updated = await projectEstimationService.setStatus(estimateId, status, remarks, userId);
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
    // Get projects without estimations created yet. We'll include those whose linked inspection request is completed.
    // Select projects that are Active and have no estimate created yet (first-time estimations)
    const projects = await Project.find({ estimateCreated: false, status: 'Active' })
      .populate({
        path: 'inspectionId',
        model: 'InspectionRequest',
        // Include both client_name and email, plus address/city and status for site location and inspection status
        select: 'client_name email propertyLocation_address propertyLocation_city propertyType status createdAt',
      })
      .populate('projectManagerId', 'name email')
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });

    // Filter projects where the linked inspection has status 'completed' (case-insensitive).
    // Be tolerant: if inspection is not populated but an ObjectId exists, attempt to fetch it.
    const validProjects = [];
    for (const p of projects) {
      let inspection = p.inspectionId;

      // If inspectionId is just an ObjectId, try to fetch the inspection doc explicitly
      if (inspection && inspection._bsontype === 'ObjectID') {
        try {
          inspection = await InspectionRequest.findById(inspection).select('client_name email propertyLocation_address propertyLocation_city propertyType status createdAt').lean();
        } catch (e) {
          inspection = null;
        }
      }

  // Now only include projects that are Active (we already filtered in DB). Keep inspection if present.

      const i = inspection || {};
      const address = i.propertyLocation_address || '';
      const city = i.propertyLocation_city || '';
      const siteLocation = address && city ? `${address}, ${city}` : (address || city || undefined);

      validProjects.push({
        ...(p.toObject ? p.toObject() : p),
        inspectionId: {
          ...(i.toObject ? i.toObject() : i),
          client_name: i.client_name || i.email, // fallback to email if name missing
          siteLocation // for convenience if frontend wants a single string
        }
      });
    }

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
