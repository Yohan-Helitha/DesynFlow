import express from "express";
import {
  getAllNotifications,
  getUnreadCount,
  getNotificationById,
  addNotification,
  updateNotification,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controller/notificationController.js";

import { validateInsertNotificationMW } from "../middleware/notificationMiddleware.js";

const router = express.Router();

// Alternative routes for more specific operations
router.get("/", getAllNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/mark-all-read", markAllAsRead);
router.put("/:id/read", markNotificationAsRead);
router.get("/:id", getNotificationById);
router.post("/", validateInsertNotificationMW, addNotification);
router.put("/:id", updateNotification);
router.delete("/:id", deleteNotification);

export default router;
