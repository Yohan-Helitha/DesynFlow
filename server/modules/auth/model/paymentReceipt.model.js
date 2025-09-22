
import mongoose from 'mongoose';
import crypto from 'crypto';

const paymentReceiptSchema = new mongoose.Schema({
  inspectionRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InspectionRequest',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiptFilePath: {
    type: String,
    default: ''  // Not required initially, set when file is uploaded
  },
  status: {
    type: String,
    enum: ['awaiting_upload', 'uploaded', 'verified', 'rejected', 'expired'],
    default: 'awaiting_upload'
  },
  
  // One-time use link system
  uploadToken: {
    type: String,
    required: true,
    unique: true
  },
  tokenExpires: {
    type: Date,
    required: true
  },
  isTokenUsed: {
    type: Boolean,
    default: false
  },
  tokenUsedAt: {
    type: Date,
    default: null
  },
  uploadAttempts: {
    type: Number,
    default: 0,
    max: 3  // Maximum 3 attempts allowed
  },
  
  // Payment details from finance calculation
  calculatedAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentDueDate: {
    type: Date,
    required: true
  },
  
  // Verification details
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  financeRemarks: {
    type: String,
    default: ''
  },
  
  // Email tracking
  emailSentAt: {
    type: Date,
    default: null
  },
  emailSentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Security tracking
  uploadIP: {
    type: String,
    default: ''
  },
  uploadUserAgent: {
    type: String,
    default: ''
  },
  
  // File details
  originalFileName: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  },
  fileType: {
    type: String,
    default: ''
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if token is valid
paymentReceiptSchema.virtual('isTokenValid').get(function() {
  return !this.isTokenUsed && 
         this.tokenExpires > new Date() && 
         this.uploadAttempts < 3 &&
         this.status === 'awaiting_upload';
});

// Virtual for upload URL
paymentReceiptSchema.virtual('uploadUrl').get(function() {
  if (this.isTokenValid) {
    return `/api/payment-receipt/upload/${this.uploadToken}`;
  }
  return null;
});

// Pre-save middleware to generate secure token
paymentReceiptSchema.pre('save', function(next) {
  if (this.isNew && !this.uploadToken) {
    // Generate cryptographically secure token
    this.uploadToken = crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Index for token lookup
paymentReceiptSchema.index({ uploadToken: 1 });
paymentReceiptSchema.index({ client: 1, createdAt: -1 });
paymentReceiptSchema.index({ status: 1, tokenExpires: 1 });

export default mongoose.model('PaymentReceipt', paymentReceiptSchema);