import PurchaseOrderService from '../service/purchaseOrder.service.js';

// Create material request
export const createPurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrderService.createPurchaseOrder(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update material request
export const updatePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrderService.updatePurchaseOrder(req.params.id, req.body);
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all material requests
export const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrderService.getAllPurchaseOrders();
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Forward for finance approval
export const forwardToFinance = async (req, res) => {
  try {
    const order = await PurchaseOrderService.forwardToFinance(req.params.id);
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Approve or reject finance
export const financeApproval = async (req, res) => {
  try {
    const order = await PurchaseOrderService.financeApproval(req.params.id, req.body);
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get approval status
export const getApprovalStatus = async (req, res) => {
  try {
    const status = await PurchaseOrderService.getApprovalStatus(req.params.id);
    res.status(200).json(status);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
