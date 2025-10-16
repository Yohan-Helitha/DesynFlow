import NotificationService from '../service/notificationService.js';

class NotificationController {
  
  // Get notifications for current user
  async getNotifications(req, res) {
    try {
      const userId = req.query.userId || req.user?.id;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'User ID is required' 
        });
      }

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        type: req.query.type,
        isRead: req.query.isRead !== undefined ? req.query.isRead === 'true' : null,
        priority: req.query.priority,
        search: req.query.search
      };

      const result = await NotificationService.getUserNotifications(userId, options);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in getNotifications:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  // Get unread count for current user
  async getUnreadCount(req, res) {
    try {
      const userId = req.query.userId || req.user?.id;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'User ID is required' 
        });
      }

      const count = await NotificationService.getUnreadCount(userId);
      
      res.status(200).json({
        success: true,
        data: { unreadCount: count }
      });
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  // Mark notifications as read
  async markAsRead(req, res) {
    try {
      const userId = req.body.userId || req.user?.id;
      const { notificationIds } = req.body;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'User ID is required' 
        });
      }

      if (!notificationIds || !Array.isArray(notificationIds)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Notification IDs array is required' 
        });
      }

      const result = await NotificationService.markAsRead(userId, notificationIds);
      
      res.status(200).json({
        success: true,
        message: 'Notifications marked as read',
        data: result
      });
    } catch (error) {
      console.error('Error in markAsRead:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const userId = req.body.userId || req.user?.id;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'User ID is required' 
        });
      }

      const result = await NotificationService.markAllAsRead(userId);
      
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        data: result
      });
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  // Delete a notification
  async deleteNotification(req, res) {
    try {
      const userId = req.query.userId || req.user?.id;
      const { notificationId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'User ID is required' 
        });
      }

      if (!notificationId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Notification ID is required' 
        });
      }

      const result = await NotificationService.deleteNotification(userId, notificationId);
      
      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  // Create a new notification (for testing or admin use)
  async createNotification(req, res) {
    try {
      const notificationData = req.body;
      
      if (!notificationData.userId || !notificationData.title || !notificationData.message || !notificationData.type) {
        return res.status(400).json({ 
          success: false, 
          message: 'userId, title, message, and type are required' 
        });
      }

      const notification = await NotificationService.createNotification(notificationData);
      
      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: notification
      });
    } catch (error) {
      console.error('Error in createNotification:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  // Create task assignment notification
  async createTaskAssignmentNotification(req, res) {
    try {
      const { taskId, assignedUserId, assignedByUserId } = req.body;
      
      if (!taskId || !assignedUserId || !assignedByUserId) {
        return res.status(400).json({ 
          success: false, 
          message: 'taskId, assignedUserId, and assignedByUserId are required' 
        });
      }

      const notification = await NotificationService.createTaskAssignmentNotification(
        taskId, 
        assignedUserId, 
        assignedByUserId
      );
      
      res.status(201).json({
        success: true,
        message: 'Task assignment notification created',
        data: notification
      });
    } catch (error) {
      console.error('Error in createTaskAssignmentNotification:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  // Create team message notification
  async createTeamMessageNotification(req, res) {
    try {
      const { userIds, title, message, senderId } = req.body;
      
      if (!userIds || !Array.isArray(userIds) || !title || !message || !senderId) {
        return res.status(400).json({ 
          success: false, 
          message: 'userIds (array), title, message, and senderId are required' 
        });
      }

      const notifications = await NotificationService.createTeamMessageNotification(
        userIds, 
        title, 
        message, 
        senderId
      );
      
      res.status(201).json({
        success: true,
        message: 'Team message notifications created',
        data: notifications
      });
    } catch (error) {
      console.error('Error in createTeamMessageNotification:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  // Create system alert notification
  async createSystemAlertNotification(req, res) {
    try {
      const { userIds, title, message, priority = 'medium' } = req.body;
      
      if (!userIds || !Array.isArray(userIds) || !title || !message) {
        return res.status(400).json({ 
          success: false, 
          message: 'userIds (array), title, and message are required' 
        });
      }

      const notifications = await NotificationService.createSystemAlertNotification(
        userIds, 
        title, 
        message, 
        priority
      );
      
      res.status(201).json({
        success: true,
        message: 'System alert notifications created',
        data: notifications
      });
    } catch (error) {
      console.error('Error in createSystemAlertNotification:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }
}

export default new NotificationController();