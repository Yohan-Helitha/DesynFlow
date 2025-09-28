// services/stockService.js
import ManuProducts from "../model/manuProductsModel.js";

/**
 * Get stock level for a material in an inventory
 */
export async function getStockLevel(materialId, inventoryId) {
  const material = await ManuProducts.findOne({ materialId, inventoryId });
  if (!material) return null;
  return material.currentLevel;
}

/**
 * Update stock quantity (+ or -)
 */
export async function updateStock(materialId, inventoryId, quantityChange) {
  const material = await ManuProducts.findOne({ materialId, inventoryId });
  if (!material) throw new Error("Material not found in this inventory");

  material.currentLevel += quantityChange;
  if (material.currentLevel < 0) material.currentLevel = 0; // prevent negative

  await material.save();
  return {
    materialId: material.materialId,
    materialName: material.materialName,
    currentLevel: material.currentLevel,
    reorderLevel: material.reorderLevel,
  };
}

/**
 * Check if reorder is needed
 */
export async function isReorderNeeded(materialId, inventoryId) {
  const material = await ManuProducts.findOne({ materialId, inventoryId });
  if (!material) return false;
  return material.currentLevel <= material.reorderLevel;
}
