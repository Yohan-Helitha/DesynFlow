import mongoose from "mongoose";
const { Schema } = mongoose;
import PurchaseOrderItemSchema from "./purchase_order_item.js";

const PurchaseOrderSchema = new Schema({
  requestOrigin: { type: String, enum: ['ReorderAlert', 'Manual', 'ProjectMR'] },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Draft', 'PendingFinanceApproval', 'Approved', 'Rejected', 'SentToSupplier', 'InProgress', 'Delivered', 'Closed'], default: 'Draft' },
  items: [PurchaseOrderItemSchema],
  totalAmount: { type: Number },
  financeApproval: {
    approverId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'] },
    note: { type: String },
    approvedAt: { type: Date }
  }
}, { timestamps: true });

const PurchaseOrder = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
export default PurchaseOrder;