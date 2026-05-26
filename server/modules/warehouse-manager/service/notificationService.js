import WarehouseNotification from "../model/notificationModel.js";
import AuditLog from "../model/auditLogModel.js";


const normalizeRecipient = (recipient) => {
  if (!recipient) return undefined;
  const trimmed = String(recipient).trim();
  if (!trimmed) return undefined;

  // Backwards-compat aliases used across frontend/backends
  const lowered = trimmed.toLowerCase();
  if (lowered === "warehouse_manager" || lowered === "warehouse manager") return "warehouse";
  return trimmed;
};


export const getAllNotificationsService = async ({ recipient, limit, unreadOnly } = {}) => {
  const query = {};
  const normalizedRecipient = normalizeRecipient(recipient);
  if (normalizedRecipient) query.recipient = normalizedRecipient;
  if (String(unreadOnly).toLowerCase() === "true") query.isRead = false;

  const q = WarehouseNotification.find(query).sort({ createdAt: -1 });
  const parsedLimit = Number(limit);
  if (Number.isFinite(parsedLimit) && parsedLimit > 0) q.limit(parsedLimit);
  return await q;
};

export const getUnreadCountService = async ({ recipient } = {}) => {
  const query = { isRead: false };
  const normalizedRecipient = normalizeRecipient(recipient);
  if (normalizedRecipient) query.recipient = normalizedRecipient;
  return await WarehouseNotification.countDocuments(query);
};


export const getNotificationByIdService = async (id) => {
  return await WarehouseNotification.findById(id);
};

export const markNotificationAsReadService = async (id, userId) => {
  const notification = await WarehouseNotification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  );

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
    action: "update",
    keyInfo: JSON.stringify(keyInfo),
    createdBy: userId || "System",
  });

  return notification;
};

export const markAllAsReadService = async ({ recipient, userId } = {}) => {
  const query = { isRead: false };
  const normalizedRecipient = normalizeRecipient(recipient);
  if (normalizedRecipient) query.recipient = normalizedRecipient;

  const res = await WarehouseNotification.updateMany(query, { $set: { isRead: true } });
  await AuditLog.create({
    entity: "Warehouse Notification",
    action: "update",
    keyInfo: JSON.stringify({ Action: "mark-all-read", Recipient: normalizedRecipient || "*" }),
    createdBy: userId || "System",
  });

  return { updated: res.modifiedCount ?? res.nModified ?? 0 };
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

// Function to notify about sReorder status changes
export const notifySReorderStatusChange = async (data) => {
  try {
    const { stockReorderRequestId, materialId, materialName, status, inventoryId, inventoryName } = data;
    
    const notification = {
      type: 'stock_reorder_status',
      title: `Stock Reorder Request ${status}`,
      message: `Stock reorder request for ${materialName} (ID: ${materialId}) has been ${status.toLowerCase()} in inventory ${inventoryName}`,
      relatedId: stockReorderRequestId,
      recipient: 'warehouse_manager',
      isRead: false
    };
    
    return await addNotificationService(notification, 'System');
  } catch (error) {
    console.error('Error creating sReorder status notification:', error);
    throw error;
  }
};
