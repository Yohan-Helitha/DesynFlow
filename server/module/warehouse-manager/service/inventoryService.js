import ManuProducts from "../model/manuProductsModel.js";
import InvLocations from "../model/invLocationsModel.js";

// Get current stock for a material in an inventory
export async function getMaterialStock(materialId, inventoryId) {
  const material = await ManuProducts.findOne({ _id: materialId, inventoryId });
  if (!material) return null;
  return {
    materialName: material.materialName,
    currentLevel: material.currentLevel,
    restockLevel: material.restockLevel,
  };
}

// Check if a given inventory exists
export async function isValidInventory(inventoryId) {
  const inventory = await InvLocations.findById(inventoryId);
  return !!inventory; // true if exists, false if not
}

//Update stock after a transfer or disposal
export async function updateMaterialStock(materialId, inventoryId, quantityChange) {
  const material = await ManuProducts.findOne({ _id: materialId, inventoryId });
  if (!material) throw new Error("Material not found in this inventory");
  material.currentLevel += quantityChange; // can be + or - depending on operation
  if (material.currentLevel < 0) material.currentLevel = 0; // safety
  await material.save();
  return material;
}

// Check if stock is below reorder level
export async function checkReorder(materialId, inventoryId) {
  const material = await ManuProducts.findOne({ _id: materialId, inventoryId });
  if (!material) return false;
  return material.currentLevel <= material.reorderLevel;
}
