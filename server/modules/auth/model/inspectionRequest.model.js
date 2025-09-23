import mongoose from 'mongoose';

// Simple Client Inspection Request (matches diagram: inspection_request_table)
const inspectionRequestSchema = new mongoose.Schema({
  // Links to User table
  client_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  client_name: { type: String, required: true },
  email: { type: String, required: true },
  phone_number: { type: String, required: true },
  
  // Property basics
  propertyLocation_address: { type: String, required: true },
  propertyLocation_city: { type: String, required: true },
  propertyType: { 
    type: String, 
    enum: ['residential', 'commercial', 'apartment'],
    required: true 
  },
  number_of_floor: { type: Number, default: 1 },
  number_of_room: { type: Number, required: true },
  room_name: [String],
  
  // Status
  inspection_date: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Security
  verifiedToken: { type: String },
  tokenExpiry: { type: Date }
}, { 
  timestamps: true 
});

inspectionRequestSchema.index({ client_ID: 1, createdAt: -1 });
inspectionRequestSchema.index({ status: 1 });

export default mongoose.model('InspectionRequest', inspectionRequestSchema);
