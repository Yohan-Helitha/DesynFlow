import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Ensure .env is loaded from this script's directory (ESM-safe)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Supplier from './modules/supplier/model/supplier.model.js';
import SupplierRating from './modules/supplier/model/supplierRating.model.js';
import MaterialCatalog from './modules/supplier/model/materialCatalog.model.js';
import PurchaseOrder from './modules/supplier/model/purchaseOrder.model.js';
import SampleOrder from './modules/supplier/model/sampleOrder.model.js';
import SupplierStatusUpdate from './modules/supplier/model/supplierStatusUpdate.model.js';
import SupplierRequestNotification from './modules/supplier/model/supplierRequestNotification.model.js';

// Support both keys, prefer MONGO_URI (matches server config)
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
console.log('Loaded Mongo URI:', mongoUri ? '[REDACTED]' : undefined);
if (!mongoUri) {
  console.error('ERROR: MONGO_URI (or MONGODB_URI) is not set. Check your server/.env file.');
  process.exit(1);
}
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const supplierIds = Array.from({ length: 5 }, () => new mongoose.Types.ObjectId());
const userIds = Array.from({ length: 5 }, () => new mongoose.Types.ObjectId());
const materialIds = Array.from({ length: 5 }, () => new mongoose.Types.ObjectId());
const purchaseOrderIds = Array.from({ length: 5 }, () => new mongoose.Types.ObjectId());

const suppliers = [
  { companyName: 'Global Interiors Ltd', contactName: 'Jane Doe', email: 'jane@global.com', phone: '+1-555-555-5555', materialTypes: ['Wood', 'Metal'], deliveryRegions: ['North', 'East'], rating: 4.5 },
  { companyName: 'Urban Furnishings', contactName: 'John Smith', email: 'john@urban.com', phone: '+1-555-555-1234', materialTypes: ['Plastic', 'Glass'], deliveryRegions: ['South', 'West'], rating: 4.2 },
  { companyName: 'EcoBuild', contactName: 'Alice Green', email: 'alice@ecobuild.com', phone: '+1-555-555-6789', materialTypes: ['Bamboo', 'Steel'], deliveryRegions: ['East', 'Central'], rating: 4.8 },
  { companyName: 'Prime Materials', contactName: 'Bob Lee', email: 'bob@prime.com', phone: '+1-555-555-2468', materialTypes: ['Concrete', 'Wood'], deliveryRegions: ['North', 'Central'], rating: 4.0 },
  { companyName: 'Modern Metals', contactName: 'Carol White', email: 'carol@modern.com', phone: '+1-555-555-1357', materialTypes: ['Aluminum', 'Copper'], deliveryRegions: ['West', 'South'], rating: 4.6 }
].map((data, i) => new Supplier({ ...data, _id: supplierIds[i] }));

const supplierRatings = supplierIds.map((sid, i) => new SupplierRating({
  supplierId: sid,
  ratedBy: userIds[i],
  criteria: { timeliness: 5 - i % 2, quality: 4 + i % 2, communication: 5 - i % 3 },
  weightedScore: 4.5 + i * 0.1
}));

const materialCatalogs = supplierIds.map((sid, i) => new MaterialCatalog({
  supplierId: sid,
  materialId: materialIds[i],
  pricePerUnit: 40 + i * 10,
  leadTimeDays: 5 + i,
  active: i % 2 === 0
}));

const purchaseOrders = purchaseOrderIds.map((poid, i) => new PurchaseOrder({
  _id: poid,
  requestOrigin: ['ReorderAlert', 'Manual', 'ProjectMR'][i % 3],
  projectId: new mongoose.Types.ObjectId(),
  supplierId: supplierIds[i],
  requestedBy: userIds[i],
  status: ['Draft', 'Approved', 'Rejected', 'SentToSupplier', 'Delivered'][i % 5],
  items: [
    { materialId: materialIds[i], materialName: `Material${i+1}`, qty: 10 + i, unitPrice: 50 + i * 5 },
    { materialId: materialIds[(i + 1) % 5], materialName: `Material${((i+1)%5)+1}`, qty: 5 + i, unitPrice: 60 + i * 3 }
  ],
  totalAmount: 500 + i * 100,
  financeApproval: {
    approverId: userIds[(i + 1) % 5],
    status: ['Pending', 'Approved', 'Rejected'][i % 3],
    note: 'Finance review',
    approvedAt: new Date()
  }
}));

const sampleOrders = supplierIds.map((sid, i) => new SampleOrder({
  supplierId: sid,
  materialId: materialIds[i],
  requestedBy: userIds[i],
  status: ['Requested', 'Submitted', 'Approved', 'Rejected'][i % 4],
  files: [`sample${i + 1}.pdf`],
  reviewNote: `Review note ${i + 1}`
}));

const supplierStatusUpdates = purchaseOrderIds.map((poid, i) => new SupplierStatusUpdate({
  purchaseOrderId: poid,
  supplierId: supplierIds[i],
  status: ['Accepted', 'Rejected', 'In Progress', 'Dispatched', 'Delivered'][i % 5],
  note: `Status update ${i + 1}`
}));

const supplierRequestNotifications = purchaseOrderIds.map((poid, i) => new SupplierRequestNotification({
  supplierId: supplierIds[i],
  purchaseOrderId: poid,
  status: ['New', 'Read', 'Actioned'][i % 3]
}));


async function seed() {
  // Log counts before
  const models = [
    { name: 'Supplier', model: Supplier },
    { name: 'SupplierRating', model: SupplierRating },
    { name: 'MaterialCatalog', model: MaterialCatalog },
    { name: 'PurchaseOrder', model: PurchaseOrder },
    { name: 'SampleOrder', model: SampleOrder },
    { name: 'SupplierStatusUpdate', model: SupplierStatusUpdate },
    { name: 'SupplierRequestNotification', model: SupplierRequestNotification }
  ];
  for (const { name, model } of models) {
    const count = await model.countDocuments();
    console.log(`Before: ${name} count = ${count}`);
    await model.deleteMany({});
    console.log(`Cleared ${name}`);
  }

  try {
    await Promise.all([
      ...suppliers.map(s => s.save()),
      ...supplierRatings.map(sr => sr.save()),
      ...materialCatalogs.map(mc => mc.save()),
      ...purchaseOrders.map(po => po.save()),
      ...sampleOrders.map(so => so.save()),
      ...supplierStatusUpdates.map(ssu => ssu.save()),
      ...supplierRequestNotifications.map(srn => srn.save())
    ]);
    console.log('Dummy data inserted for all models!');
    // Log counts after
    for (const { name, model } of models) {
      const count = await model.countDocuments();
      console.log(`After: ${name} count = ${count}`);
    }
  } catch (err) {
    console.error('Error inserting dummy data:', err);
  } finally {
    mongoose.disconnect();
  }
}

seed();
