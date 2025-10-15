import express from 'express';
import * as notificationController from '../controller/financeNotificationController.js';

const router = express.Router();

// Get all notifications for current user
router.get('/', notificationController.getNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

// Mark all as read
router.patch('/mark-all-read', notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

// Delete all read notifications
router.delete('/read/all', notificationController.deleteReadNotifications);

export default router;
