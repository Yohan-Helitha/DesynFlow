import PurchaseOrder from '../model/purchaseOrder.model.js';

const createPurchaseOrder = async (data) => {
  // Ensure items have materialId; if materialName is provided, look it up
  const items = await Promise.all((data.items || []).map(async (item) => {
    if (item.materialId) {
      return {
        materialId: item.materialId,
        qty: item.qty,
        unitPrice: item.unitPrice
      };
    } else if (item.materialName) {
      // Lookup materialId from materialName and supplierId
      const MaterialCatalog = (await import('../model/materialCatalog.model.js')).default;
      const catalog = await MaterialCatalog.findOne({
        supplierId: data.supplierId,
        // Case-insensitive match for materialName
        $expr: { $eq: [ { $toLower: '$materialName' }, item.materialName.trim().toLowerCase() ] }
      });
      if (!catalog) {
        throw new Error(`Material '${item.materialName}' not found for supplier.`);
      }
      return {
        materialId: catalog.materialId,
        qty: item.qty,
        unitPrice: item.unitPrice
      };
    } else {
      throw new Error('Each item must have materialId or materialName');
    }
  }));

  // Validate required fields
  if (!data.projectId || !data.supplierId || !data.requestedBy) {
    throw new Error('Missing required fields: projectId, supplierId, requestedBy');
  }

  const order = new PurchaseOrder({
    ...data,
    items
  });
  return await order.save();
};

const updatePurchaseOrder = async (id, data) => {
  return await PurchaseOrder.findByIdAndUpdate(id, data, { new: true });
};

const getAllPurchaseOrders = async () => {
  return await PurchaseOrder.find();
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
