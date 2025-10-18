
import mongoose from 'mongoose';
const { Schema } = mongoose;

const PaymentSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['Bank', 'Online', 'Cash'] },
  type: { type: String, enum: ['Advance', 'Final'] },
  receiptUrl: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], index: true, default: 'Pending' },
  comment: { type: String, default: null, maxlength: 500 },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Payment', PaymentSchema);
