import mongoose from "mongoose";
const { Schema } = mongoose;

const ProjectSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, required: true, default: () => new mongoose.Types.ObjectId() },
  projectName: { type: String, required: true },
  inspectionId: { type: Schema.Types.ObjectId, ref: 'InspectionRequest', unique: true, sparse: true },
  projectManagerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  assignedTeamId: { type: Schema.Types.ObjectId, ref: 'Team' },
  status: { type: String, enum: ['On Hold', 'Active', 'In Progress', 'Completed', 'Cancelled'], index: true, default: 'Active' },
  progress: { type: Number, default: 0 },
  startDate: { type: Date },
  dueDate: { type: Date },
  milestones: [{ type: Schema.Types.ObjectId, ref: 'Milestone' }],
  timeline: [{
    name: { type: String },
    date: { type: Date },
    description: { type: String }
  }],
  archived: { type: Boolean, default: false },
  attachments: [{ 
    filename: { type: String }, // Server filename
    originalName: { type: String }, // Original uploaded filename
    path: { type: String }, // URL path to file
    uploadDate: { type: Date, default: Date.now }
  }], // Inspection report PDFs and other documents
  finalDesign3DUrl: { type: String },
  designAccessRestriction: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Project', ProjectSchema);
