import sReorderRequests from "../model/sReorderRequestsModel.js";
import AuditLog from "../model/auditLogModel.js";

// Get all stock reorder requests
export const getAllsReorderRequestsService = async () => {
    return await sReorderRequests.find();
};

// Get request  by ID
export const getSReorderRequestByIdService = async (id) => {
  const request = await sReorderRequests.findById(id);
  return request;
};

// Add new stock reorder request
export const addsReorderRequestsService = async (data, warehouseManagerName) => {
    const s_reorder_request = new sReorderRequests({
        ...data,
        warehouseManagerName: warehouseManagerName || "System"
    });

    await s_reorder_request.save();

    await AuditLog.create({
        entity: "Stock Reorder Request",
        action: "insert",
        keyInfo: JSON.stringify(s_reorder_request),
        createdBy: warehouseManagerName || "System"
    });

    return s_reorder_request;
};

// Update stock reorder request
export const updatesReorderRequestsService = async (id, data) => {
    let s_reorder_request = await sReorderRequests.findByIdAndUpdate(id, {
        ...data,
        updatedAt: Date.now()
    }, { new: true });

    if (!s_reorder_request) return null;

    await AuditLog.create({
        entity: "Stock Reorder Request",
        action: "update",
        keyInfo: JSON.stringify(s_reorder_request),
        createdBy: data.warehouseManagerName || "System"
    });

    return s_reorder_request;
};

// Delete stock reorder request
export const deletesReorderRequestsService = async (id) => {
    const s_reorder_request = await sReorderRequests.findByIdAndDelete(id);
    if (!s_reorder_request) return null;

    await AuditLog.create({
        entity: "Stock Reorder Request",
        action: "delete",
        keyInfo: `InventoryId: ${s_reorder_request.inventoryId}, MaterialId: ${s_reorder_request.materialId}, qty: ${s_reorder_request.quantity}`,
        createdBy: s_reorder_request.warehouseManagerName || "System"
    });

    return s_reorder_request;
};
