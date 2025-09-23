import mongoose from 'mongoose';

// Inspector Location table (matches diagram: Inspector_location_table)
const inspectorLocationSchema = new mongoose.Schema({
  inspector_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  inspector_latitude: { type: Number, required: true },
  inspector_longitude: { type: Number, required: true },
  updateAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available'
  },
  
  // Keep validation as requested
  verifiedToken: { type: String }
}, {
  timestamps: true
});

// Indexes for location queries
inspectorLocationSchema.index({ inspector_ID: 1 });
inspectorLocationSchema.index({ 
  inspector_latitude: 1, 
  inspector_longitude: 1 
});

export default mongoose.model('InspectorLocation', inspectorLocationSchema);
