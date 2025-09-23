import mongoose from 'mongoose';

// Inspector Enhanced Form - Dynamic inspection details (matches diagram: Inspection_Enhanced_Form_table)
const inspectorFormSchema = new mongoose.Schema({
  // Links to inspection request
  InspectionRequest_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InspectionRequest',
    required: true
  },
  
  // Inspector info
  inspector_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Dynamic room details (filled by inspector after visiting)
  floor_number: { type: Number, required: true },
  roomID: { type: String, required: true },
  room_name: { type: String, required: true },
  status: { 
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  
  // Inspector measurements (not client responsibility)
  inspection_Date: { type: Date, default: Date.now },
  room_dimension: { type: String }, // Inspector measures this
  room_photo: [String], // Inspector takes photos
  
  // Removed verification tokens as inspector forms don't need them
  
  // Inspector notes
  inspector_notes: { type: String },
  completion_status: {
    type: String,
    enum: ['draft', 'submitted', 'approved'],
    default: 'draft'
  }
}, { 
  timestamps: true 
});

// Indexes for performance
inspectorFormSchema.index({ InspectionRequest_ID: 1 });
inspectorFormSchema.index({ inspector_ID: 1, createdAt: -1 });
inspectorFormSchema.index({ status: 1 });

export default mongoose.model('InspectorForm', inspectorFormSchema);
