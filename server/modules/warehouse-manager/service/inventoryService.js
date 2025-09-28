// services/inventoryService.js - Enhanced with debugging
import ManuProducts from "../model/manuProductsModel.js";
import InvLocations from "../model/invLocationsModel.js";

// Get current stock for a material in an inventory
export async function getMaterialStock(materialId, inventoryId) {
  console.log(`[DEBUG] getMaterialStock called with:`, { materialId, inventoryId });
  console.log(`[DEBUG] Types:`, { 
    materialIdType: typeof materialId, 
    inventoryIdType: typeof inventoryId 
  });
  
  try {
    const material = await ManuProducts.findOne({ 
      materialId: materialId, 
      inventoryId: inventoryId 
    });
    
    console.log(`[DEBUG] Material found:`, material ? 'YES' : 'NO');
    if (material) {
      console.log(`[DEBUG] Material details:`, {
        materialId: material.materialId,
        inventoryId: material.inventoryId,
        materialName: material.materialName,
        currentLevel: material.currentLevel
      });
    } else {
      // Let's check what materials exist in this inventory
      const allMaterialsInInventory = await ManuProducts.find({ inventoryId: inventoryId });
      console.log(`[DEBUG] All materials in inventory ${inventoryId}:`, 
        allMaterialsInInventory.map(m => ({ id: m.materialId, name: m.materialName }))
      );
      
      // Let's check if this material exists in any inventory
      const materialInAnyInventory = await ManuProducts.find({ materialId: materialId });
      console.log(`[DEBUG] Material ${materialId} in any inventory:`, 
        materialInAnyInventory.map(m => ({ inventory: m.inventoryId, name: m.materialName }))
      );
    }
    
    if (!material) return null;
    
    return {
      materialId: material.materialId,
      materialName: material.materialName,
      currentLevel: material.currentLevel,
      reorderLevel: material.reorderLevel,
    };
  } catch (error) {
    console.error(`[ERROR] getMaterialStock failed:`, error);
    throw error;
  }
}

// Check if a given inventory exists
export async function isValidInventory(inventoryId) {
  console.log(`[DEBUG] isValidInventory called with:`, { inventoryId });
  console.log(`[DEBUG] Type:`, { inventoryIdType: typeof inventoryId });
  
  try {
    const inventory = await InvLocations.findOne({ inventoryId: inventoryId });
    
    console.log(`[DEBUG] Inventory found:`, inventory ? 'YES' : 'NO');
    if (inventory) {
      console.log(`[DEBUG] Inventory details:`, {
        inventoryId: inventory.inventoryId,
        inventoryName: inventory.inventoryName
      });
    } else {
      // Let's see what inventories exist
      const allInventories = await InvLocations.find({}).select('inventoryId inventoryName');
      console.log(`[DEBUG] All existing inventories:`, allInventories);
    }
    
    return !!inventory;
  } catch (error) {
    console.error(`[ERROR] isValidInventory failed:`, error);
    return false;
  }
}

// Update stock after transfer or disposal
export async function updateMaterialStock(materialId, inventoryId, quantityChange) {
  console.log(`[DEBUG] updateMaterialStock called with:`, { materialId, inventoryId, quantityChange });
  
  const material = await ManuProducts.findOne({ materialId, inventoryId });
  if (!material) throw new Error("Material not found in this inventory");

  material.currentLevel += quantityChange; // can be + (add) or - (remove)
  if (material.currentLevel < 0) material.currentLevel = 0; // safety
  await material.save();

  return {
    materialId: material.materialId,
    materialName: material.materialName,
    currentLevel: material.currentLevel,
    reorderLevel: material.reorderLevel,
  };
}

// Check if stock is below reorder level
export async function checkReorder(materialId, inventoryId) {
  const material = await ManuProducts.findOne({ materialId, inventoryId });
  if (!material) return false;
  return material.currentLevel <= material.reorderLevel;
}