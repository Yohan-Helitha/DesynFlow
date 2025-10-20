import PurchaseOrder from '../../supplier/model/purchaseOrder.model.js';

export async function getApprovalsByStatus(status) {
  const filter = status ? { 'financeApproval.status': status } : {};
  return PurchaseOrder.find(filter)
    .populate({ path: 'supplierId', select: 'companyName contactName' })
    .populate({ path: 'projectId', select: 'projectName' })
    .populate({ path: 'requestedBy', select: 'name email' });
}

export default { getApprovalsByStatus };
