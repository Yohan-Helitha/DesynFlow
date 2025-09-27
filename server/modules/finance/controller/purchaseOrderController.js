import * as purchaseOrderService from '../service/purchaseOrderService.js';

// View requests by status
export async function getRequestsByStatus(req, res) {
  try {
    const { status, approvalStatus } = req.query;
    const requests = await purchaseOrderService.getRequestsByStatus(status, approvalStatus);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Approve request
export async function approveRequest(req, res) {
  try {
    const { requestId } = req.params;
    const request = await purchaseOrderService.updateRequestStatus(requestId, 'Approved');
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Reject request
export async function rejectRequest(req, res) {
  try {
    const { requestId } = req.params;
    const request = await purchaseOrderService.updateRequestStatus(requestId, 'Rejected');
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get detailed purchase order with populated refs
export async function getPurchaseOrderDetails(req, res) {
  try {
    const { id } = req.params;
    const po = await purchaseOrderService.getPurchaseOrderDetails(id);
    if (!po) return res.status(404).json({ error: 'Purchase order not found' });
    res.json(po);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
