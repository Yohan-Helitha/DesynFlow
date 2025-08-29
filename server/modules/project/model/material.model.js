import mongoose from "mongoose";


const ManpowerRequestSchema = new Schema({
  role: { type: String },
  qty: { type: Number },
  neededBy: { type: Date }
}, { _id: false });

const MaterialRequestSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  items: [MaterialRequestItemSchema],
  manpower: [ManpowerRequestSchema],
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'PartiallyApproved', 'Fulfilled'], index: true, default: 'Pending' },
  warehouseNote: { type: String }
}, { timestamps: true });

const MaterialRequestItemSchema = new Schema({
  materialId: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
  qty: { type: Number, required: true },
  neededBy: { type: Date }
}, { _id: false });
