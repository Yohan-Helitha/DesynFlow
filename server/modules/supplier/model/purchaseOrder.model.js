import mongoose from "mongoose";
const PurchaseOrderSchema = new Schema({
  requestOrigin: { type: String, enum: ['ReorderAlert', 'Manual', 'ProjectMR'] },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', index: true },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  status: { type: String, enum: ['Draft', 'PendingFinanceApproval', 'Approved', 'Rejected', 'SentToSupplier', 'InProgress', 'Delivered', 'Closed'], index: true, default: 'Draft' },
  items: [PurchaseOrderItemSchema],
  totalAmount: { type: Number },
  financeApproval: {
    approverId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'] },
    note: { type: String },
    approvedAt: { type: Date }
  }
}, { timestamps: true });
