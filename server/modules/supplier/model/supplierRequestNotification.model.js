import mongoose from "mongoose";
const SupplierRequestNotificationSchema = new Schema({
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', index: true },
  purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', index: true },
  status: { type: String, enum: ['New', 'Read', 'Actioned'], default: 'New' }
}, { timestamps: true });
