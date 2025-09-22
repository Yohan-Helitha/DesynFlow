import mongoose from "mongoose";
const { Schema } = mongoose;

const SupplierRequestNotificationSchema = new Schema({
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
  purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  status: { type: String, enum: ['New', 'Read', 'Actioned'], default: 'New' }
}, { timestamps: true });

const SupplierRequestNotification = mongoose.model('SupplierRequestNotification', SupplierRequestNotificationSchema);
export default SupplierRequestNotification;
