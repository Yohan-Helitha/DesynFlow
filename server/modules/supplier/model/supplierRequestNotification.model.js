import mongoose from "mongoose";
const { Schema } = mongoose;

const SupplierRequestNotificationSchema = new Schema({
  type: { type: String, enum: ['order_update', 'sample_status_update', 'general'], default: 'general' },
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
  purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  materialId: { type: Schema.Types.ObjectId, ref: 'Material' },
  message: { type: String },
  details: { type: Schema.Types.Mixed },
  status: { type: String, enum: ['New', 'Read', 'Actioned'], default: 'New' }
}, { timestamps: true });

const SupplierRequestNotification = mongoose.model('SupplierRequestNotification', SupplierRequestNotificationSchema);
export default SupplierRequestNotification;
