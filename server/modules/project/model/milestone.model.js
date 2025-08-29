import mongoose from "mongoose";
const { Schema } = mongoose;

const MilestoneSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Milestone', MilestoneSchema);
