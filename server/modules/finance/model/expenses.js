import mongoose from "mongoose";

const ExpenseSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
  category: { type: String, enum: ['Labor', 'Procurement', 'Transport', 'Misc'] },
  amount: { type: Number },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
