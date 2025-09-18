import * as purchaseOrderService from '../service/purchaseOrderService.js';

// View requests by status
export async function getRequestsByStatus(req, res) {
  try {
    const { status } = req.query;
    const requests = await purchaseOrderService.getRequestsByStatus(status);
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
