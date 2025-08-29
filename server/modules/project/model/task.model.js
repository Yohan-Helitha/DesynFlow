import mongoose from "mongoose";


const TaskSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
  sprintId: { type: Schema.Types.ObjectId, ref: 'Sprint', index: true, sparse: true },
  name: { type: String },
  description: { type: String },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  weight: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'In Progress', 'Done', 'Blocked'], index: true, default: 'Pending' },
  completedAt: { type: Date },
  progressPercentage: { type: Number, default: 0 }
}, { timestamps: true });
