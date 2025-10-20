import mongoose from "mongoose";
import ManuProducts from '../model/manuProductsModel.js';
import AuditLog from '../model/auditLogModel.js';
import ThresholdAlert from '../model/thresholdAlertModel.js';
import { notifyThresholdAlert } from './FnotificationService.js';
import { validateManuProductUpdate } from '../validators/manuProductsValidator.js';

// Get all manufactured products
export const getAllManuProductsService = async () => {
  return await ManuProducts.find();
};

// Get single manufactured product by ID
export const getManuProductByIdService = async (id) => {
  return await ManuProducts.findById(id);
};

// Add new manufactured product
export const addManuProductsService = async (data, createdBy) => {

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
    materialIdToUse = `MP${seqNum}`;
  }

  
  // Set currentLevel = restockLevel automatically
  data.currentLevel = data.restockLevel;

  

  const manu_product = new ManuProducts({
    ...data,
    materialId: materialIdToUse,
    createdBy: createdBy || "WM001" 
  });

  await manu_product.save();

  // Convert Mongoose document to plain object (if needed)
const rawData = manu_product.toObject ? manu_product.toObject() : manu_product;

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

  // Create audit log
  await AuditLog.create({
    entity: "Manufactured Products",
    action: "insert",
    keyInfo: JSON.stringify(keyInfo),
    createdBy: createdBy || "WM001"
  });

  return manu_product;
};


// Update manufactured product
export const updateManuProductsService = async (id, data, userId) => {
   //Validate update fields
   const errors = validateManuProductUpdate(data);
    if (Object.keys(errors).length > 0) {
        throw { status: 400, errors };
    }

  const manu_product = await ManuProducts.findByIdAndUpdate(id, { ...data }, { new: true });

  if (!manu_product) return null;

  // Convert Mongoose document to plain object (if needed)
const rawData = manu_product.toObject ? manu_product.toObject() : manu_product;

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
    entity: "Manufactured Products",
    action: "update",
    keyInfo: JSON.stringify(keyInfo),
    createdBy: userId || "WM001"
  });

  // Auto-create threshold alert if needed (compare against reorderLevel)
  if (typeof data.currentLevel !== 'undefined' && data.currentLevel <= manu_product.reorderLevel) {
    const existingAlert = await ThresholdAlert.findOne({
      materialId: manu_product.materialId,
      inventoryId: manu_product.inventoryId,
      status: "Pending"
    });

    if (!existingAlert) {
      await ThresholdAlert.create({
        materialId: manu_product.materialId,
        materialName: manu_product.materialName,
        currentLevel: manu_product.currentLevel,
        restockLevel: manu_product.restockLevel,
        inventoryId: manu_product.inventoryId,
        inventoryName: manu_product.inventoryName || "Unknown"
      });
      // Create a warehouse notification for threshold
      try {
        await notifyThresholdAlert({
          materialId: manu_product.materialId,
          materialName: manu_product.materialName,
          currentLevel: manu_product.currentLevel,
          reorderLevel: manu_product.reorderLevel,
          inventoryId: manu_product.inventoryId,
          inventoryName: manu_product.inventoryName
        });
      } catch (err) {
        console.error('Failed to create threshold notification', err);
      }
    }
  }

  return manu_product;
};

// Delete manufactured product
export const deleteManuProductsService = async (id, deletedBy) => {
  const manu_product = await ManuProducts.findByIdAndDelete(id);

  if (!manu_product) return null;

  // Convert Mongoose document to plain object (if needed)
const rawData = manu_product.toObject ? manu_product.toObject() : manu_product;

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
    entity: "Manufactured Products",
    action: "delete",
    keyInfo: JSON.stringify(keyInfo),
    createdBy: deletedBy || "WM001"
  });

  return manu_product;
};

