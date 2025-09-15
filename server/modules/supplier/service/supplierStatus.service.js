import SupplierStatusUpdate from '../model/supplierStatusUpdate.model.js';

const updateStatus = async (data) => {
  const statusUpdate = new SupplierStatusUpdate(data);
  return await statusUpdate.save();
};

const getStatusUpdates = async (purchaseOrderId) => {
  return await SupplierStatusUpdate.find({ purchaseOrderId });
};

export default {
  updateStatus,
  getStatusUpdates
};
