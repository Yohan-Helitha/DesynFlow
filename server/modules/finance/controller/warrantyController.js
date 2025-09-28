import * as warrantyService from '../service/warrantyService.js';

// POST /api/warranties
export const createWarranty = async (req, res) => {
  try {
    const { projectId, itemId, clientId, startDate, duration } = req.body;
    const warranty = await warrantyService.createWarranty({ projectId, itemId, clientId, startDate, duration });
    res.status(201).json(warranty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/warranties
export const getWarranties = async (req, res) => {
  try {
    const { clientId, projectId, itemId, status } = req.query;
    const warranties = await warrantyService.getWarranties({ clientId, projectId, itemId, status });
    res.json(warranties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/warranties/all - Enhanced route for frontend table with populated data
export const getAllWarrantiesWithDetails = async (req, res) => {
  try {
    const { status } = req.query; // Optional status filter (Active, Expired, etc.)
    const filter = {};
    if (status) filter.status = status;
    
    const warranties = await warrantyService.getWarranties(filter);
    res.json(warranties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/warranties/:id
export const getWarrantyById = async (req, res) => {
  try {
    const warranty = await warrantyService.getWarrantyById(req.params.id);
    if (!warranty) return res.status(404).json({ error: 'Not found' });
    res.json(warranty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/warranties/:id
export const updateWarranty = async (req, res) => {
  try {
    const warranty = await warrantyService.updateWarranty(req.params.id, req.body);
    if (!warranty) return res.status(404).json({ error: 'Not found' });
    res.json(warranty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/warranties/:id
export const deleteWarranty = async (req, res) => {
  try {
    const result = await warrantyService.deleteWarranty(req.params.id);
    res.json({ success: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/warranties/:id/status
export const getWarrantyStatus = async (req, res) => {
  try {
    const status = await warrantyService.getWarrantyStatus(req.params.id);
    res.json({ status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/projects/:id/warranties
export const getProjectWarranties = async (req, res) => {
  try {
    const warranties = await warrantyService.getWarranties({ projectId: req.params.id });
    res.json(warranties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/items/:id/warranty-details
export const getItemWarrantyDetails = async (req, res) => {
  try {
    const details = await warrantyService.getItemWarrantyDetails(req.params.id);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/clients/:id/warranties
export const getClientWarranties = async (req, res) => {
  try {
    const warranties = await warrantyService.getWarranties({ clientId: req.params.id });
    res.json(warranties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
