import PMNotification from '../model/notification.model.js';

// Get all notifications for logged-in project manager
export const getMyNotifications = async (req, res) => {
  try {
    const projectManager_ID = req.user._id;
    
    const notifications = await PMNotification.find({ recipient_ID: projectManager_ID })
      .populate('sender_ID', 'username email')
      .populate('report_ID', 'inspection_Date propertyLocation')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      message: 'Notifications retrieved successfully', 
      notifications 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve notifications', error: error.message });
  }
};

// Get unread notification count for badge
export const getUnreadCount = async (req, res) => {
  try {
    const projectManager_ID = req.user._id;
    
    const unreadCount = await PMNotification.countDocuments({ 
      recipient_ID: projectManager_ID, 
      status: 'unread' 
    });
    
    res.status(200).json({ 
      message: 'Unread count retrieved successfully', 
      count: unreadCount 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get unread count', error: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const projectManager_ID = req.user._id;
    
    const notification = await PMNotification.findOneAndUpdate(
      { _id: notificationId, recipient_ID: projectManager_ID },
      { status: 'read' },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.status(200).json({ 
      message: 'Notification marked as read', 
      notification 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const projectManager_ID = req.user._id;
    
    const result = await PMNotification.updateMany(
      { recipient_ID: projectManager_ID, status: 'unread' },
      { status: 'read' }
    );
    
    res.status(200).json({ 
      message: 'All notifications marked as read', 
      updatedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark all notifications as read', error: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const projectManager_ID = req.user._id;
    
    const notification = await PMNotification.findOneAndDelete({
      _id: notificationId,
      recipient_ID: projectManager_ID
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
};