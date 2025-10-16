import ProjectNotification from '../model/notification.model.js';
import User from '../../auth/model/user.model.js';
import mongoose from 'mongoose';

class NotificationService {
  
  // Get notifications for a user with pagination
  async getUserNotifications(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        type = null,
        isRead = null,
        priority = null,
        search = null
      } = options;

      const query = { userId: new mongoose.Types.ObjectId(userId) };
      
      // Add filters
      if (type) query.type = type;
      if (isRead !== null) query.isRead = isRead;
      if (priority) query.priority = priority;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;
      
      const notifications = await ProjectNotification.find(query)
        .populate('senderId', 'name email role')
        .populate('actionData.taskId', 'name status priority')
        .populate('actionData.projectId', 'projectName status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await ProjectNotification.countDocuments(query);
      const unreadCount = await ProjectNotification.getUnreadCount(userId);

      return {
        notifications: notifications.map(notification => ({
          ...notification,
          timeAgo: this.getTimeAgo(ProjectNotification.createdAt)
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCount: total,
          hasMore: skip + notifications.length < total
        },
        unreadCount
      };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  // Create a new notification
  async createNotification(data) {
    try {
      const notification = await ProjectNotification.createNotification(data);
      
      // Populate sender info for real-time updates
      await ProjectNotification.populate('senderId', 'name email role');
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Mark notifications as read
  async markAsRead(userId, notificationIds) {
    try {
      const result = await ProjectNotification.markAsRead(userId, notificationIds);
      return result;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      const result = await ProjectNotification.updateMany(
        { userId: new mongoose.Types.ObjectId(userId), isRead: false },
        { isRead: true }
      );
      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(userId, notificationId) {
    try {
      const result = await ProjectNotification.deleteOne({
        _id: new mongoose.Types.ObjectId(notificationId),
        userId: new mongoose.Types.ObjectId(userId)
      });
      return result;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount(userId) {
    try {
      return await ProjectNotification.getUnreadCount(userId);
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Helper methods for creating specific notification types
  async createTaskAssignmentNotification(taskId, assignedUserId, assignedByUserId) {
    try {
      const data = {
        userId: assignedUserId,
        title: 'New Task Assigned',
        message: 'You have been assigned a new task',
        type: 'task_assignment',
        priority: 'high',
        actionType: 'view_task',
        actionData: { taskId },
        senderId: assignedByUserId
      };
      
      return await this.createNotification(data);
    } catch (error) {
      console.error('Error creating task assignment notification:', error);
      throw error;
    }
  }

  async createTaskUpdateNotification(taskId, userId, updateType, oldValue, newValue, updatedByUserId) {
    try {
      const data = {
        userId,
        title: 'Task Updated',
        message: `Task ${updateType} has been changed`,
        type: 'task_update',
        priority: 'medium',
        actionType: 'view_task',
        actionData: { taskId },
        senderId: updatedByUserId,
        metadata: {
          fieldName: updateType,
          oldValue,
          newValue
        }
      };
      
      return await this.createNotification(data);
    } catch (error) {
      console.error('Error creating task update notification:', error);
      throw error;
    }
  }

  async createProjectUpdateNotification(projectId, userIds, updateType, message, updatedByUserId) {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        title: 'Project Update',
        message,
        type: 'project_update',
        priority: 'medium',
        actionType: 'view_project',
        actionData: { projectId },
        senderId: updatedByUserId,
        metadata: {
          fieldName: updateType
        }
      }));

      return await Promise.all(
        notifications.map(data => this.createNotification(data))
      );
    } catch (error) {
      console.error('Error creating project update notifications:', error);
      throw error;
    }
  }

  async createTeamMessageNotification(userIds, title, message, senderId) {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        title,
        message,
        type: 'team_message',
        priority: 'medium',
        actionType: 'reply',
        senderId
      }));

      return await Promise.all(
        notifications.map(data => this.createNotification(data))
      );
    } catch (error) {
      console.error('Error creating team message notifications:', error);
      throw error;
    }
  }

  async createFileShareNotification(fileId, userId, fileName, sharedByUserId) {
    try {
      const data = {
        userId,
        title: 'File Shared',
        message: `${fileName} has been shared with you`,
        type: 'file_sharing',
        priority: 'medium',
        actionType: 'download_file',
        actionData: { fileId },
        senderId: sharedByUserId
      };
      
      return await this.createNotification(data);
    } catch (error) {
      console.error('Error creating file share notification:', error);
      throw error;
    }
  }

  async createMeetingReminderNotification(userId, meetingTitle, meetingTime, meetingUrl) {
    try {
      const data = {
        userId,
        title: 'Meeting Reminder',
        message: `${meetingTitle} is starting soon`,
        type: 'meeting_reminder',
        priority: 'high',
        actionType: 'join_meeting',
        actionData: { url: meetingUrl },
        metadata: {
          additionalInfo: meetingTime
        }
      };
      
      return await this.createNotification(data);
    } catch (error) {
      console.error('Error creating meeting reminder notification:', error);
      throw error;
    }
  }

  async createSystemAlertNotification(userIds, title, message, priority = 'medium') {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        title,
        message,
        type: 'system_alert',
        priority,
        actionType: 'none'
      }));

      return await Promise.all(
        notifications.map(data => this.createNotification(data))
      );
    } catch (error) {
      console.error('Error creating system alert notifications:', error);
      throw error;
    }
  }

  // Utility method for time ago calculation
  getTimeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  }

  // Cleanup old notifications (older than 30 days)
  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const result = await ProjectNotification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        isRead: true
      });
      
      console.log(`Cleaned up ${result.deletedCount} old notifications`);
      return result;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }
}

export default new NotificationService();
