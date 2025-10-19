import express from 'express';
import * as notificationController from '../controller/financeNotificationController.js';
import { authMiddleware } from '../../auth/middleware/authMiddleware.js';

const router = express.Router();

// Get all notifications for current user
router.get('/', authMiddleware, notificationController.getNotifications);

// Get unread count
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);

// Mark notification as read
router.patch('/:notificationId/read', authMiddleware, notificationController.markAsRead);

// Mark all as read
router.patch('/mark-all-read', authMiddleware, notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', authMiddleware, notificationController.deleteNotification);

// Delete all read notifications
router.delete('/read/all', authMiddleware, notificationController.deleteReadNotifications);

// Create a risk alert notification for finance (and optionally project) stakeholders
router.post('/risk-alert', authMiddleware, notificationController.sendRiskAlert);

export default router;
