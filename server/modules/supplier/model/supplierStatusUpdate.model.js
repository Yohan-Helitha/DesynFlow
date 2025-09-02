import mongoose from "mongoose";
const SupplierRequestStatusUpdateSchema = new Schema({
  purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', index: true },
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
  status: { type: String, enum: ['Accepted', 'Rejected', 'In Progress', 'Dispatched', 'Delivered'] },
  note: { type: String }
}, { timestamps: true });
