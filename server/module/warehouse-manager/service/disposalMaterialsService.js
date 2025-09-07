import DisposalMaterials from '../model/disposalMaterialsModel.js';
import AuditLog from '../model/auditLogModel.js';

// Get all disposal materials
export const getAllDisposalMaterialsService = async () => {
  return await DisposalMaterials.find();
};

// Add new disposal material
export const addDisposalMaterialsService = async (data, createdBy, approvedBy) => {
  const { materialId, materialName, inventoryId, quantity, type, reasonOfDisposal } = data;

  const disposal_materials = new DisposalMaterials({
    materialId,
    materialName,
    inventoryId,
    quantity,
    type,
    requestedBy: createdBy || "Lakni",
    reasonOfDisposal,
    approvedBy: approvedBy || "Ranepura"
  });

  await disposal_materials.save();

  await AuditLog.create({
    entity: "Disposal Material",
    action: "insert",
    keyInfo: JSON.stringify(disposal_materials),
    createdBy: createdBy || "Lakni"
  });

  return disposal_materials;
};

// Update disposal material
export const updateDisposalMaterialsService = async (id, data, updatedBy) => {
  const disposal_materials = await DisposalMaterials.findByIdAndUpdate(id, data, { new: true });

  if (!disposal_materials) return null;

  await AuditLog.create({
    entity: "Disposal Material",
    action: "update",
    keyInfo: JSON.stringify(disposal_materials),
    createdBy: updatedBy || "Lakni"
  });

  return disposal_materials;
};

// Delete disposal material
export const deleteDisposalMaterialsService = async (id, deletedBy) => {
  const disposal_materials = await DisposalMaterials.findByIdAndDelete(id);

  if (!disposal_materials) return null;

  await AuditLog.create({
    entity: "Disposal Material",
    action: "delete",
    keyInfo: `MaterialId: ${disposal_materials.materialId}, qty: ${disposal_materials.quantity}, reason: ${disposal_materials.reasonOfDisposal}`,
    createdBy: deletedBy || "Lakni"
  });

  return disposal_materials;
};
