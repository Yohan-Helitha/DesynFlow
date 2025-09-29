import Warranty from '../model/warrenty.js';
import Material from '../../supplier/model/material.model.js';
import Project from '../../project/model/project.model.js';
import User from '../../auth/model/user.model.js';

export const createWarranty = async ({ projectId, itemId, clientId, startDate, duration }) => {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setMonth(end.getMonth() + Number(duration));
  const warranty = new Warranty({
    projectId,
    itemId,
    clientId,
    warrantyStart: start,
    warrantyEnd: end,
    status: 'Active',
  });
  await warranty.save();
  return warranty;
};

export const getWarranties = async (filter) => {
  const query = {};
  if (filter.clientId) query.clientId = filter.clientId;
  if (filter.projectId) query.projectId = filter.projectId;
  if (filter.itemId) query.itemId = filter.itemId;
  if (filter.status) query.status = new RegExp(filter.status, 'i');
  
  // Populate related data and calculate days remaining/expired
  const warranties = await Warranty.find(query)
    .populate('projectId', 'projectName')
    .populate('clientId', 'name email')
    .populate('itemId', 'materialName category type')
    .sort({ createdAt: -1 });

  // Calculate days remaining/expired and determine actual status
  const now = new Date();
  return warranties.map(warranty => {
    const warrantyObj = warranty.toObject();
    const endDate = new Date(warranty.warrantyEnd);
    const startDate = new Date(warranty.warrantyStart);
    
    // Calculate days
    const timeDiff = endDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Determine actual status and calculate appropriate days
    let actualStatus = warranty.status;
    let daysRemaining = null;
    let daysExpired = null;
    
    if (warranty.status === 'Claimed' || warranty.status === 'Replaced') {
      // Keep original status for claimed/replaced warranties
      actualStatus = warranty.status;
    } else if (daysDiff < 0) {
      // Warranty has expired
      actualStatus = 'Expired';
      daysExpired = Math.abs(daysDiff);
    } else {
      // Warranty is still active
      actualStatus = 'Active';
      daysRemaining = daysDiff;
    }
    
    return {
      ...warrantyObj,
      status: actualStatus,
      daysRemaining,
      daysExpired,
      // Include original IDs for frontend display - ensure string values
      clientId: warranty.clientId?._id || warranty.clientId || 'N/A',
      itemId: warranty.itemId?._id || warranty.itemId || 'N/A',
      projectId: warranty.projectId?._id || warranty.projectId || 'N/A', // Add this line
      // Format populated data for frontend
      projectName: warranty.projectId?.projectName || 'N/A',
      clientName: warranty.clientId?.name || warranty.clientId?.email || 'N/A', 
      materialName: warranty.itemId?.materialName || 'N/A',
      materialType: warranty.itemId?.type || 'N/A',
      materialCategory: warranty.itemId?.category || 'N/A',
      // Format dates for frontend
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  });
};

export const getWarrantyById = async (id) => Warranty.findById(id);

export const updateWarranty = async (id, update) => Warranty.findByIdAndUpdate(id, update, { new: true });

export const deleteWarranty = async (id) => {
  const res = await Warranty.findByIdAndDelete(id);
  return !!res;
};

export const getWarrantyStatus = async (id) => {
  const warranty = await Warranty.findById(id);
  if (!warranty) return 'Not found';
  const now = new Date();
  if (warranty.status === 'Claimed') return 'Claimed';
  if (warranty.warrantyEnd < now) return 'Expired';
  if (warranty.warrantyStart <= now && warranty.warrantyEnd >= now) return 'Active';
  return 'Unknown';
};

export const getItemWarrantyDetails = async (itemId) => {
  const item = await Material.findById(itemId);
  if (!item) return null;
  return { warrantyPeriod: item.warrantyPeriod, rules: 'Default rules TBD' };
};
