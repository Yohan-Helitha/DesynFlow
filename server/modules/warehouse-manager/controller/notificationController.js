import {
  getAllNotificationsService,
  getNotificationByIdService,
  addNotificationService,
  updateNotificationService,
  deleteNotificationService,
  getUnreadCountService,
  markAllAsReadService
} from "../service/notificationService.js";

// Get all warehouse notifications
export const getAllNotifications = async (req, res) => {
  try {
    const { recipient = 'warehouse', limit = 200 } = req.query;
    let notifications = await getAllNotificationsService();
    
    // Filter by recipient if specified
    if (recipient) {
      notifications = notifications.filter(n => n.recipient === recipient);
    }
    
    // Limit results
    if (limit) {
      notifications = notifications.slice(0, parseInt(limit));
    }

    if (!notifications || notifications.length === 0) {
      return res.status(200).json({ data: [] });
    }

    return res.status(200).json({ data: notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get unread count for warehouse notifications
export const getUnreadCount = async (req, res) => {
  try {
    const { recipient = 'warehouse' } = req.query;
    const count = await getUnreadCountService(recipient);
    
    return res.status(200).json({ data: count });
  } catch (err) {
    console.error("Error fetching unread count:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const { recipient = 'warehouse' } = req.query;
    const result = await markAllAsReadService(recipient);
    
    return res.status(200).json({ 
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount 
    });
  } catch (err) {
    console.error("Error marking all as read:", err);
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