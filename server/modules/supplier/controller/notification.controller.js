import SupplierRequestNotification from '../model/supplierRequestNotification.model.js';

// Get all notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await SupplierRequestNotification.find()
      .populate('supplierId', 'companyName name')
      .populate('materialId', 'materialName name')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

// Send a notification (create new notification)
export const sendNotification = async (req, res) => {
  try {
    const notification = await SupplierRequestNotification.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Failed to send notification', error: error.message });
  }
};
