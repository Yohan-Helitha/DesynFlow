import StockMovement from "../model/stockMovementModel.js";
import AuditLog from "../model/auditLogModel.js";

// Get all stock movements
export const getAllStockMovementService = async () => {
    const stock_movement = await StockMovement.find();

    // Convert dispatchedDate to Sri Lanka local time (UTC+5:30)
    const formattedMovements = stock_movement.map(m => {
        const dispatchedDateSL = new Date(m.dispatchedDate);
        dispatchedDateSL.setHours(dispatchedDateSL.getHours() + 5);
        dispatchedDateSL.setMinutes(dispatchedDateSL.getMinutes() + 30);

        return {
            ...m._doc,
            dispatchedDate: dispatchedDateSL.toISOString().replace('T', ' ').substr(0, 19)
        };
    });

    return formattedMovements;
};

// Get a single product by ID
export const getStockMovementByIdService = async (id) => {
  const movement = await StockMovement.findById(id);
  return movement; // null if not found
};

// Add new stock movement
export const addStockMovementService = async (data, warehouseManagerName, managerName) => {
    const stock_movement = new StockMovement({
        ...data,
        requestedBy: warehouseManagerName || "Lakni",
        approvedBy: managerName || "Ranepura"
    });

    await stock_movement.save();

    await AuditLog.create({
        entity: "Stock Movement",
        action: "insert",
        keyInfo: JSON.stringify(stock_movement),
        createdBy: warehouseManagerName || "Lakni"
    });

    return stock_movement;
};

// Update stock movement
export const updateStockMovementService = async (id, data, warehouseManagerName) => {
    let stock_movement = await StockMovement.findByIdAndUpdate(id, data, { new: true });
    if (!stock_movement) return null;

    await AuditLog.create({
        entity: "Stock Movement",
        action: "update",
        keyInfo: JSON.stringify(stock_movement),
        createdBy: warehouseManagerName || "Lakni"
    });

    return stock_movement;
};

// Delete stock movement
export const deleteStockMovementService = async (id, warehouseManagerName) => {
    const stock_movement = await StockMovement.findByIdAndDelete(id);
    if (!stock_movement) return null;

    await AuditLog.create({
        entity: "Stock Movement",
        action: "delete",
        keyInfo: `MaterialId: ${stock_movement.materialId}, from: ${stock_movement.fromLocation}, to: ${stock_movement.toLocation}, qty: ${stock_movement.quantity}`,
        createdBy: warehouseManagerName || "Lakni"
    });

    return stock_movement;
};
