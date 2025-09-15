import ManuProducts from "../model/manuProductsModel.js";

// Check stock for a material in an inventory
export async function checkStockFn(materialId, inventoryId) {
  const material = await ManuProducts.findOne({ _id: materialId, inventoryId });
  if (!material) return 0;
  return material.currentLevel;
}

// Update stock quantity
export async function updateStock(materialId, inventoryId, quantityChange) {
  const material = await ManuProducts.findOne({ _id: materialId, inventoryId });
  if (!material) throw new Error("Material not found");
  material.currentLevel += quantityChange; // can be negative
  if (material.currentLevel < 0) material.currentLevel = 0;
  await material.save();
  return material;
}

// Check if reorder is needed
export async function isReorderNeeded(materialId, inventoryId) {
  const material = await ManuProducts.findOne({ _id: materialId, inventoryId });
  if (!material) return false;
  return material.currentLevel <= material.reorderLevel;
}
