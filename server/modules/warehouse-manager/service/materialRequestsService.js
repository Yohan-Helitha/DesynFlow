// src/service/materialRequestService.js
import mongoose from "mongoose";
import MaterialRequest from '../../project/model/material.model.js';
import AuditLog from '../model/auditLogModel.js';

// Get all material requests
export const getAllMaterialRequestsService = async () => {
    const requests = await MaterialRequest.find().populate('projectId requestedBy');
    
    // Transform the data to include projectName and requestedByName directly
    return requests.map(req => {
        const reqObj = req.toObject();
        return {
            ...reqObj,
            projectName: req.projectId?.projectName || 'Unnamed Project',
            requestedByName: req.requestedBy?.username || req.requestedBy?.name || 'Unknown'
        };
    });
};

// Get single material request by ID
export const getMaterialRequestByIdService = async (id) => {
    const req = await MaterialRequest.findById(id).populate('projectId requestedBy');
    if (!req) return null;
    
    // Transform the data to include projectName and requestedByName directly
    const reqObj = req.toObject();
    return {
        ...reqObj,
        projectName: req.projectId?.projectName || 'Unnamed Project',
        requestedByName: req.requestedBy?.username || req.requestedBy?.name || 'Unknown'
    };
};

// Update material request
export const updateMaterialRequestService = async (id, data, userId) => {
    console.log("Updating Material Request ID:", id, "with data:", data);

    const materialRequest = await MaterialRequest.findByIdAndUpdate(id, { ...data }, { new: true });
    if (!materialRequest) {
        console.log("Material request not found or update failed");
        return null;
    }

    console.log("Updated Material Request:", materialRequest);

    return materialRequest;
};

