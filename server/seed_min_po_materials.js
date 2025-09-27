// Seed 5 dummy entries for Materials, SupplierMaterialCatalog, and PurchaseOrders (with items)
import mongoose from 'mongoose';
import 'dotenv/config';
import Material from './modules/finance/model/material.js';
import PurchaseOrder from './modules/finance/model/purchase_order.js';
import SupplierMaterialCatalog from './modules/finance/model/supplier_material_catalog.js';
import Supplier from './modules/finance/model/supplier.js';

async function main() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/desynflow';
  console.log(`[seed] Connecting to ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log('[seed] Connected to MongoDB');

  // Create or find a supplier
  const [supplier] = await Supplier.create([
    { name: 'Supplier A', contactName: 'Alice', email: 'alice@suppliera.test', phone: '0700000001', address: '123 Main St' }
  ]).catch(async (err) => {
    // If duplicate key, fetch an existing supplier
    const existing = await Supplier.findOne();
    return [existing];
  });

  // 1) Materials (5 entries)
  const nowSuffix = Date.now();
  const materialsData = Array.from({ length: 5 }, (_, i) => ({
    materialId: `SEED-${nowSuffix}-${i+1}`,
    materialName: `Seed Material ${i + 1}`,
    category: i % 2 === 0 ? 'Steel' : 'Concrete',
    type: i % 2 === 0 ? 'Beam' : 'Slab',
    unit: 'pcs',
    warrantyPeriod: `${12 + i} months`
  }));
  const materials = await Material.insertMany(materialsData);
  console.log(`[seed] Inserted ${materials.length} Materials`);

  // 2) SupplierMaterialCatalog (5 entries, map 1:1 with above materials)
  const catalogData = materials.map((m, i) => ({
    supplierId: supplier._id,
    materialId: m._id,
    pricePerUnit: 50 + i * 10,
    leadTimeDays: 3 + i,
    active: true
  }));
  // Use upsert-like behavior to avoid unique index conflicts on reruns
  for (const entry of catalogData) {
    await SupplierMaterialCatalog.updateOne(
      { supplierId: entry.supplierId, materialId: entry.materialId },
      { $setOnInsert: entry },
      { upsert: true }
    );
  }
  console.log(`[seed] Ensured ${catalogData.length} SupplierMaterialCatalog entries`);

  // 3) PurchaseOrders (5 entries) each with one item
  const purchaseOrdersData = materials.map((m, i) => {
    const qty = 10 + i;
    const unitPrice = 100 + i * 10;
    const total = qty * unitPrice;
    return {
      requestOrigin: ['Manual', 'ReorderAlert', 'ProjectMR'][i % 3],
      projectId: null, // optional link; keep null for minimal seed
      supplierId: supplier._id,
      requestedBy: null, // optional link; keep null for minimal seed
  status: 'PendingFinanceApproval',
      items: [{
        materialId: m._id,
        materialName: m.materialName,
        qty,
        unitPrice
      }],
      totalAmount: total,
      financeApproval: {
        approverId: null,
        status: 'Pending',
        note: `Seed approval pending for PO ${i + 1}`,
        approvedAt: null
      }
    };
  }).slice(0, 5);

  const purchaseOrders = await PurchaseOrder.insertMany(purchaseOrdersData);
  console.log(`[seed] Inserted ${purchaseOrders.length} PurchaseOrders`);

  await mongoose.disconnect();
  console.log('[seed] Seed complete.');
}

main().catch(async (err) => {
  console.error('Seeding error:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
