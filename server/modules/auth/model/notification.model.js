import mongoose from 'mongoose';

// Simple notification model for project manager notifications
const notificationSchema = new mongoose.Schema({
  recipient_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  report_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuthInspectionReport'
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ recipient_ID: 1, status: 1, createdAt: -1 });

export default mongoose.model('PMNotification', notificationSchema);