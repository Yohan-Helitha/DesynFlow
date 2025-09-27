// Seed 5 dummy PurchaseApproval entries linked to existing PurchaseOrders
import mongoose from 'mongoose';
import 'dotenv/config';
import PurchaseOrder from './modules/finance/model/purchase_order.js';
import PurchaseApproval from './modules/finance/model/purchase_approval.js';

async function main() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/desynflow';
  console.log(`[seed] Connecting to ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log('[seed] Connected to MongoDB');

  // Find 5 purchase orders (most recent)
  const purchaseOrders = await PurchaseOrder.find().sort({ createdAt: -1 }).limit(5);
  if (purchaseOrders.length === 0) {
    console.log('[seed] No purchase orders found. Run seed_min_po_materials.js first.');
    await mongoose.disconnect();
    return;
  }

  // Create 5 purchase approvals, one for each PO
  const approvals = await PurchaseApproval.insertMany(
    purchaseOrders.map((po, i) => ({
      purchaseOrderId: po._id,
      approverId: null, // or set to a valid User _id
      status: 'Pending',
      note: `Seeded approval for PO ${po._id}`,
      decidedAt: null
    }))
  );
  console.log(`[seed] Inserted ${approvals.length} PurchaseApprovals`);

  await mongoose.disconnect();
  console.log('[seed] Seed complete.');
}

main().catch(async (err) => {
  console.error('Seeding error:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
