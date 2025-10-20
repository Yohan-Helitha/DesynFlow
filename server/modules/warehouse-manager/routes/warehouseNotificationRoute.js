import express from "express";
import {
  getWarehouseNotifications,
  getWarehouseUnreadCount,
  createWarehouseNotificationCtrl,
  markWarehouseNotificationRead,
  markAllWarehouseRead,
  deleteWarehouseNotification
} from "../controller/warehouseNotificationController.js";

const router = express.Router();

router.get("/", getWarehouseNotifications);
router.get("/unread-count", getWarehouseUnreadCount);
router.post("/", createWarehouseNotificationCtrl);
router.put("/:id/read", markWarehouseNotificationRead);
router.put("/mark-all-read", markAllWarehouseRead);
router.delete("/:id", deleteWarehouseNotification);

export default router;
