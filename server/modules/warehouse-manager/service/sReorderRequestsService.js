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
export const updatesReorderRequestsService = async (id, data, updatedBy = "System User") => {
    // Get the current request to compare status changes
    const currentRequest = await sReorderRequests.findById(id);
    if (!currentRequest) return null;

    let s_reorder_request = await sReorderRequests.findByIdAndUpdate(id, {
        ...data,
        updatedAt: Date.now()
    }, { new: true });

    if (!s_reorder_request) return null;

    const rawData = s_reorder_request.toObject ? s_reorder_request.toObject() : s_reorder_request;

    const keyInfo = {
        StockReorderRequestID: rawData.stockReorderRequestId,
        InventoryName: rawData.inventoryName,
        InventoryAddress: rawData.inventoryAddress,
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
        createdBy: updatedBy
    });

    // Check if status was updated and create notification for warehouse manager
    // Only send notifications if the updater is a procurement officer
    if (data.status && data.status !== currentRequest.status && updatedBy === 'Procurement Officer') {
        try {
            await notifySReorderStatusChange({
                stockReorderRequestId: rawData.stockReorderRequestId,
                materialId: rawData.materialId,
                materialName: rawData.materialName,
                status: data.status,
                inventoryId: rawData.inventoryId,
                inventoryName: rawData.inventoryName,
                quantity: rawData.quantity,
                expectedDate: rawData.expectedDate,
                updatedBy: updatedBy
            });
            console.log(`Status change notification sent for request ${rawData.stockReorderRequestId}: ${currentRequest.status} → ${data.status} (Updated by: ${updatedBy})`);
        } catch (err) {
            console.error('Failed to create sReorder status notification', err);
            // Don't fail the update if notification creation fails
        }
    } else if (data.status && data.status !== currentRequest.status) {
        console.log(`Status change detected for request ${rawData.stockReorderRequestId}: ${currentRequest.status} → ${data.status}, but notification not sent (Updated by: ${updatedBy})`);
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
