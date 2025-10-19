import mongoose from "mongoose";
const { Schema } = mongoose;

const TaskSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
  sprintId: { type: Schema.Types.ObjectId, ref: 'Sprint', index: true, sparse: true },
  name: { type: String },
  description: { type: String },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  weight: { type: Number, default: 0 },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date },
  status: { type: String, enum: ['Pending', 'In Progress', 'Done', 'Completed', 'Blocked'], index: true, default: 'Pending' },
  completedAt: { type: Date },
  progressPercentage: { type: Number, default: 0 },
  
  // Enhanced issue tracking for blocked tasks
  blockDetails: {
    isBlocked: { type: Boolean, default: false },
    blockedAt: { type: Date },
    blockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    issueDescription: { type: String },
    progressUpdateId: { type: Schema.Types.ObjectId, ref: 'ProgressUpdate' }, // Links to the progress update created
    resolvedAt: { type: Date },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  
  // File attachments for task
  attachments: [{
    filename: { type: String },
    originalName: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
    fileSize: { type: Number },
    mimeType: { type: String }
  }],
  
  // Comments system
  comments: [{
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Task', TaskSchema);
