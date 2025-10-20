// src/services/FnotificationService.js

// Fetch all notifications
export const fetchNotifications = async () => {
  try {
    const res = await fetch("/api/warehouse/notifications");
    if (!res.ok) throw new Error("Failed to fetch notifications");

    const data = await res.json();
    console.log("Fetched notifications:", data); // Debug log
    return data.notifications; // Adjust key name if backend differs
  } catch (err) {
    console.error("Fetch notifications error:", err);
    return [];
  }
};

// Fetch notification by ID
export const fetchNotificationById = async (id) => {
  try {
    const res = await fetch(`/api/warehouse/notifications/${id}`);
    if (!res.ok) throw new Error("Failed to fetch notification");

    const data = await res.json();
    console.log("Fetched notification:", data); // Debug log
    return data;
  } catch (err) {
    console.error("Fetch notification by ID error:", err);
    return null;
  }
};

// Add new notification
export const addNotification = async (notificationData) => {
  try {
    const res = await fetch(`/api/warehouse/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notificationData),
    });

    const data = await res.json();
    console.log("Added notification:", data); // Debug log

    if (!res.ok) {
      throw data; // let React form handle backend errors
    }

    return data; // success
  } catch (err) {
    console.error("Add notification error:", err);
    throw err;
  }
};

// Update notification (e.g., mark as read)
export const updateNotification = async (id, updateData) => {
  try {
    const res = await fetch(`/api/warehouse/notifications/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    const result = await res.json();
    console.log("Updated notification:", result); // Debug log

    if (!res.ok) {
      throw result;
    }

    return result;
  } catch (err) {
    console.error("Update notification error:", err);
    throw err;
  }
};

// Delete notification
export const deleteNotification = async (id) => {
  try {
    const res = await fetch(`/api/warehouse/notifications/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to delete notification");
    }

    console.log("Deleted notification:", id);
    return { success: true };
  } catch (err) {
    console.error("Delete notification error:", err);
    throw err;
  }
};
