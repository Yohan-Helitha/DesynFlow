import express from "express";
import {
  getAllNotifications,
  getNotificationById,
  addNotification,
  updateNotification,
  deleteNotification,
  getUnreadCount,
  markAllAsRead
} from "../controller/notificationController.js";

import { validateInsertNotificationMW } from "../middleware/notificationMiddleware.js";

const router = express.Router();

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark all as read
router.put("/mark-all-read", markAllAsRead);

// Mark single notification as read
router.put("/:id/read", updateNotification);

// Alternative routes for more specific operations
router.get("/", getAllNotifications);
router.get("/:id", getNotificationById);
router.post("/", validateInsertNotificationMW, addNotification);
router.put("/:id", updateNotification);
router.delete("/:id", deleteNotification);

export default router;
