import mongoose from "mongoose";

const { Schema } = mongoose;

const ExpenseSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
  category: { type: String, enum: ['Labor', 'Procurement', 'Transport', 'Misc'] },
  amount: { type: Number },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  proof: { type: String, default: null }
}, { timestamps: true });

//Created
export default mongoose.model('Expense', ExpenseSchema);
