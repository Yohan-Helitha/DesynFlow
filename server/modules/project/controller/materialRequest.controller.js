import MaterialRequestService from '../service/materialRequest.service.js';

// Create a new material request
export const createMaterialRequest = async (req, res) => {
  try {
    const { projectId, requestedBy, items, neededBy, warehouseNote } = req.body;

    // Validation
    if (!projectId || !requestedBy || !items || !Array.isArray(items) || items.length === 0 || !neededBy) {
      return res.status(400).json({ 
        error: 'Project ID, requested by, items array, and needed by date are required' 
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.itemName || !item.qty || item.qty <= 0) {
        return res.status(400).json({ 
          error: 'Each item must have a name and positive quantity' 
        });
      }
    }

    const requestData = {
      projectId,
      requestedBy,
      items,
      neededBy: new Date(neededBy),
      warehouseNote
    };

    const request = await MaterialRequestService.createMaterialRequest(requestData);
    res.status(201).json(request);
  } catch (err) {
    console.error('Material request creation error:', err);
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

// Get a single material request by ID
export const getMaterialRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await MaterialRequestService.getMaterialRequestById(id);
    if (!request) {
      return res.status(404).json({ error: 'Material request not found' });
    }
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
