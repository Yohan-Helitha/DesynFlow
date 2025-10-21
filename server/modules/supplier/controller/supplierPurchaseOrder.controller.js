import { getSupplierOrdersService } from '../service/supplierPurchaseOrder.service.js';

// Get purchase orders for authenticated supplier
export async function getSupplierPurchaseOrders(req, res) {
  try {
    const supplierId = req.supplier.id;
    const orders = await getSupplierOrdersService(supplierId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}