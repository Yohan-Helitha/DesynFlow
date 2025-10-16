import express from 'express';
import NotificationController from '../controller/notificationController.js';

const router = express.Router();

// Get notifications for current user
router.get('/', NotificationController.getNotifications);

// Get unread count for current user
router.get('/unread-count', NotificationController.getUnreadCount);

// Mark notifications as read
router.patch('/mark-read', NotificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', NotificationController.markAllAsRead);

// Delete a notification
router.delete('/:notificationId', NotificationController.deleteNotification);

// Create a new notification (for testing or admin use)
router.post('/', NotificationController.createNotification);

// Create specific notification types
router.post('/task-assignment', NotificationController.createTaskAssignmentNotification);
router.post('/team-message', NotificationController.createTeamMessageNotification);
router.post('/system-alert', NotificationController.createSystemAlertNotification);

export default router;