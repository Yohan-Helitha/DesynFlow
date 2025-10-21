import mongoose from "mongoose";
import RawMaterials from '../model/rawMaterialsModel.js';
import AuditLog from '../model/auditLogModel.js';
import ThresholdAlert from '../model/thresholdAlertModel.js';
import { validateRawMaterialsUpdate } from '../validators/rawMaterialsValidator.js';
import { createRawMaterialReorderLevelNotification } from './notificationService.js';

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
   
    let materialIdToUse = data.materialId;
    
      // If new product, auto-generate materialId
      if (!materialIdToUse) {
        // Use the Counter model inside the same file
        const Counter = mongoose.model("ManuProductsCounter");
    
        const counter = await Counter.findOneAndUpdate(
          {}, 
          { $inc: { seq: 1 } }, 
          { new: true, upsert: true }
        );
    
        const seqNum = counter.seq.toString().padStart(3, "0"); // 001, 002, ...
        materialIdToUse = `RM${seqNum}`;
      }
    


    // Set currentLevel = restockLevel automatically
    data.currentLevel = data.restockLevel;

    

    const raw_materials = new RawMaterials({
        ...data,
        materialId: materialIdToUse,
        createdBy: userId || "WM001"
    });

    await raw_materials.save();

    // Check if the new raw material's current level is at or below reorder level
    if (raw_materials.currentLevel <= raw_materials.reorderLevel) {
        try {
            await createRawMaterialReorderLevelNotification(raw_materials);
            console.log(`Raw material reorder notification created for new material ${raw_materials.materialId}`);
        } catch (notificationError) {
            console.error('Failed to create reorder notification for new raw material:', notificationError);
            // Don't fail the creation if notification creation fails
        }
    }

    // Convert Mongoose document to plain object (if needed)
const rawData = raw_materials.toObject ? raw_materials.toObject() : raw_materials;

// Create keyInfo dynamically
const keyInfo = {
    MaterialID: rawData.materialId,
    MaterialName: rawData.materialName,
    Category: rawData.category,
    Type: rawData.type,
    Unit: rawData.unit,
    RestockLevel: rawData.restockLevel,
    ReorderLevel: rawData.reorderLevel,
    CurrentLevel: rawData.currentLevel,
    WarrantyPeriod: rawData.warrantyPeriod,
    InventoryName: rawData.inventoryName,
    Month: rawData.month,
    Year: rawData.year,
    CreatedBy: rawData.createdBy
};

    await AuditLog.create({
        entity: "Raw Materials",
        action: "insert",
        keyInfo: JSON.stringify(keyInfo),
        createdBy: userId || "WM001"
    });

    return raw_materials;
};

// Update raw material
export const updateRawMaterialsService = async (id, data, userId) => {
    // Validate update data
    const errors = validateRawMaterialsUpdate(data);
    if (Object.keys(errors).length > 0) {
        throw { status: 400, errors };
    }

    // Get the current raw material before update to compare levels
    const currentRawMaterial = await RawMaterials.findById(id);
    if (!currentRawMaterial) return null;

    const raw_materials = await RawMaterials.findByIdAndUpdate(id, { ...data }, { new: true });
    
    if (!raw_materials) return null;

    // Check if currentLevel was updated and if it meets or falls below reorder level
    if (data.currentLevel !== undefined) {
        const newCurrentLevel = raw_materials.currentLevel;
        const reorderLevel = raw_materials.reorderLevel;
        const previousCurrentLevel = currentRawMaterial.currentLevel;

        // Trigger notification if:
        // 1. Current level <= reorder level AND
        // 2. Either this is the first time it hits reorder level OR the level decreased
        if (newCurrentLevel <= reorderLevel && 
            (previousCurrentLevel > reorderLevel || newCurrentLevel < previousCurrentLevel)) {
            
            try {
                await createRawMaterialReorderLevelNotification(raw_materials);
                console.log(`Raw material reorder notification created for material ${raw_materials.materialId}`);
            } catch (notificationError) {
                console.error('Failed to create reorder notification for raw material:', notificationError);
                // Don't fail the update if notification creation fails
            }
        }
    }

    // Convert Mongoose document to plain object (if needed)
const rawData = raw_materials.toObject ? raw_materials.toObject() : raw_materials;

// Create keyInfo dynamically
const keyInfo = {
    MaterialID: rawData.materialId,
    MaterialName: rawData.materialName,
    Category: rawData.category,
    Type: rawData.type,
    Unit: rawData.unit,
    RestockLevel: rawData.restockLevel,
    ReorderLevel: rawData.reorderLevel,
    CurrentLevel: rawData.currentLevel,
    WarrantyPeriod: rawData.warrantyPeriod,
    InventoryName: rawData.inventoryName,
    Month: rawData.month,
    Year: rawData.year,
    CreatedBy: rawData.createdBy
};

    await AuditLog.create({
        entity: "Raw Materials",
        action: "update",
        keyInfo: JSON.stringify(keyInfo),
        createdBy: userId || "WM001"
    });

    return raw_materials;
};

// Delete raw material
export const deleteRawMaterialsService = async (id, userId) => {
    const raw_materials = await RawMaterials.findByIdAndDelete(id);
    if (!raw_materials) return null;

    // Convert Mongoose document to plain object (if needed)
const rawData = raw_materials.toObject ? raw_materials.toObject() : raw_materials;

// Create keyInfo dynamically
const keyInfo = {
    MaterialID: rawData.materialId,
    MaterialName: rawData.materialName,
    Category: rawData.category,
    Type: rawData.type,
    Unit: rawData.unit,
    RestockLevel: rawData.restockLevel,
    ReorderLevel: rawData.reorderLevel,
    CurrentLevel: rawData.currentLevel,
    WarrantyPeriod: rawData.warrantyPeriod,
    InventoryName: rawData.inventoryName,
    Month: rawData.month,
    Year: rawData.year,
    CreatedBy: rawData.createdBy
};

    await AuditLog.create({
        entity: "Raw Materials",
        action: "delete",
        keyInfo: JSON.stringify(keyInfo),
        createdBy: userId || "WM001"
    });

    return raw_materials;
};
