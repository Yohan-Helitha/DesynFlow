import TransferRequest from "../model/transferRequestModel.js";
import AuditLog from "../model/auditLogModel.js";

// Get all transfer requests
export const getAllTransferRequestService = async () => {
    return await TransferRequest.find();
};

// Get a  by ID
export const getTransferRequestByIdService = async (id) => {
  const request = await TransferRequest.findById(id);
  return request; // null if not found
};

// Add new transfer request
export const addTransferRequestService = async (data, warehouseManagerName, managerName) => {
    const transfer_request = new TransferRequest({
        ...data,
        requestedBy: warehouseManagerName || "WM001",
        approvedBy: ""
    });

    await transfer_request.save();

    // Convert Mongoose document to plain object
const rawData = transfer_request.toObject ? transfer_request.toObject() : transfer_request;

// Create keyInfo object
const keyInfo = {
    TransferRequestID: rawData.transferRequestId,
    MaterialID: rawData.materialId,
    FromLocation: rawData.fromLocation,
    ToLocation: rawData.toLocation,
    Quantity: rawData.quantity,
    Reason: rawData.reason,
    RequestedBy: rawData.requestedBy,
    ApprovedBy: rawData.approvedBy,
    Status: rawData.status,
    RequiredBy: rawData.requiredBy,
    UpdatedAt: rawData.updatedAt
};

    await AuditLog.create({
        entity: "Transfer Request",
        action: "insert",
        keyInfo: JSON.stringify(keyInfo),
        createdBy: warehouseManagerName || "WM001"
    });

    return transfer_request;
};

// Update transfer request
export const updateTransferRequestService = async (id, data, managerName) => {
    let transfer_request = await TransferRequest.findByIdAndUpdate(id, {
        ...data,
        updatedAt: Date.now(),
        approvedBy: managerName
    }, { new: true });

    if (!transfer_request) return null;

    await transfer_request.save();

    // Convert Mongoose document to plain object
const rawData = transfer_request.toObject ? transfer_request.toObject() : transfer_request;

// Create keyInfo object
const keyInfo = {
    TransferRequestID: rawData.transferRequestId,
    MaterialID: rawData.materialId,
    FromLocation: rawData.fromLocation,
    ToLocation: rawData.toLocation,
    Quantity: rawData.quantity,
    Reason: rawData.reason,
    RequestedBy: rawData.requestedBy,
    ApprovedBy: rawData.approvedBy,
    Status: rawData.status,
    RequiredBy: rawData.requiredBy,
    UpdatedAt: rawData.updatedAt
};

    await AuditLog.create({
        entity: "Transfer Request",
        action: "update",
        keyInfo: JSON.stringify(keyInfo),
        createdBy: data.requestedBy || "WM002"
    });

    return transfer_request;
};

// Delete transfer request
export const deleteTransferRequestService = async (id) => {
    const transfer_request = await TransferRequest.findByIdAndDelete(id);
    if (!transfer_request) return null;

    // Convert Mongoose document to plain object
const rawData = transfer_request.toObject ? transfer_request.toObject() : transfer_request;

// Create keyInfo object
const keyInfo = {
    TransferRequestID: rawData.transferRequestId,
    MaterialID: rawData.materialId,
    FromLocation: rawData.fromLocation,
    ToLocation: rawData.toLocation,
    Quantity: rawData.quantity,
    Reason: rawData.reason,
    RequestedBy: rawData.requestedBy,
    ApprovedBy: rawData.approvedBy,
    Status: rawData.status,
    RequiredBy: rawData.requiredBy,
    UpdatedAt: rawData.updatedAt
};

    await AuditLog.create({
        entity: "Transfer Request",
        action: "delete",
        keyInfo: JSON.stringify(keyInfo),
        createdBy: transfer_request.requestedBy || "WM001"
    });

    return transfer_request;
};
