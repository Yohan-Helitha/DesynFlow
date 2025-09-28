import mongoose from 'mongoose';

// Enhanced Report model for inspector dashboard
const reportSchema = new mongoose.Schema({
  // Reference to inspection (if generated from inspection)
  inspectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inspection'
  },
  
  // Inspector who generated the report
  inspectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Report metadata
  title: {
    type: String,
    required: true
  },
  
  // Report data/content
  reportData: {
    clientName: String,
    propertyAddress: String,
    propertyType: String,
    inspectionDate: Date,
    findings: String,
    recommendations: String,
    inspectorNotes: String,
    inspectorName: String
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'completed', 'submitted'],
    default: 'completed'
  },
  
  generatedAt: {
    type: Date,
    default: Date.now
  },
  
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // PDF file path (if stored locally)
  pdfPath: String,
  
  // Notification status
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const AuthInspectionReport = mongoose.model('AuthInspectionReport', reportSchema);
export default AuthInspectionReport;
