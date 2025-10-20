import mongoose from 'mongoose';

const { Schema } = mongoose;

const InspectionEstimateSchema = new Schema({
  inspectionRequestId: { type: Schema.Types.ObjectId, ref: 'InspectionRequest', unique: true },
  distanceKm: { type: Number },
  estimatedCost: { type: Number },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  paymentAmount: { type: Number },
  paymentStatus: { type: String, enum: ['pending', 'uploaded', 'verified', 'rejected'], default: 'pending' },
  paymentReceiptUrl: { type: String }
}, { timestamps: true });

export default mongoose.model('InspectionEstimate', InspectionEstimateSchema);