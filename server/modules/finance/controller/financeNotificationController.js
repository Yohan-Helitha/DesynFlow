import * as notificationService from '../service/financeNotificationService.js';

// Get notifications for current user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id; // Assumes auth middleware adds user to req
    const { limit, unreadOnly } = req.query;
    
    const notifications = await notificationService.getUserNotifications(
      userId, 
      { 
        limit: limit ? parseInt(limit) : 50, 
        unreadOnly: unreadOnly === 'true' 
      }
    );
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get unread count for current user
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await notificationService.getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;
    
    const notification = await notificationService.markAsRead(notificationId, userId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await notificationService.markAllAsRead(userId);
    res.json({ message: 'All notifications marked as read', count: result.modifiedCount });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;
    
    const notification = await notificationService.deleteNotification(notificationId, userId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete all read notifications
export const deleteReadNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await notificationService.deleteReadNotifications(userId);
    res.json({ message: 'Read notifications deleted', count: result.deletedCount });
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    res.status(500).json({ error: error.message });
  }
};
