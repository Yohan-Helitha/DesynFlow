import SupplierStatusUpdate from '../model/supplierStatusUpdate.model.js';
import PurchaseOrder from '../model/purchaseOrder.model.js';

// Update delivery status
const updateDeliveryStatus = async (data) => {
  const statusUpdate = new SupplierStatusUpdate(data);
  await statusUpdate.save();
  // Optionally update PurchaseOrder status
  if (data.status === 'Delivered') {
    await PurchaseOrder.findByIdAndUpdate(data.purchaseOrderId, { status: 'Delivered' });
    // TODO: Notify Warehouse Manager to update stock
  }
  return statusUpdate;
};

// Track live status of orders
const getOrderStatus = async (purchaseOrderId) => {
  return await SupplierStatusUpdate.find({ purchaseOrderId });
};

// Update delivery location (stub, needs location model/field)
const updateDeliveryLocation = async (purchaseOrderId, location) => {
  // This is a stub. You need a location field/model to store this.
  return { purchaseOrderId, location };
};

// Get delivery location (stub)
const getDeliveryLocation = async (purchaseOrderId) => {
  // This is a stub. You need a location field/model to retrieve this.
  return { purchaseOrderId, location: 'Not implemented' };
};

export default {
  updateDeliveryStatus,
  getOrderStatus,
  updateDeliveryLocation,
  getDeliveryLocation
};
