import mongoose from 'mongoose';

// Room schema for dynamic room management
const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  roomName: { type: String, required: true },
  roomNumber: { type: String },
  roomSize: {
    length: { type: Number },
    width: { type: Number },
    unit: { type: String, enum: ['ft', 'm'], default: 'ft' }
  },
  dimensions: { type: String },
  photos: [{ type: String }], // Array of file paths/URLs
  designPreferences: {
    style: { type: String },
    colors: [{ type: String }],
    materials: [{ type: String }],
    specialRequirements: { type: String }
  },
  reusedFromRoom: { type: String } // Reference to another room's preferences
}, { _id: false });

// Floor schema for multi-floor properties
const floorSchema = new mongoose.Schema({
  floorNumber: { type: Number, required: true },
  floorName: { type: String }, // e.g., "Ground Floor", "First Floor"
  rooms: [roomSchema],
  floorPlan: { type: String }, // File path/URL to floor plan image
  totalRooms: { type: Number, default: 0 }
}, { _id: false });

// Enhanced inspection request schema
const enhancedInspectionRequestSchema = new mongoose.Schema({
  // Client Information
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  
  // Property Details
  propertyLocation: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zipCode: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  
  propertyType: {
    type: String,
    enum: ['house', 'apartment', 'hotel', 'office', 'commercial', 'warehouse', 'other'],
    required: true
  },
  
  numberOfFloors: { type: Number, required: true, min: 1 },
  floors: [floorSchema],
  
  // Inspection Preferences
  preferredInspectionDate: { type: Date, required: true },
  alternativeDate1: { type: Date },
  alternativeDate2: { type: Date },
  
  // Documents & Images
  documents: [{
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String }, // 'sitePlan', 'propertyPhoto', 'document'
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Payment Information
  paymentReceiptUrl: { type: String },
  paymentStatus: {
    type: String,
    enum: ['pending', 'uploaded', 'verified', 'rejected'],
    default: 'pending'
  },
  paymentAmount: { type: Number },
  
  // Request Status & Workflow
  status: {
    type: String,
    enum: ['draft', 'pending', 'payment_pending', 'payment_verified', 'assigned', 'scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // Assignment Information
  assignedInspector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: { type: Date },
  scheduledDate: { type: Date },
  
  // Progress Tracking
  formProgress: {
    basicDetails: { type: Boolean, default: false },
    floorDetails: { type: Boolean, default: false },
    documents: { type: Boolean, default: false },
    payment: { type: Boolean, default: false }
  },
  
  // Notes & Special Requirements
  specialInstructions: { type: String },
  urgency: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Audit Trail
  statusHistory: [{
    status: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    reason: { type: String }
  }],
  
  // Completion Details
  completedAt: { type: Date },
  reportGenerated: { type: Boolean, default: false },
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total rooms across all floors
enhancedInspectionRequestSchema.virtual('totalRooms').get(function() {
  return this.floors.reduce((total, floor) => total + floor.rooms.length, 0);
});

// Virtual for completion percentage
enhancedInspectionRequestSchema.virtual('completionPercentage').get(function() {
  const steps = Object.values(this.formProgress);
  const completedSteps = steps.filter(step => step === true).length;
  return Math.round((completedSteps / steps.length) * 100);
});

// Indexes for better query performance
enhancedInspectionRequestSchema.index({ client: 1, createdAt: -1 });
enhancedInspectionRequestSchema.index({ status: 1, createdAt: -1 });
enhancedInspectionRequestSchema.index({ assignedInspector: 1, scheduledDate: 1 });
enhancedInspectionRequestSchema.index({ 'propertyLocation.coordinates': '2dsphere' });

// Pre-save middleware to update total rooms
enhancedInspectionRequestSchema.pre('save', function(next) {
  this.floors.forEach(floor => {
    floor.totalRooms = floor.rooms.length;
  });
  next();
});

export default mongoose.model('EnhancedInspectionRequest', enhancedInspectionRequestSchema);