import mongoose from 'mongoose';


const InspectionEstimateSchema = new Schema({
  inspectionRequestId: { type: Schema.Types.ObjectId, ref: 'InspectionRequest', unique: true },
  distanceKm: { type: Number },
  estimatedCost: { type: Number },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });


