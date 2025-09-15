import PurchaseOrder from '../model/purchaseOrder.model.js';

const createPurchaseOrder = async (data) => {
  const order = new PurchaseOrder(data);
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
