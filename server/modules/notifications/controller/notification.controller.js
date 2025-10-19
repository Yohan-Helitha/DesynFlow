import notificationService from '../service/notification.service.js';

class NotificationController {
  // Get user notifications with filtering and pagination
  async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const {
        page,
        limit,
        type,
        isRead,
        priority,
        search
      } = req.query;

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        type,
        isRead: isRead !== undefined ? isRead === 'true' : null,
        priority,
        search
      };

      const result = await notificationService.getUserNotifications(userId, options);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get grouped notifications
  async getGroupedNotifications(req, res) {
    try {
      const userId = req.user.id;
      const grouped = await notificationService.getGroupedNotifications(userId);
      
      res.status(200).json({
        success: true,
        data: grouped
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get unread count
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await notificationService.getUnreadCount(userId);
      
      res.status(200).json({
        success: true,
        data: { count }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      const notification = await notificationService.markAsRead(notificationId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      const result = await notificationService.markAllAsRead(userId);
      
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        data: { modifiedCount: result.modifiedCount }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Archive notification
  async archiveNotification(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      const notification = await notificationService.archiveNotification(notificationId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Notification archived',
        data: notification
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get notification by ID
  async getNotificationById(req, res) {
    try {
      const { notificationId } = req.params;
      const notification = await notificationService.getNotificationById(notificationId);
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      // Check if user has access to this notification
      if (notification.recipientId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new NotificationController();