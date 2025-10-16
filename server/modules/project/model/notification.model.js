import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Recipient information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Notification content
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // Notification type
  type: {
    type: String,
    enum: [
      'task_assignment',
      'task_update', 
      'project_update',
      'team_message',
      'file_sharing',
      'meeting_reminder',
      'system_alert'
    ],
    required: true
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false
  },
  
  // Action data
  actionType: {
    type: String,
    enum: ['view_task', 'view_project', 'reply', 'download_file', 'join_meeting', 'none'],
    default: 'none'
  },
  
  actionData: {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PersonalFile'
    },
    meetingId: {
      type: mongoose.Schema.Types.ObjectId
    },
    url: String
  },
  
  // Sender information (optional)
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Metadata
  metadata: {
    oldValue: String,
    newValue: String,
    fieldName: String,
    additionalInfo: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ createdAt: 1 }); // For cleanup of old notifications

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return this.createdAt.toLocaleDateString();
});

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = new this(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Static method to mark as read
notificationSchema.statics.markAsRead = async function(userId, notificationIds) {
  try {
    return await this.updateMany(
      { 
        userId: userId,
        _id: { $in: notificationIds }
      },
      { isRead: true }
    );
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  try {
    return await this.countDocuments({ 
      userId: userId, 
      isRead: false 
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

export default mongoose.model('ProjectNotification', notificationSchema);