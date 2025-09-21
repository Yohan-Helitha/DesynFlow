import MaterialRequestService from '../service/materialRequest.service.js';

// Create a new material request
export const createMaterialRequest = async (req, res) => {
  try {
    const request = await MaterialRequestService.createMaterialRequest(req.body);
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Edit a material request
export const updateMaterialRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await MaterialRequestService.updateMaterialRequest(id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a material request
export const deleteMaterialRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await MaterialRequestService.deleteMaterialRequest(id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all requests for a project
export const getMaterialRequestsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const requests = await MaterialRequestService.getMaterialRequestsByProject(projectId);
    res.json(requests);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
