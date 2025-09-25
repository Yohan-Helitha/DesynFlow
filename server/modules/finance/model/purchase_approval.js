import mongoose from "mongoose";
const { Schema } = mongoose;

const PurchaseApprovalSchema = new Schema({
  purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', unique: true },
  approverId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  note: { type: String },
  decidedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.PurchaseApproval || mongoose.model('PurchaseApproval', PurchaseApprovalSchema);
