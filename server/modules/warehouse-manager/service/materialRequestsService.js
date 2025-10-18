// src/service/materialRequestService.js
import mongoose from "mongoose";
import MaterialRequest from '../../project/model/material.model.js';
import AuditLog from '../model/auditLogModel.js';

// Get all material requests
export const getAllMaterialRequestsService = async () => {
    return await MaterialRequest.find().populate('projectId requestedBy');
};

// Get single material request by ID
export const getMaterialRequestByIdService = async (id) => {
    return await MaterialRequest.findById(id).populate('projectId requestedBy');
};

// Update material request
export const updateMaterialRequestService = async (id, data, userId) => {
    const materialRequest = await MaterialRequest.findByIdAndUpdate(id, { ...data }, { new: true });

    if (!materialRequest) return null;

    // Convert to plain object for audit
    const requestData = materialRequest.toObject ? materialRequest.toObject() : materialRequest;

    await AuditLog.create({
        entity: "Material Requests",
        action: "update",
        keyInfo: JSON.stringify({
            RequestID: requestData.requestId,
            ProjectID: requestData.projectId,
            Items: requestData.items,
            NeededBy: requestData.neededBy,
            Status: requestData.status,
            WarehouseNote: requestData.warehouseNote,
            RequestedBy: requestData.requestedBy
        }),
        createdBy: userId || "WM001"
    });

    return materialRequest;
};

