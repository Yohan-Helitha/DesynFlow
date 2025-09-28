import MaterialRequest from '../model/material.model.js';

export const createMaterialRequest = async (data) => {
  const request = new MaterialRequest(data);
  return request.save();
};

export const updateMaterialRequest = async (id, data) => {
  return MaterialRequest.findByIdAndUpdate(id, data, { new: true });
};

export const deleteMaterialRequest = async (id) => {
  return MaterialRequest.findByIdAndDelete(id);
};

export const getMaterialRequestsByProject = async (projectId) => {
  return MaterialRequest.find({ projectId }).sort({ createdAt: -1 });
};

export const getMaterialRequestById = async (id) => {
  return MaterialRequest.findById(id);
};

export default {
  createMaterialRequest,
  updateMaterialRequest,
  deleteMaterialRequest,
  getMaterialRequestsByProject,
  getMaterialRequestById
};
