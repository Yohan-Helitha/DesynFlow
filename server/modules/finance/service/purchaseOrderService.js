import PurchaseOrder from '../../supplier/model/purchaseOrder.model.js';
import mongoose from 'mongoose';

// View requests by status or finance approval status
export async function getRequestsByStatus(status, approvalStatus) {
  const filter = {};
  if (status) filter.status = status;
  if (approvalStatus) filter['financeApproval.status'] = approvalStatus;
  return PurchaseOrder.find(filter)
    .populate({ path: 'supplierId', select: 'companyName contactName email phone address' })
    .populate({ path: 'projectId', select: 'projectName status clientId' })
    .populate({ path: 'requestedBy', select: 'name email' })
    .populate({ path: 'items.materialId', select: 'materialName category type unit' });
}

// Update request status (approve/reject)
export async function updateRequestStatus(requestId, status) {
  return PurchaseOrder.findByIdAndUpdate(requestId, { status }, { new: true });
}

// Get a single PO with populated relations
export async function getPurchaseOrderDetails(purchaseOrderId) {
  if (!mongoose.Types.ObjectId.isValid(purchaseOrderId)) {
    throw new Error('Invalid purchaseOrderId');
  }
  return PurchaseOrder.findById(purchaseOrderId)
    .populate({ path: 'supplierId', select: 'companyName contactName email phone address' })
    .populate({ path: 'projectId', select: 'projectName status clientId' })
    .populate({ path: 'requestedBy', select: 'name email' })
    .populate({ path: 'items.materialId', select: 'materialName category type unit' });
}
