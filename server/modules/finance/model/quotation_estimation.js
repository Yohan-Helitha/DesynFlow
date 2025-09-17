import mongoose from "mongoose";

const QuotationSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
  estimateVersion: { type: Number },
  version: { type: Number },
  total: { type: Number },
  status: { type: String, enum: ['Draft', 'Sent', 'Revised', 'Confirmed', 'Locked'], default: 'Draft' },
  fileUrl: { type: String },
  locked: { type: Boolean, default: false }
}, { timestamps: true });
QuotationSchema.index({ projectId: 1, version: 1 }, { unique: true });
