import {
  getAllNotificationsService,
  getNotificationByIdService,
  addNotificationService,
  updateNotificationService,
  deleteNotificationService,
} from "../service/notificationService.js";

// Get all warehouse notifications
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await getAllNotificationsService();

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({ message: "No warehouse notifications found" });
    }

    return res.status(200).json({ notifications: notifications || [] });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get single notification by ID
export const getNotificationById = async (req, res) => {
  try {
    const notification = await getNotificationByIdService(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json(notification);
  } catch (err) {
    console.error("Error fetching notification:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add new notification
export const addNotification = async (req, res) => {
  try {
    const notification = await addNotificationService(req.body, req.userId);

    return res.status(201).json({ message: "Notification added", notification });
  } catch (err) {
    console.error("Error adding notification:", err);

    if (err.status === 400 && err.errors) {
      return res.status(400).json({ errors: err.errors });
    }

    return res.status(500).json({ message: "Unable to add notification" });
  }
};

// Update notification (e.g., mark as read)
export const updateNotification = async (req, res) => {
  try {
    const notification = await updateNotificationService(
      req.params.id,
      req.body,
      req.userId
    );

    if (!notification) {
      return res.status(404).json({ message: "Unable to update notification" });
    }

    return res.status(200).json({ notification });
  } catch (err) {
    console.error("Error updating notification:", err);

    if (err.status === 400 && err.errors) {
      return res.status(400).json({ errors: err.errors });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await deleteNotificationService(req.params.id, req.userId);

    if (!notification) {
      return res.status(404).json({ message: "Unable to delete notification" });
    }

    return res.status(200).json({ notification });
  } catch (err) {
    console.error("Error deleting notification:", err);
    return res.status(500).json({ message: "Server error" });
  }
};