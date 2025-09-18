import Quotation from '../model/quotation_estimation.js';

// Create a new quotation (version 1 or new version)
export const createQuotation = async (data) => {
  const { projectId, estimateVersion } = data;
  const latest = await Quotation.findOne({ projectId, estimateVersion }).sort({ version: -1 });
  const version = latest ? latest.version + 1 : 1;
  // Calculate totals
  const subtotal = calcSubtotal(data.laborItems, data.materialItems, data.serviceItems);
  const totalContingency = calcContingency(data.contingencyItems);
  const totalTax = calcTax(data.taxes);
  const grandTotal = subtotal + totalContingency + totalTax;
  return Quotation.create({ ...data, version, subtotal, totalContingency, totalTax, grandTotal });
};

// Revise (new version)
export const reviseQuotation = async (quotationId, data) => {
  const old = await Quotation.findById(quotationId);
  if (!old) throw new Error('Quotation not found');
  if (old.locked) throw new Error('Quotation is locked');
  const version = old.version + 1;
  const subtotal = calcSubtotal(data.laborItems, data.materialItems, data.serviceItems);
  const totalContingency = calcContingency(data.contingencyItems);
  const totalTax = calcTax(data.taxes);
  const grandTotal = subtotal + totalContingency + totalTax;
  return Quotation.create({
    ...data,
    projectId: old.projectId,
    estimateVersion: old.estimateVersion,
    version,
    status: 'Revised',
    createdBy: old.createdBy,
    updatedBy: data.updatedBy,
    subtotal,
    totalContingency,
    totalTax,
    grandTotal,
    fileUrl: old.fileUrl
  });
};

// Send quotation (update status, sentTo, sentAt)
export const sendQuotation = async (quotationId, sentTo) => {
  return Quotation.findByIdAndUpdate(
    quotationId,
    { status: 'Sent', sentTo, sentAt: new Date() },
    { new: true }
  );
};

// View quotation details
export const getQuotation = async (quotationId) => {
  return Quotation.findById(quotationId)
    .populate('materialItems.materialId')
    .populate('createdBy updatedBy sentTo');
};

// Fetch all versions for a project (optionally filter by estimateVersion)
export const getQuotationVersions = async (projectId, { estimateVersion, status }) => {
  const filter = { projectId };
  if (estimateVersion) filter.estimateVersion = estimateVersion;
  if (status) filter.status = status;
  return Quotation.find(filter).sort({ version: 1 });
};

// Lock/confirm quotation
export const lockQuotation = async (quotationId) => {
  return Quotation.findByIdAndUpdate(
    quotationId,
    { status: 'Confirmed', locked: true },
    { new: true }
  );
};

// Update editable fields (if not locked)
export const updateQuotation = async (quotationId, data) => {
  const quotation = await Quotation.findById(quotationId);
  if (!quotation) throw new Error('Not found');
  if (quotation.locked) throw new Error('Quotation is locked');
  quotation.laborItems = data.laborItems;
  quotation.materialItems = data.materialItems;
  quotation.serviceItems = data.serviceItems;
  quotation.contingencyItems = data.contingencyItems;
  quotation.taxes = data.taxes;
  quotation.remarks = data.remarks;
  quotation.updatedBy = data.updatedBy;
  quotation.subtotal = calcSubtotal(data.laborItems, data.materialItems, data.serviceItems);
  quotation.totalContingency = calcContingency(data.contingencyItems);
  quotation.totalTax = calcTax(data.taxes);
  quotation.grandTotal = quotation.subtotal + quotation.totalContingency + quotation.totalTax;
  await quotation.save();
  return quotation;
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
