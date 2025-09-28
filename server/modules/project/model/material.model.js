import mongoose from "mongoose";
const { Schema } = mongoose;

const MaterialRequestItemSchema = new Schema({
  itemName: { type: String, required: true },
  qty: { type: Number, required: true }
}, { _id: false });

const MaterialRequestSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  items: [MaterialRequestItemSchema],
  neededBy: { type: Date, required: true }, // Single date for entire request
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'PartiallyApproved', 'Fulfilled'], index: true, default: 'Pending' },
  warehouseNote: { type: String }
}, { timestamps: true });

export default mongoose.model('MaterialRequest', MaterialRequestSchema);
