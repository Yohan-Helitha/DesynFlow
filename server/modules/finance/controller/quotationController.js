import Quotation from '../model/quotation_estimation.js';
import Material from '../model/material.js';
import SupplierMaterialCatalog from '../model/supplier_material_catalog.js';

// Create a new quotation (version 1)
export const createQuotation = async (req, res) => {
  try {
    const { projectId, estimateVersion, laborItems, materialItems, serviceItems, contingencyItems, taxes, remarks, fileUrl, createdBy } = req.body;
    // Find latest version for this project/estimate
    const latest = await Quotation.findOne({ projectId, estimateVersion }).sort({ version: -1 });
    const version = latest ? latest.version + 1 : 1;
    // Calculate totals
    const subtotal = calcSubtotal(laborItems, materialItems, serviceItems);
    const totalContingency = calcContingency(contingencyItems);
    const totalTax = calcTax(taxes);
    const grandTotal = subtotal + totalContingency + totalTax;
    const quotation = await Quotation.create({
      projectId,
      estimateVersion,
      version,
      status: 'Draft',
      locked: false,
      remarks,
      createdBy,
      laborItems,
      materialItems,
      serviceItems,
      contingencyItems,
      taxes,
      subtotal,
      totalContingency,
      totalTax,
      grandTotal,
      fileUrl
    });
    res.status(201).json(quotation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Revise (new version)
export const reviseQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const { laborItems, materialItems, serviceItems, contingencyItems, taxes, remarks, updatedBy } = req.body;
    const old = await Quotation.findById(quotationId);
    if (!old) return res.status(404).json({ error: 'Quotation not found' });
    if (old.locked) return res.status(400).json({ error: 'Quotation is locked' });
    const version = old.version + 1;
    const subtotal = calcSubtotal(laborItems, materialItems, serviceItems);
    const totalContingency = calcContingency(contingencyItems);
    const totalTax = calcTax(taxes);
    const grandTotal = subtotal + totalContingency + totalTax;
    const newQuotation = await Quotation.create({
      projectId: old.projectId,
      estimateVersion: old.estimateVersion,
      version,
      status: 'Revised',
      locked: false,
      remarks,
      createdBy: old.createdBy,
      updatedBy,
      laborItems,
      materialItems,
      serviceItems,
      contingencyItems,
      taxes,
      subtotal,
      totalContingency,
      totalTax,
      grandTotal,
      fileUrl: old.fileUrl
    });
    res.status(201).json(newQuotation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send quotation (update status, sentTo, sentAt)
export const sendQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const { sentTo } = req.body;
    const sentAt = new Date();
    const updated = await Quotation.findByIdAndUpdate(
      quotationId,
      { status: 'Sent', sentTo, sentAt },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View quotation details
export const getQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const quotation = await Quotation.findById(quotationId)
      .populate('materialItems.materialId')
      .populate('createdBy updatedBy sentTo');
    if (!quotation) return res.status(404).json({ error: 'Not found' });
    res.json(quotation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch all versions for a project (optionally filter by estimateVersion)
export const getQuotationVersions = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { estimateVersion, status } = req.query;
    const filter = { projectId };
    if (estimateVersion) filter.estimateVersion = estimateVersion;
    if (status) filter.status = status;
    const versions = await Quotation.find(filter).sort({ version: 1 });
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lock/confirm quotation
export const lockQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const updated = await Quotation.findByIdAndUpdate(
      quotationId,
      { status: 'Confirmed', locked: true },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update editable fields (if not locked)
export const updateQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const { laborItems, materialItems, serviceItems, contingencyItems, taxes, remarks, updatedBy } = req.body;
    const quotation = await Quotation.findById(quotationId);
    if (!quotation) return res.status(404).json({ error: 'Not found' });
    if (quotation.locked) return res.status(400).json({ error: 'Quotation is locked' });
    // Recalculate totals
    quotation.laborItems = laborItems;
    quotation.materialItems = materialItems;
    quotation.serviceItems = serviceItems;
    quotation.contingencyItems = contingencyItems;
    quotation.taxes = taxes;
    quotation.remarks = remarks;
    quotation.updatedBy = updatedBy;
    quotation.subtotal = calcSubtotal(laborItems, materialItems, serviceItems);
    quotation.totalContingency = calcContingency(contingencyItems);
    quotation.totalTax = calcTax(taxes);
    quotation.grandTotal = quotation.subtotal + quotation.totalContingency + quotation.totalTax;
    await quotation.save();
    res.json(quotation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Utility functions
function calcSubtotal(laborItems, materialItems, serviceItems) {
  const labor = (laborItems || []).reduce((sum, i) => sum + (i.total || 0), 0);
  const material = (materialItems || []).reduce((sum, i) => sum + (i.total || 0), 0);
  const service = (serviceItems || []).reduce((sum, i) => sum + (i.cost || 0), 0);
  return labor + material + service;
}
function calcContingency(contingencyItems) {
  return (contingencyItems || []).reduce((sum, i) => sum + (i.amount || 0), 0);
}
function calcTax(taxes) {
  return (taxes || []).reduce((sum, i) => sum + (i.amount || 0), 0);
}
