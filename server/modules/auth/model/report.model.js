import mongoose from 'mongoose';

// Report table (matches diagram: report_table)
const reportSchema = new mongoose.Schema({
  InspectionRequest_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InspectionRequest',
    required: true
  },
  
  inspector_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  propertyType: { type: String, required: true },
  propertyLocation: { type: String, required: true },
  inspection_Date: { type: Date, required: true },
  inspection_Date: { type: Date, required: true }, // Completion date
  rooms: { type: Number, required: true },
  
  // Status tracking
  submittedAt: { type: Date, default: Date.now },
  rejectedAt: { type: Date },
  approvedAt: { type: Date },
  
  // Report content
  report_content: { type: String },
  
  // Verification (keep as requested)
  verifiedToken: { type: String },
  validation_status: {
    type: String,
    enum: ['pending', 'validated', 'rejected'],
    default: 'pending'
  }
}, { 
  timestamps: true 
});

// Indexes
reportSchema.index({ InspectionRequest_ID: 1 });
reportSchema.index({ inspector_ID: 1, createdAt: -1 });

export default mongoose.model('Report', reportSchema);
