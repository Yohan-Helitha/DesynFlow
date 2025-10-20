import WarehouseNotification from "../model/notificationModel.js";
import AuditLog from "../model/auditLogModel.js";


export const getAllNotificationsService = async () => {
  return await WarehouseNotification.find().sort({ createdAt: -1 });
};


export const getNotificationByIdService = async (id) => {
  return await WarehouseNotification.findById(id);
};

export const addNotificationService = async (data, createdBy) => {
  const notification = new WarehouseNotification({
    ...data,
    createdBy: createdBy || "WM001",
  });

  await notification.save();

  // Convert Mongoose doc to plain object (for safety)
  const rawData = notification.toObject ? notification.toObject() : notification;

  // Create keyInfo for audit log
  const keyInfo = {
    Type: rawData.type,
    Title: rawData.title,
    Message: rawData.message,
    RelatedId: rawData.relatedId,
    Recipient: rawData.recipient,
    IsRead: rawData.isRead,
    CreatedBy: rawData.createdBy,
  };

  // Log the action
  await AuditLog.create({
    entity: "Warehouse Notification",
    action: "insert",
    keyInfo: JSON.stringify(keyInfo),
    createdBy: createdBy || "WM001",
  });

  return notification;
};

export const updateNotificationService = async (id, data, userId) => {
  const notification = await WarehouseNotification.findByIdAndUpdate(
    id,
    { ...data },
    { new: true }
  );

  if (!notification) return null;

  // Convert doc to plain object
  const rawData = notification.toObject ? notification.toObject() : notification;

  const keyInfo = {
    Type: rawData.type,
    Title: rawData.title,
    Message: rawData.message,
    RelatedId: rawData.relatedId,
    Recipient: rawData.recipient,
    IsRead: rawData.isRead,
    CreatedBy: rawData.createdBy,
  };

  await AuditLog.create({
    entity: "Warehouse Notification",
    action: "update",
    keyInfo: JSON.stringify(keyInfo),
    createdBy: userId || "WM001",
  });

  return notification;
};

export const deleteNotificationService = async (id, deletedBy) => {
  const notification = await WarehouseNotification.findByIdAndDelete(id);

  if (!notification) return null;

  const rawData = notification.toObject ? notification.toObject() : notification;

  const keyInfo = {
    Type: rawData.type,
    Title: rawData.title,
    Message: rawData.message,
    RelatedId: rawData.relatedId,
    Recipient: rawData.recipient,
    IsRead: rawData.isRead,
    CreatedBy: rawData.createdBy,
  };

  await AuditLog.create({
    entity: "Warehouse Notification",
    action: "delete",
    keyInfo: JSON.stringify(keyInfo),
    createdBy: deletedBy || "WM001",
  });

  return notification;
};
