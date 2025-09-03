import ManuProducts from '../model/manuProductsModel.js';
import AuditLog from '../model/auditLogModel.js';
import ThresholdAlert from '../model/thresholdAlertModel.js';
//import { validateManuProductInsert, validateManuProductUpdate } from '../validators/manuProductsValidator.js';

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
  // Validate data
  // const errors = validateManuProductInsert(data);
  // if (errors.length > 0) {
  //   throw { status: 400, errors }; // throw an error to be handled by controller
  // }

  // Set currentLevel = restockLevel automatically
  data.currentLevel = data.restockLevel;

  const now = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const manu_product = new ManuProducts({
    ...data,
    month: monthNames[now.getMonth()],
    year: now.getFullYear(),
    createdBy: createdBy || "WM001"
  });

  await manu_product.save();

  // Create audit log
  await AuditLog.create({
    entity: "Manufactured Products",
    action: "insert",
    keyInfo: JSON.stringify(manu_product),
    createdBy: createdBy || "WM001"
  });

  return manu_product;
};

// Update manufactured product
export const updateManuProductsService = async (id, data, updatedBy) => {
  // Validate update fields
  // const errors = validateManuProductUpdate(data);
  // if (errors.length > 0) {
  //   throw { status: 400, errors }; // throw an error to be handled by controller
  // }

  const manu_product = await ManuProducts.findByIdAndUpdate(id, { ...data }, { new: true });

  if (!manu_product) return null;

  await AuditLog.create({
    entity: "Manufactured Products",
    action: "update",
    keyInfo: JSON.stringify(manu_product),
    createdBy: updatedBy || "WM001"
  });

  // Auto-create threshold alert if needed
  if (data.currentLevel <= manu_product.restockLevel) {
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
    }
  }

  return manu_product;
};

// Delete manufactured product
export const deleteManuProductsService = async (id, deletedBy) => {
  const manu_product = await ManuProducts.findByIdAndDelete(id);

  if (!manu_product) return null;

  await AuditLog.create({
    entity: "Manufactured Products",
    action: "delete",
    keyInfo: JSON.stringify(manu_product),
    createdBy: deletedBy || "WM001"
  });

  return manu_product;
};

