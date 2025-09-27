import mongoose from 'mongoose';

const { Schema } = mongoose;

const FinanceSummarySchema = new Schema({
  totalIncome: { type: Number, required: true, default: 0 },
  totalBalance: { type: Number, required: true, default: 0 },
}, { timestamps: true });

export default mongoose.model('FinanceSummary', FinanceSummarySchema);