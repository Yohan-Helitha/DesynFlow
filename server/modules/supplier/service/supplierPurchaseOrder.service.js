import PurchaseOrder from '../model/purchaseOrder.model.js';

// Get orders for a specific supplier
export async function getSupplierOrdersService(supplierId) {
  return PurchaseOrder.find({ supplierId })
    .populate({ path: 'projectId', select: 'projectName status clientId' })
    .populate({ path: 'requestedBy', select: 'name email' })
    .populate({ path: 'items.materialId', select: 'materialName category type unit' })
    .sort({ createdAt: -1 });
}