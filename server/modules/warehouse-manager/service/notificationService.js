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

// Function to notify about sReorder status changes
export const notifySReorderStatusChange = async (data) => {
  try {
    const { 
      stockReorderRequestId, 
      materialId, 
      materialName, 
      status, 
      inventoryId, 
      inventoryName,
      quantity,
      expectedDate,
      updatedBy = 'Procurement Officer'
    } = data;
    
    // Create status-specific messages
    const statusMessages = {
      'Pending': 'is pending approval',
      'Approved': 'has been approved',
      'Rejected': 'has been rejected',
      'In Progress': 'is currently in progress',
      'Checked': 'has been checked and verified',
      'Restocked': 'has been successfully restocked',
      'Cancelled': 'has been cancelled'
    };
    
    const statusMessage = statusMessages[status] || `status has been updated to ${status}`;
    
    const notification = {
      type: 'stock_reorder_status',
      title: `Stock Reorder Request ${status}`,
      message: `Stock reorder request for ${materialName} (ID: ${materialId}) ${statusMessage} by ${updatedBy}. Quantity: ${quantity || 'N/A'}${expectedDate ? `, Expected: ${new Date(expectedDate).toLocaleDateString()}` : ''}`,
      relatedId: stockReorderRequestId,
      recipient: 'warehouse',
      isRead: false,
      data: {
        stockReorderRequestId,
        materialId,
        materialName,
        status,
        inventoryId,
        inventoryName,
        quantity,
        expectedDate,
        updatedBy,
        materialType: 'stock_reorder'
      }
    };
    
    return await addNotificationService(notification, 'System');
  } catch (error) {
    console.error('Error creating sReorder status notification:', error);
    throw error;
  }
};

// Function to create reorder level notifications for manufactured products
export const createReorderLevelNotification = async (product) => {
  try {
    const notification = {
      type: 'reorder_level_alert',
      title: 'Reorder Level Alert',
      message: `Manufactured product "${product.materialName}" (ID: ${product.materialId}) has reached reorder level. Current level: ${product.currentLevel}, Reorder level: ${product.reorderLevel}`,
      relatedId: product.materialId,
      recipient: 'warehouse',
      isRead: false,
      data: {
        materialId: product.materialId,
        materialName: product.materialName,
        currentLevel: product.currentLevel,
        reorderLevel: product.reorderLevel,
        inventoryName: product.inventoryName,
        category: product.category,
        type: product.type
      }
    };
    
    return await addNotificationService(notification, 'System');
  } catch (error) {
    console.error('Error creating reorder level notification:', error);
    throw error;
  }
};

// Function to create reorder level notifications for raw materials
export const createRawMaterialReorderLevelNotification = async (material) => {
  try {
    const notification = {
      type: 'reorder_level_alert',
      title: 'Raw Material Reorder Alert',
      message: `Raw material "${material.materialName}" (ID: ${material.materialId}) has reached reorder level. Current level: ${material.currentLevel}, Reorder level: ${material.reorderLevel}`,
      relatedId: material.materialId,
      recipient: 'warehouse',
      isRead: false,
      data: {
        materialId: material.materialId,
        materialName: material.materialName,
        currentLevel: material.currentLevel,
        reorderLevel: material.reorderLevel,
        inventoryName: material.inventoryName,
        category: material.category,
        type: material.type,
        materialType: 'raw_material' // Added to distinguish from manufactured products
      }
    };
    
    return await addNotificationService(notification, 'System');
  } catch (error) {
    console.error('Error creating raw material reorder level notification:', error);
    throw error;
  }
};

// Function to get unread count for warehouse notifications
export const getUnreadCountService = async (recipient = 'warehouse') => {
  try {
    return await WarehouseNotification.countDocuments({ 
      recipient, 
      isRead: false 
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

// Function to mark all notifications as read
export const markAllAsReadService = async (recipient = 'warehouse') => {
  try {
    const result = await WarehouseNotification.updateMany(
      { recipient, isRead: false },
      { isRead: true }
    );
    return result;
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};
