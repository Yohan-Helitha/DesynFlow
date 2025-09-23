
import mongoose from 'mongoose';
import crypto from 'crypto';

const paymentReceiptSchema = new mongoose.Schema({
  // Essential reference fields
  inspectionRequest_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InspectionRequest',
    required: true
  },
  client_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // File and payment details
  receipt_file_path: {
    type: String,
    default: ''  // Set when file is uploaded via one-time link
  },
  status: {
    type: String,
    enum: ['in-progress', 'pending', 'verified', 'rejected'],
    default: 'in-progress'
  },
  
  // One-time email link validation (simplified)
  uploadToken: {
    type: String,
    required: true,
    unique: true
  },
  tokenExpiry: {
    type: Date,
    required: true
  },
  
  // Payment calculation from finance
  calculatedAmount: {
    type: Number,
    required: true
  },
  payment_dueDate: {
    type: Date,
    required: true
  },
  
  // Verification tracking
  verifiedAt: {
    type: Date,
    default: null
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectionReason: {
    type: String,
    default: ''
  }
  
}, {
  timestamps: true
});

// Pre-save middleware to generate secure one-time token
paymentReceiptSchema.pre('save', function(next) {
  if (this.isNew && !this.uploadToken) {
    // Generate cryptographically secure one-time token
    this.uploadToken = crypto.randomBytes(32).toString('hex');
    // Token expires in 7 days for payment upload
    this.tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Index for efficient lookups
paymentReceiptSchema.index({ uploadToken: 1 });
paymentReceiptSchema.index({ inspectionRequest_ID: 1 });
paymentReceiptSchema.index({ client_ID: 1, createdAt: -1 });

export default mongoose.model('PaymentReceipt', paymentReceiptSchema);