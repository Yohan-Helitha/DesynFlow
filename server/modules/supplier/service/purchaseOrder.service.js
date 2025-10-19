import PurchaseOrder from '../model/purchaseOrder.model.js';
import Material from '../model/material.model.js';

const createPurchaseOrder = async (data) => {
  const isValidObjectId = (v) => /^[a-f\d]{24}$/i.test(v || '');

  // Normalize items: accept materialId (ObjectId) or materialName/name
  const items = await Promise.all((data.items || []).map(async (item) => {
    let materialId = item.materialId;
    let materialName = item.materialName || item.name || null;
    let unit = item.unit || null; // Use the unit provided from the form

    if (!isValidObjectId(materialId)) {
      // Treat provided materialId as name if it's not an ObjectId
      if (!materialName && materialId) {
        materialName = materialId;
        materialId = undefined;
      }
      // Try to resolve by materialName from Material collection
      if (materialName) {
        try {
          const matDoc = await Material.findOne({ materialName });
          if (matDoc) {
            materialId = matDoc._id;
            materialName = materialName || matDoc.materialName;
          }
        } catch {}
      }
    } else {
      
      try {

        const matDoc = await Material.findById(materialId);

        if (matDoc) {
          materialName = materialName || matDoc.materialName;
        }

      } catch {}
    }

    return {
      materialId, // may be undefined if not resolvable; schema allows optional
      materialName: materialName || undefined,
      qty: item.qty ?? Number(item.quantity ?? 0),
      unit: unit || 'Kilo', // Default to 'Kilo' if no unit is specified
      unitPrice: item.unitPrice ?? Number(item.pricePerUnit ?? 0)
    };
  }));

  // Handle budget approval requests with flexible validation
  const orderData = { ...data, items };
  
  // For budget approval requests, set request origin and handle missing fields
  if (data.requesterName && !data.requestedBy) {
    orderData.requestOrigin = 'BudgetApproval';
  }

  // Validate required fields based on request type
  if (orderData.requestOrigin === 'BudgetApproval') {
    // Budget approval only requires supplierId and name
    if (!orderData.supplierId) {
      throw new Error('Missing required field for budget approval: supplierId');
    }
  } else {
    // Regular purchase orders require projectId, supplierId, requestedBy
    if (!orderData.projectId || !orderData.supplierId || !orderData.requestedBy) {
      throw new Error('Missing required fields: projectId, supplierId, requestedBy');
    }
  }

  const order = new PurchaseOrder(orderData);
  return await order.save();
};

const updatePurchaseOrder = async (id, data) => {
  return await PurchaseOrder.findByIdAndUpdate(id, data, { new: true });
};

const getAllPurchaseOrders = async () => {
  return await PurchaseOrder.find()
    .populate('supplierId', 'companyName')
    .populate('items.materialId', 'materialName unit');
};

const forwardToFinance = async (id) => {
  return await PurchaseOrder.findByIdAndUpdate(id, { status: 'PendingFinanceApproval' }, { new: true });
};

const financeApproval = async (id, { approverId, status, note }) => {
  if (!['Approved', 'Rejected'].includes(status)) throw new Error('Invalid status');
  return await PurchaseOrder.findByIdAndUpdate(id, {
    status: status === 'Approved' ? 'Approved' : 'Rejected',
    financeApproval: {
      approverId,
      status,
      note,
      approvedAt: new Date()
    }
  }, { new: true });
};

const getApprovalStatus = async (id) => {
  const order = await PurchaseOrder.findById(id);
  return order ? order.financeApproval?.status : null;
};

export default {
  createPurchaseOrder,
  updatePurchaseOrder,
  getAllPurchaseOrders,
  forwardToFinance,
  financeApproval,
  getApprovalStatus
};
