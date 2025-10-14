import mongoose from 'mongoose';

// Inspector Enhanced Form - Dynamic inspection details
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
  
  // Dynamic floors and rooms structure
  floors: [{
    floor_number: { type: Number, required: true },
    rooms: [{
      room_name: { type: String, required: true },
      dimensions: {
        length: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        unit: { type: String, default: 'feet' }
      }
    }]
  }],
  
  // Inspector recommendations
  recommendations: { type: String },
  
  status: { 
    type: String,
    enum: ['draft', 'in-progress', 'completed'],
    default: 'draft'
  },
  
  // Inspection date
  inspection_Date: { type: Date, default: Date.now },

  // Form completion flag
  report_generated: {
    type: Boolean,
    default: false
  }

}, { 
  timestamps: true 
});

// Indexes for performance
inspectorFormSchema.index({ InspectionRequest_ID: 1 });
inspectorFormSchema.index({ inspector_ID: 1, createdAt: -1 });
inspectorFormSchema.index({ status: 1 });

export default mongoose.model('InspectorForm', inspectorFormSchema);
