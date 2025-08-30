import mongoose from "mongoose";

const ProjectEstimateSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
  version: { type: Number, default: 1 },
  laborCost: { type: Number },
  materialCost: { type: Number },
  serviceFees: { type: Number },
  contingency: { type: Number },
  total: { type: Number },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
ProjectEstimateSchema.index({ projectId: 1, version: 1 }, { unique: true });
