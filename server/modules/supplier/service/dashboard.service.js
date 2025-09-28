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

// Get recent activities for dashboard
const getRecentActivities = async () => {
  try {
    // Get recent suppliers (last 5)
    const recentSuppliers = await Supplier.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name companyName createdAt');

    // Get recent orders (last 5)
    const recentOrders = await PurchaseOrder.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('_id status updatedAt totalAmount')
      .populate('supplierId', 'name companyName');

    // Create activities array
    const activities = [];

    // Add supplier activities
    recentSuppliers.forEach(supplier => {
      activities.push({
        type: 'supplier',
        message: `New supplier "${supplier.name || supplier.companyName}" registered`,
        timestamp: supplier.createdAt || new Date(),
        icon: '👤'
      });
    });

    // Add order activities
    recentOrders.forEach(order => {
      let statusMessage = '';
      switch(order.status?.toLowerCase()) {
        case 'approved':
          statusMessage = 'was approved';
          break;
        case 'preparing':
          statusMessage = 'is being prepared';
          break;
        case 'dispatched':
          statusMessage = 'was dispatched';
          break;
        case 'received':
          statusMessage = 'was received';
          break;
        case 'completed':
          statusMessage = 'was completed';
          break;
        default:
          statusMessage = `status updated to ${order.status}`;
      }

      activities.push({
        type: 'order',
        message: `Order #${order._id.toString().slice(-6)} ${statusMessage}${order.supplierId ? ` by ${order.supplierId.name || order.supplierId.companyName}` : ''}`,
        timestamp: order.updatedAt || new Date(),
        icon: '📦',
        orderId: order._id,
        amount: order.totalAmount
      });
    });

    // Sort by timestamp (newest first) and return top 8
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 8);

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
};

export default {
  getSuppliersWithRatings,
  getAllOrders,
  getOrderTracking,
  getSystemLogs,
  getRecentActivities
};
