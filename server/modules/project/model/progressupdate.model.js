import mongoose from "mongoose";
const { Schema } = mongoose;

const ProgressUpdateSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team', index: true },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  summary: { type: String },
  attachments: [{ type: String }], // URLs or file paths to images, PDFs, etc.
  flaggedIssues: [{
    description: { type: String },
    flaggedAt: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date }
  }],
}, { timestamps: true });

export default mongoose.model('ProgressUpdate', ProgressUpdateSchema);
