import mongoose from "mongoose";


const ProjectSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, required: true },
  projectName: { type: String, required: true },
  inspectionId: { type: Schema.Types.ObjectId, ref: 'InspectionRequest', unique: true, sparse: true },
  projectManagerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  assignedTeamId: { type: Schema.Types.ObjectId, ref: 'Team' },
  status: { type: String, enum: ['On Hold', 'Active', 'In Progress', 'Completed', 'Cancelled'], index: true, default: 'Active' },
  progress: { type: Number, default: 0 },
  milestones: [{ type: Schema.Types.ObjectId, ref: 'Milestone' }],
  timeline: [{
    name: { type: String },
    date: { type: Date },
    description: { type: String }
  }],
  archived: { type: Boolean, default: false },
  attachments: [{ type: String }], // URLs or file paths to inspection report PDFs
  finalDesign3DUrl: { type: String },
  designAccessRestriction: { type: Boolean, default: false }
}, { timestamps: true });
