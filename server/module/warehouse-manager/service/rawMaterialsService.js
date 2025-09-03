import RawMaterials from '../model/rawMaterialsModel.js';
import AuditLog from '../model/auditLogModel.js';
import ThresholdAlert from '../model/thresholdAlertModel.js';
//import { validateRawMaterialsInsert, validateRawMaterialsUpdate } from '../validators/rawMaterialsValidator.js';

// Get all raw materials
export const getAllRawMaterialsService = async () => {
    return await RawMaterials.find();
};

// Get single manufactured product by ID
export const getRawMaterialByIdService = async (id) => {
  return await RawMaterials.findById(id);
};

// Add new raw material
export const addRawMaterialsService = async (data, userId) => {
    // Validate insert data
    // const errors = validateRawMaterialsInsert(data);
    // if (errors.length > 0) {
    //     const error = new Error("Validation failed");
    //     error.status = 400;
    //     error.errors = errors;
    //     throw error;
    // }

    // Set currentLevel = restockLevel automatically
    data.currentLevel = data.restockLevel;

    const now = new Date();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const raw_materials = new RawMaterials({
        ...data,
        month: monthNames[now.getMonth()],
        year: now.getFullYear(),
        createdBy: userId || "WM001"
    });

    await raw_materials.save();

    await AuditLog.create({
        entity: "Raw Materials",
        action: "insert",
        keyInfo: JSON.stringify(raw_materials),
        createdBy: userId || "WM001"
    });

    return raw_materials;
};

// Update raw material
export const updateRawMaterialsService = async (id, data, userId) => {
    // Validate update data
    // const errors = validateRawMaterialsUpdate(data);
    // if (errors.length > 0) {
    //     const error = new Error("Validation failed");
    //     error.status = 400;
    //     error.errors = errors;
    //     throw error;
    // }

    let raw_materials = await RawMaterials.findByIdAndUpdate(id, data, { new: true });
    if (!raw_materials) return null;

    await raw_materials.save();

    await AuditLog.create({
        entity: "Raw Materials",
        action: "update",
        keyInfo: JSON.stringify(raw_materials),
        createdBy: userId || "WM001"
    });

    if (data.currentLevel <= raw_materials.restockLevel) {
        const existingAlert = await ThresholdAlert.findOne({
            materialId: raw_materials.materialId,
            inventoryId: raw_materials.inventoryId,
            status: "Pending"
        });

        if (!existingAlert) {
            await ThresholdAlert.create({
                materialId: raw_materials.materialId,
                materialName: raw_materials.materialName,
                currentLevel: raw_materials.currentLevel,
                restockLevel: raw_materials.restockLevel,
                inventoryId: raw_materials.inventoryId,
                inventoryName: raw_materials.inventoryName || "Unknown"
            });
        }
    }

    return raw_materials;
};

// Delete raw material
export const deleteRawMaterialsService = async (id, userId) => {
    const raw_materials = await RawMaterials.findByIdAndDelete(id);
    if (!raw_materials) return null;

    await AuditLog.create({
        entity: "Raw Materials",
        action: "delete",
        keyInfo: `MaterialId: ${raw_materials.materialId}, qty: ${raw_materials.currentLevel}, inventory: ${raw_materials.inventoryId}`,
        createdBy: userId || "WM001"
    });

    return raw_materials;
};
