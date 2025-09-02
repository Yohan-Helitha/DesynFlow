import mongoose from "mongoose";

const PaymentSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  amount: { type: Number },
  method: { type: String, enum: ['Bank', 'Online', 'Cash'] },
  type: { type: String, enum: ['InspoectionCost', 'ProjectPayment'] },
  receiptUrl: { type: String },
  status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], index: true, default: 'Pending' },
  comment: { type: String, default: null, maxlength: 500 },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
