import Notification from '../model/notification.model.js';
import User from '../../auth/model/user.model.js';

class NotificationService {
  // Create a new notification
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      return await this.getNotificationById(notification._id);
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

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

      const query = { recipientId: userId, isArchived: false };

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

      const notifications = await Notification.find(query)
        .populate('senderId', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments(query);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching notifications: ${error.message}`);
    }
  }

  // Get notification by ID
  async getNotificationById(notificationId) {
    try {
      return await Notification.findById(notificationId)
        .populate('senderId', 'firstName lastName email role')
        .populate('recipientId', 'firstName lastName email role');
    } catch (error) {
      throw new Error(`Error fetching notification: ${error.message}`);
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipientId: userId },
        { isRead: true },
        { new: true }
      );
      
      if (!notification) {
        throw new Error('Notification not found or access denied');
      }
      
      return notification;
    } catch (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { recipientId: userId, isRead: false },
        { isRead: true }
      );
      return result;
    } catch (error) {
      throw new Error(`Error marking all notifications as read: ${error.message}`);
    }
  }

  // Archive notification
  async archiveNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipientId: userId },
        { isArchived: true },
        { new: true }
      );
      
      if (!notification) {
        throw new Error('Notification not found or access denied');
      }
      
      return notification;
    } catch (error) {
      throw new Error(`Error archiving notification: ${error.message}`);
    }
  }

  // Get unread count for a user
  async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({
        recipientId: userId,
        isRead: false,
        isArchived: false
      });
    } catch (error) {
      throw new Error(`Error getting unread count: ${error.message}`);
    }
  }

  // Create task assignment notification
  async createTaskAssignmentNotification(taskData, assigneeId, assignerId) {
    const notificationData = {
      recipientId: assigneeId,
      senderId: assignerId,
      type: 'task_assignment',
      title: 'New Task Assigned',
      message: `You have been assigned a new task: "${taskData.name}"`,
      priority: taskData.priority === 'high' ? 'high' : 'medium',
      relatedEntity: {
        entityType: 'task',
        entityId: taskData._id
      },
      actionData: {
        taskId: taskData._id,
        projectId: taskData.projectId
      }
    };

    return await this.createNotification(notificationData);
  }

  // Create task update notification
  async createTaskUpdateNotification(taskData, recipientIds, senderId, updateType, updateDetails) {
    const notifications = [];

    for (const recipientId of recipientIds) {
      const notificationData = {
        recipientId,
        senderId,
        type: 'task_update',
        title: `Task Updated: ${taskData.name}`,
        message: updateDetails.message,
        priority: updateDetails.priority || 'medium',
        relatedEntity: {
          entityType: 'task',
          entityId: taskData._id
        },
        actionData: {
          taskId: taskData._id,
          updateType,
          ...updateDetails
        }
      };

      const notification = await this.createNotification(notificationData);
      notifications.push(notification);
    }

    return notifications;
  }

  // Create file sharing notification
  async createFileSharedNotification(fileData, recipientIds, senderId) {
    const notifications = [];

    for (const recipientId of recipientIds) {
      const notificationData = {
        recipientId,
        senderId,
        type: 'file_shared',
        title: 'File Shared With You',
        message: `A file "${fileData.fileName}" has been shared with you`,
        priority: 'medium',
        relatedEntity: {
          entityType: 'file',
          entityId: fileData._id
        },
        actionData: {
          fileId: fileData._id,
          fileName: fileData.fileName,
          fileType: fileData.fileType
        }
      };

      const notification = await this.createNotification(notificationData);
      notifications.push(notification);
    }

    return notifications;
  }

  // Create meeting reminder notification
  async createMeetingReminderNotification(meetingData, recipientIds) {
    const notifications = [];

    for (const recipientId of recipientIds) {
      const notificationData = {
        recipientId,
        type: 'meeting_reminder',
        title: 'Meeting Reminder',
        message: `Reminder: "${meetingData.title}" is scheduled for ${new Date(meetingData.scheduledTime).toLocaleString()}`,
        priority: 'high',
        relatedEntity: {
          entityType: 'meeting',
          entityId: meetingData._id
        },
        actionData: {
          meetingId: meetingData._id,
          meetingLink: meetingData.link,
          scheduledTime: meetingData.scheduledTime
        },
        expiresAt: new Date(meetingData.scheduledTime)
      };

      const notification = await this.createNotification(notificationData);
      notifications.push(notification);
    }

    return notifications;
  }

  // Create system alert notification
  async createSystemAlert(title, message, recipientIds, priority = 'medium') {
    const notifications = [];

    for (const recipientId of recipientIds) {
      const notificationData = {
        recipientId,
        type: 'system_alert',
        title,
        message,
        priority,
        relatedEntity: {
          entityType: 'system'
        }
      };

      const notification = await this.createNotification(notificationData);
      notifications.push(notification);
    }

    return notifications;
  }

  // Get grouped notifications
  async getGroupedNotifications(userId) {
    try {
      const notifications = await Notification.find({
        recipientId: userId,
        isArchived: false
      })
      .populate('senderId', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(100);

      // Group by type and date
      const grouped = {
        today: [],
        yesterday: [],
        thisWeek: [],
        older: []
      };

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const thisWeek = new Date(today);
      thisWeek.setDate(thisWeek.getDate() - 7);

      notifications.forEach(notification => {
        const notificationDate = new Date(notification.createdAt);
        const notificationDay = new Date(notificationDate.getFullYear(), notificationDate.getMonth(), notificationDate.getDate());

        if (notificationDay.getTime() === today.getTime()) {
          grouped.today.push(notification);
        } else if (notificationDay.getTime() === yesterday.getTime()) {
          grouped.yesterday.push(notification);
        } else if (notificationDate >= thisWeek) {
          grouped.thisWeek.push(notification);
        } else {
          grouped.older.push(notification);
        }
      });

      return grouped;
    } catch (error) {
      throw new Error(`Error getting grouped notifications: ${error.message}`);
    }
  }
}

export default new NotificationService();