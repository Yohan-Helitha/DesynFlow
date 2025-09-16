import Supplier from '../model/supplier.model.js';
import PurchaseOrder from '../model/purchaseOrder.model.js';
import SupplierRating from '../model/supplierRating.model.js';
import SupplierStatusUpdate from '../model/supplierStatusUpdate.model.js';

// Get all suppliers with ratings, top-rated first, green-flagged
const getSuppliersWithRatings = async () => {
  const suppliers = await Supplier.find().sort({ rating: -1 });
  return suppliers.map(s => ({ ...s.toObject(), greenFlag: s.rating >= 4.5 }));
};

// Get all requests, approvals, deliveries
const getAllOrders = async () => {
  return await PurchaseOrder.find();
};

// Get live tracking of current orders (status updates)
const getOrderTracking = async (purchaseOrderId) => {
  return await SupplierStatusUpdate.find({ purchaseOrderId }).sort({ timestamp: 1 });
};

// Get system logs (who approved/rejected, when)
const getSystemLogs = async () => {
  // Example: Find all status updates and approvals
  return await SupplierStatusUpdate.find().sort({ timestamp: -1 });
};

export default {
  getSuppliersWithRatings,
  getAllOrders,
  getOrderTracking,
  getSystemLogs
};
