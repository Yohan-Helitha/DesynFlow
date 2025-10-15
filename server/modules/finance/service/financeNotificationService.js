import FinanceNotification from '../model/financeNotification.js';
import User from '../../auth/model/user.model.js';

// Create a new notification
export const createNotification = async ({ 
  userId, 
  eventType, 
  title, 
  message, 
  relatedEntity, 
  metadata, 
  priority = 'medium' 
}) => {
  try {
    const notification = await FinanceNotification.create({
      userId,
      eventType,
      title,
      message,
      relatedEntity,
      metadata,
      priority
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Create notifications for multiple users
export const createNotificationsForUsers = async ({ 
  userIds, 
  eventType, 
  title, 
  message, 
  relatedEntity, 
  metadata, 
  priority = 'medium' 
}) => {
  try {
    const notifications = await Promise.all(
      userIds.map(userId => 
        createNotification({ userId, eventType, title, message, relatedEntity, metadata, priority })
      )
    );
    return notifications;
  } catch (error) {
    console.error('Error creating notifications for users:', error);
    throw error;
  }
};

// Create notifications for users by role
export const createNotificationsForRole = async ({ 
  role, 
  eventType, 
  title, 
  message, 
  relatedEntity, 
  metadata, 
  priority = 'medium' 
}) => {
  try {
    const users = await User.find({ role, isActive: true });
    const userIds = users.map(user => user._id);
    return await createNotificationsForUsers({ 
      userIds, 
      eventType, 
      title, 
      message, 
      relatedEntity, 
      metadata, 
      priority 
    });
  } catch (error) {
    console.error('Error creating notifications for role:', error);
    throw error;
  }
};

// Get all notifications for a user
export const getUserNotifications = async (userId, { limit = 50, unreadOnly = false } = {}) => {
  try {
    const query = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }
    
    const notifications = await FinanceNotification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

// Get unread count for a user
export const getUnreadCount = async (userId) => {
  try {
    const count = await FinanceNotification.countDocuments({ userId, isRead: false });
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await FinanceNotification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
export const markAllAsRead = async (userId) => {
  try {
    const result = await FinanceNotification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId, userId) => {
  try {
    const notification = await FinanceNotification.findOneAndDelete({ 
      _id: notificationId, 
      userId 
    });
    return notification;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Delete all read notifications for a user
export const deleteReadNotifications = async (userId) => {
  try {
    const result = await FinanceNotification.deleteMany({ userId, isRead: true });
    return result;
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    throw error;
  }
};

// Helper: Notify finance managers about an event
export const notifyFinanceManagers = async ({ 
  eventType, 
  title, 
  message, 
  relatedEntity, 
  metadata, 
  priority = 'medium' 
}) => {
  return await createNotificationsForRole({
    role: 'finance manager',
    eventType,
    title,
    message,
    relatedEntity,
    metadata,
    priority
  });
};

// Helper: Notify project managers about an event
export const notifyProjectManagers = async ({ 
  eventType, 
  title, 
  message, 
  relatedEntity, 
  metadata, 
  priority = 'medium',
  projectManagerIds = null
}) => {
  if (projectManagerIds && projectManagerIds.length > 0) {
    return await createNotificationsForUsers({
      userIds: projectManagerIds,
      eventType,
      title,
      message,
      relatedEntity,
      metadata,
      priority
    });
  }
  
  return await createNotificationsForRole({
    role: 'project manager',
    eventType,
    title,
    message,
    relatedEntity,
    metadata,
    priority
  });
};
