import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // System notifications won't have a sender
  },
  type: {
    type: String,
    enum: [
      'task_assignment',
      'task_update',
      'task_comment',
      'task_status_change',
      'task_due_date_change',
      'project_update',
      'project_milestone',
      'project_status_change',
      'team_message',
      'file_shared',
      'meeting_reminder',
      'system_alert'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['task', 'project', 'team', 'file', 'meeting'],
      required: false
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    }
  },
  actionData: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  expiresAt: {
    type: Date,
    required: false // For time-sensitive notifications like meeting reminders
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientId: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for sender details
notificationSchema.virtual('sender', {
  ref: 'User',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true
});

// Virtual for recipient details
notificationSchema.virtual('recipient', {
  ref: 'User',
  localField: 'recipientId',
  foreignField: '_id',
  justOne: true
});

notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

export default mongoose.model('GeneralNotification', notificationSchema);