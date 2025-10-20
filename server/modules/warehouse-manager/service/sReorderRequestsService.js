import sReorderRequests from "../model/sReorderRequestsModel.js";
import AuditLog from "../model/auditLogModel.js";
import { notifySReorderStatusChange } from './notificationService.js';

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

    const rawData = s_reorder_request.toObject ? s_reorder_request.toObject() : s_reorder_request;

    const keyInfo = {
        StockReorderRequestID: rawData.stockID,
        InventoryName: rawData.inventoryName,
        InventoryAddress: rawData.InventoryAddress,
        InventoryContact: rawData.inventoryContact,
        MaterialID: rawData.materialId,
        MaterialName: rawData.materialName,
        Quantity: rawData.quantity,
        Type: rawData.type,
        Unit: rawData.unit,
        ExpectedDate: rawData.expectedDate,
        WarehouseManagerName: rawData.warehouseManagerName,
        Status: rawData.status,
        CreatedAt: rawData.createdAt,
        UpdatedAt: rawData.updatedAt
    }

    await AuditLog.create({
        entity: "Stock Reorder Request",
        action: "insert",
        keyInfo: JSON.stringify(keyInfo),
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

    const rawData = s_reorder_request.toObject ? s_reorder_request.toObject() : s_reorder_request;

    const keyInfo = {
        StockReorderRequestID: rawData.stockID,
        InventoryName: rawData.inventoryName,
        InventoryAddress: rawData.InventoryAddress,
        InventoryContact: rawData.inventoryContact,
        MaterialID: rawData.materialId,
        MaterialName: rawData.materialName,
        Quantity: rawData.quantity,
        Type: rawData.type,
        Unit: rawData.unit,
        ExpectedDate: rawData.expectedDate,
        WarehouseManagerName: rawData.warehouseManagerName,
        Status: rawData.status,
        CreatedAt: rawData.createdAt,
        UpdatedAt: rawData.updatedAt
    }

    await AuditLog.create({
        entity: "Stock Reorder Request",
        action: "update",
        keyInfo: JSON.stringify(keyInfo),
        createdBy: data.warehouseManagerName || "System"
    });

    // If status changed to Checked or Restocked, create notification
    if (data.status && (data.status === 'Checked' || data.status === 'Restocked')) {
        try {
            await notifySReorderStatusChange({
                stockReorderRequestId: rawData.stockReorderRequestId || rawData.stockID || rawData.stockReorderRequestId,
                materialId: rawData.materialId,
                materialName: rawData.materialName,
                status: data.status,
                inventoryId: rawData.inventoryId,
                inventoryName: rawData.inventoryName
            });
        } catch (err) {
            console.error('Failed to create sReorder status notification', err);
        }
    }

    return s_reorder_request;
};

// Delete stock reorder request
export const deletesReorderRequestsService = async (id) => {
    const s_reorder_request = await sReorderRequests.findByIdAndDelete(id);
    if (!s_reorder_request) return null;

    const rawData = s_reorder_request.toObject ? s_reorder_request.toObject() : s_reorder_request;

    const keyInfo = {
        StockReorderRequestID: rawData.stockID,
        InventoryName: rawData.inventoryName,
        InventoryAddress: rawData.InventoryAddress,
        InventoryContact: rawData.inventoryContact,
        MaterialID: rawData.materialId,
        MaterialName: rawData.materialName,
        Quantity: rawData.quantity,
        Type: rawData.type,
        Unit: rawData.unit,
        ExpectedDate: rawData.expectedDate,
        WarehouseManagerName: rawData.warehouseManagerName,
        Status: rawData.status,
        CreatedAt: rawData.createdAt,
        UpdatedAt: rawData.updatedAt
    }

    await AuditLog.create({
        entity: "Stock Reorder Request",
        action: "delete",
        keyInfo: JSON.stringify(keyInfo),
        createdBy: warehouseManagerName || "System"
    });

    return s_reorder_request;
};
