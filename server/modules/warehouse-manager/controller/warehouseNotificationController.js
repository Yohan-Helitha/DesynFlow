import {
  createWarehouseNotification,
  getNotificationsForRecipient,
  getUnreadCountForRecipient,
  markNotificationRead,
  markAllReadForRecipient,
  deleteNotification
} from "../service/warehouseNotificationService.js";

// GET /warehouse/notifications
export const getWarehouseNotifications = async (req, res) => {
  try {
    const recipient = req.query.recipient || "warehouse";
    const limit = Number(req.query.limit || 50);
    const skip = Number(req.query.skip || 0);
    const notifications = await getNotificationsForRecipient(recipient, { limit, skip });
    return res.status(200).json({ notifications });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /warehouse/notifications/unread-count
export const getWarehouseUnreadCount = async (req, res) => {
  try {
    const recipient = req.query.recipient || "warehouse";
    const count = await getUnreadCountForRecipient(recipient);
    return res.status(200).json({ count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /warehouse/notifications (optional create endpoint)
export const createWarehouseNotificationCtrl = async (req, res) => {
  try {
    const payload = req.body;
    const created = await createWarehouseNotification({ ...payload, createdBy: req.user?.id || "system" });
    return res.status(201).json({ notification: created });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to create notification" });
  }
};

// PUT /warehouse/notifications/:id/read
export const markWarehouseNotificationRead = async (req, res) => {
  try {
    const updated = await markNotificationRead(req.params.id);
    if (!updated) return res.status(404).json({ message: "Notification not found" });
    return res.status(200).json({ notification: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /warehouse/notifications/mark-all-read
export const markAllWarehouseRead = async (req, res) => {
  try {
    const recipient = req.query.recipient || "warehouse";
    await markAllReadForRecipient(recipient);
    return res.status(200).json({ message: "Marked all read" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /warehouse/notifications/:id
export const deleteWarehouseNotification = async (req, res) => {
  try {
    const deleted = await deleteNotification(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Notification not found" });
    return res.status(200).json({ notification: deleted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
