import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  floor: { type: Number, required: true },
  dimensions: { type: String },
  preferences: { type: String },
  materials: { type: String }
}, { _id: false });

const reportSchema = new mongoose.Schema({
  inspectionRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InspectionRequest',
    required: true
  },
  inspector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  propertyType: { type: String, required: true },
  siteLocation: { type: String, required: true },
  inspectionDate: { type: Date, required: true },
  rooms: [roomSchema],
  generalNotes: { type: String },
  reportFilePath: { type: String }, // for uploaded report file (PDF, etc.)
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed', 'approved', 'rejected'],
    default: 'draft'
  },
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  remarks: { type: String }
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);