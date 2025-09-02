import mongoose from "mongoose";
const SampleSchema = new Schema({
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
  materialId: { type: Schema.Types.ObjectId, ref: 'Material' },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Requested', 'Submitted', 'Approved', 'Rejected'], default: 'Requested' },
  files: [{ type: String }],
  reviewNote: { type: String }
}, { timestamps: true });
