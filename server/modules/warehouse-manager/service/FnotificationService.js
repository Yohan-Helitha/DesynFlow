import { createWarehouseNotification } from "./warehouseNotificationService.js";

export const notifyThresholdAlert = async ({ materialId, materialName, currentLevel, reorderLevel, inventoryId, inventoryName }) => {
  const title = `Reorder needed: ${materialName}`;
  const message = `Current level ${currentLevel} has reached reorder level ${reorderLevel} for ${materialName} in ${inventoryName || inventoryId}`;
  return await createWarehouseNotification({
    type: "threshold",
    title,
    message,
    relatedId: materialId,
    data: { materialId, materialName, currentLevel, reorderLevel, inventoryId, inventoryName },
    recipient: "warehouse",
    createdBy: "system"
  });
};

export const notifySReorderStatusChange = async ({ stockReorderRequestId, materialId, materialName, status, inventoryId, inventoryName }) => {
  const title = `SReorder ${stockReorderRequestId} ${status}`;
  const message = `Stock reorder request ${stockReorderRequestId} for ${materialName} is now ${status}`;
  return await createWarehouseNotification({
    type: "sreorder",
    title,
    message,
    relatedId: stockReorderRequestId,
    data: { stockReorderRequestId, materialId, materialName, status, inventoryId, inventoryName },
    recipient: "warehouse",
    createdBy: "system"
  });
};
