import SupplierStatusService from '../service/supplierStatus.service.js';

// Supplier updates status (Accept, Reject, In Progress, Dispatched)
export const updateSupplierStatus = async (req, res) => {
  try {
    const statusUpdate = await SupplierStatusService.updateStatus(req.body);
    res.status(200).json(statusUpdate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get status updates for a purchase order
export const getStatusUpdates = async (req, res) => {
  try {
    const updates = await SupplierStatusService.getStatusUpdates(req.params.purchaseOrderId);
    res.status(200).json(updates);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
