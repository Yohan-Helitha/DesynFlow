import PurchaseOrder from '../model/purchase_order.js';

// View requests by status
export async function getRequestsByStatus(status) {
  const filter = status ? { status } : {};
  return PurchaseOrder.find(filter);
}

// Update request status (approve/reject)
export async function updateRequestStatus(requestId, status) {
  return PurchaseOrder.findByIdAndUpdate(requestId, { status }, { new: true });
}
