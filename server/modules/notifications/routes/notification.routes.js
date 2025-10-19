import express from 'express';
import notificationController from '../controller/notification.controller.js';
import { authenticateToken } from '../../auth/middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get user notifications with filters and pagination
router.get('/', notificationController.getUserNotifications);

// Get grouped notifications
router.get('/grouped', notificationController.getGroupedNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark all notifications as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// Get specific notification
router.get('/:notificationId', notificationController.getNotificationById);

// Mark specific notification as read
router.put('/:notificationId/read', notificationController.markAsRead);

// Archive specific notification
router.put('/:notificationId/archive', notificationController.archiveNotification);

export default router;