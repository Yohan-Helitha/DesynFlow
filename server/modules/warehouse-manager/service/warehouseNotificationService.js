import WarehouseNotification from "../model/warehouseNotificationModel.js";

export const createWarehouseNotification = async ({ type, title, message, relatedId, data, recipient = "warehouse", createdBy }) => {
  const n = new WarehouseNotification({ type, title, message, relatedId, data, recipient, createdBy });
  await n.save();
  return n;
};

export const getNotificationsForRecipient = async (recipient = "warehouse", { limit = 50, skip = 0 } = {}) => {
  const query = { recipient };
  const notifications = await WarehouseNotification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
  return notifications;
};

export const getUnreadCountForRecipient = async (recipient = "warehouse") => {
  return await WarehouseNotification.countDocuments({ recipient, isRead: false });
};

export const markNotificationRead = async (id) => {
  return await WarehouseNotification.findByIdAndUpdate(id, { isRead: true }, { new: true });
};

export const markAllReadForRecipient = async (recipient = "warehouse") => {
  return await WarehouseNotification.updateMany({ recipient, isRead: false }, { isRead: true });
};

export const deleteNotification = async (id) => {
  return await WarehouseNotification.findByIdAndDelete(id);
};
