import DashboardService from '../service/dashboard.service.js';

// View all suppliers and their ratings
export const getSuppliersWithRatings = async (req, res) => {
  try {
    const suppliers = await DashboardService.getSuppliersWithRatings();
    res.status(200).json(suppliers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// View all requests, approvals, deliveries
export const getAllOrders = async (req, res) => {
  try {
    const orders = await DashboardService.getAllOrders();
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// See live tracking of current orders
export const getOrderTracking = async (req, res) => {
  try {
    const tracking = await DashboardService.getOrderTracking(req.params.purchaseOrderId);
    res.status(200).json(tracking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Check system logs
export const getSystemLogs = async (req, res) => {
  try {
    const logs = await DashboardService.getSystemLogs();
    res.status(200).json(logs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get recent activities for dashboard
export const getRecentActivities = async (req, res) => {
  try {
    const activities = await DashboardService.getRecentActivities();
    res.status(200).json(activities);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
