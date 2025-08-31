const purchaseOrderService = require('../service/purchaseOrderService');

// Approve or reject material purchase request
exports.financeApproval = async (req, res) => {
  const { orderId } = req.params;
  const { status, approverId, note } = req.body;
  try {
    const order = await purchaseOrderService.financeApproval({ orderId, status, approverId, note });
    res.json(order);
  } catch (err) {
    if (err.message === 'Invalid status') {
      return res.status(400).json({ error: err.message });
    }
    if (err.message === 'Order not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// Get material purchase history (not rejected)
exports.getPurchaseHistory = async (req, res) => {
  try {
    const orders = await purchaseOrderService.getPurchaseHistory();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
