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
        approvedBy: managerName || "M102"
    });

    await transfer_request.save();

    await AuditLog.create({
        entity: "Transfer Request",
        action: "insert",
        keyInfo: JSON.stringify(transfer_request),
        createdBy: warehouseManagerName || "WM001"
    });

    return transfer_request;
};

// Update transfer request
export const updateTransferRequestService = async (id, data) => {
    let transfer_request = await TransferRequest.findByIdAndUpdate(id, {
        ...data,
        updatedAt: Date.now()
    }, { new: true });

    if (!transfer_request) return null;

    await transfer_request.save();

    await AuditLog.create({
        entity: "Transfer Request",
        action: "update",
        keyInfo: JSON.stringify(transfer_request),
        createdBy: data.requestedBy || "WM001"
    });

    return transfer_request;
};

// Delete transfer request
export const deleteTransferRequestService = async (id) => {
    const transfer_request = await TransferRequest.findByIdAndDelete(id);
    if (!transfer_request) return null;

    await AuditLog.create({
        entity: "Transfer Request",
        action: "delete",
        keyInfo: `MaterialId: ${transfer_request.materialId}, from: ${transfer_request.fromLocation}, to: ${transfer_request.toLocation}, qty: ${transfer_request.quantity}`,
        createdBy: transfer_request.requestedBy || "WM001"
    });

    return transfer_request;
};
