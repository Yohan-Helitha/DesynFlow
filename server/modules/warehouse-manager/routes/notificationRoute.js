import express from "express";
import {
  getAllNotifications,
  getNotificationById,
  addNotification,
  updateNotification,
  deleteNotification,
} from "../controller/notificationController.js";

import { validateInsertNotificationMW } from "../middleware/notificationMiddleware.js";

const router = express.Router();

// Alternative routes for more specific operations
router.get("/", getAllNotifications);
router.get("/:id", getNotificationById);
router.post("/", validateInsertNotificationMW, addNotification);
router.put("/:id", updateNotification);
router.delete("/:id", deleteNotification);

export default router;
