import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controller/pmNotificationController.js';

const router = express.Router();

// Get all notifications for logged-in project manager
router.get(
  '/my',
  authMiddleware,
  roleMiddleware(['project manager']),
  getMyNotifications
);

// Get unread notification count
router.get(
  '/unread-count',
  authMiddleware,
  roleMiddleware(['project manager']),
  getUnreadCount
);

// Mark specific notification as read
router.patch(
  '/:notificationId/read',
  authMiddleware,
  roleMiddleware(['project manager']),
  markAsRead
);

// Mark all notifications as read
router.patch(
  '/mark-all-read',
  authMiddleware,
  roleMiddleware(['project manager']),
  markAllAsRead
);

// Delete notification
router.delete(
  '/:notificationId',
  authMiddleware,
  roleMiddleware(['project manager']),
  deleteNotification
);

export default router;