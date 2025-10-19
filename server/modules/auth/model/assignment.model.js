import mongoose from 'mongoose';

// Assignment table (matches diagram: assignment_table)
const assignmentSchema = new mongoose.Schema({
  assignID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  
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
  
  assignAt: { 
    type: Date, 
    default: Date.now 
  },
  
  status: { 
    type: String, 
    enum: ['assigned', 'in-progress', 'paused', 'completed', 'declined'], 
    default: 'assigned' 
  },
  
  // Inspection timing
  inspection_start_time: { type: Date },
  inspection_end_time: { type: Date },
  
  // Action tracking
  decline_reason: { type: String },
  action_notes: { type: String },
  
  // Keep validation features as requested
  verifiedToken: { type: String },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes
assignmentSchema.index({ InspectionRequest_ID: 1 });
assignmentSchema.index({ inspector_ID: 1, assignAt: -1 });

export default mongoose.model('Assignment', assignmentSchema);
