import mongoose from "mongoose";
const { Schema } = mongoose;

const SupplierStatusUpdateSchema = new Schema({
  purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
  status: { type: String, enum: ['Accepted', 'Rejected', 'In Progress', 'Dispatched', 'Delivered'] },
  note: { type: String }
}, { timestamps: true });

const SupplierStatusUpdate = mongoose.model('SupplierStatusUpdate', SupplierStatusUpdateSchema);
export default SupplierStatusUpdate;
