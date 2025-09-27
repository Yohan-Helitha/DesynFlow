import PurchaseApproval from '../model/purchase_approval.js';

export async function getApprovalsByStatus(status) {
  const filter = status ? { status } : {};
  return PurchaseApproval.find(filter)
    .populate({ path: 'purchaseOrderId' });
}

export default { getApprovalsByStatus };
