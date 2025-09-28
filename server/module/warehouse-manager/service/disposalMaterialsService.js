import DisposalMaterials from '../model/disposalMaterialsModel.js';
import AuditLog from '../model/auditLogModel.js';
import { validateDisposalMaterialUpdate } from '../validators/disposalMaterialsValidator.js';

// Get all disposal materials
export const getAllDisposalMaterialsService = async () => {
  return await DisposalMaterials.find();
};

// Get single disposal material by ID
export const getDisposalMaterialsByIdService = async (id) => {
  return await DisposalMaterials.findById(id);
};

export const getDisposalRecordByIdService = async (id) => {
  return await DisposalMaterials.findById(id);
};

// Add new disposal material
export const addDisposalMaterialsService = async (data, createdBy, approvedBy) => {
  const { materialId, materialName, inventoryName, quantity, unit, reasonOfDisposal } = data;

  const disposal_materials = new DisposalMaterials({
    materialId,
    materialName,
    inventoryName,
    quantity,
    unit,
    requestedBy: createdBy || "Lakni",
    reasonOfDisposal,
    approvedBy: approvedBy || "Ranepura"
  });

  await disposal_materials.save();

  // Convert Mongoose document to plain object (if needed)
const dispose_Data = disposal_materials.toObject ? disposal_materials.toObject() : disposal_materials;

// Pick only the relevant fields dynamically based on your schema
const keyInfo = {
    DisposalID: dispose_Data.disposalId,
    MaterialID: dispose_Data.materialId,
    MaterialName: dispose_Data.materialName,
    InventoryName: dispose_Data.inventoryName,
    Quantity: dispose_Data.quantity,
    Unit: dispose_Data.unit,
    RequestedBy: dispose_Data.requestedBy,
    ReasonOfDisposal: dispose_Data.reasonOfDisposal,
    ApprovedBy: dispose_Data.approvedBy
};

  await AuditLog.create({
    entity: "Disposal Material",
    action: "insert",
    keyInfo: JSON.stringify(keyInfo),
    createdBy: createdBy || "Lakni"
  });

  return disposal_materials;
};

// Update disposal material
export const updateDisposalMaterialsService = async (id, data, updatedBy) => {
//Validate update fields
   const errors = validateDisposalMaterialUpdate(data);
    if (Object.keys(errors).length > 0) {
        throw { status: 400, errors };
    }

  const disposal_materials = await DisposalMaterials.findByIdAndUpdate(id, data, { new: true });

  if (!disposal_materials) return null;

  // Convert Mongoose document to plain object (if needed)
const dispose_Data = disposal_materials.toObject ? disposal_materials.toObject() : disposal_materials;

// Pick only the relevant fields dynamically based on your schema
const keyInfo = {
    DisposalID: dispose_Data.disposalId,
    MaterialID: dispose_Data.materialId,
    MaterialName: dispose_Data.materialName,
    InventoryName: dispose_Data.inventoryName,
    Quantity: dispose_Data.quantity,
    Unit: dispose_Data.unit,
    RequestedBy: dispose_Data.requestedBy,
    ReasonOfDisposal: dispose_Data.reasonOfDisposal,
    ApprovedBy: dispose_Data.approvedBy
};

  await AuditLog.create({
    entity: "Disposal Material",
    action: "update",
    keyInfo: JSON.stringify(keyInfo),
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
    keyInfo: JSON.stringify(keyInfo),
  });

  return disposal_materials;
};
