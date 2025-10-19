import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData?.role === "team member") {
      setUser(userData);
      fetchUnreadCount(userData._id || userData.id);
    }
  }, []);

  const fetchUnreadCount = async (userId) => {
    try {
      const response = await fetch(`/api/notifications/unread-count?userId=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setUnreadCount(result.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const updateUnreadCount = (newCount) => {
    setUnreadCount(newCount);
  };

  const decrementUnreadCount = (amount = 1) => {
    setUnreadCount(prev => Math.max(0, prev - amount));
  };

  const showToastNotification = (notification) => {
    const toastData = {
      title: notification.title,
      description: notification.message,
      duration: notification.priority === 'high' ? 6000 : 4000
    };

    switch (notification.priority) {
      case 'high':
        toast.error(notification.title, {
          description: notification.message,
          duration: 6000,
          action: notification.actionType !== 'none' ? {
            label: 'View',
            onClick: () => handleNotificationAction(notification)
          } : undefined
        });
        break;
      case 'medium':
        toast.warning(notification.title, {
          description: notification.message,
          duration: 4000,
          action: notification.actionType !== 'none' ? {
            label: 'View',
            onClick: () => handleNotificationAction(notification)
          } : undefined
        });
        break;
      case 'low':
        toast.info(notification.title, {
          description: notification.message,
          duration: 3000,
          action: notification.actionType !== 'none' ? {
            label: 'View',
            onClick: () => handleNotificationAction(notification)
          } : undefined
        });
        break;
      default:
        toast(notification.title, {
          description: notification.message,
          duration: 4000
        });
    }

    // Increment unread count
    setUnreadCount(prev => prev + 1);
  };

  const handleNotificationAction = (notification) => {
    // Handle notification actions
    switch (notification.actionType) {
      case 'view_task':
        // This would need to be connected to your routing system
        console.log('Navigate to task:', notification.actionData?.taskId);
        break;
      case 'view_project':
        console.log('Navigate to project:', notification.actionData?.projectId);
        break;
      case 'download_file':
        console.log('Download file:', notification.actionData?.fileId);
        break;
      case 'join_meeting':
        if (notification.actionData?.url) {
          window.open(notification.actionData.url, '_blank');
        }
        break;
      default:
        console.log('No specific action for this notification');
    }
  };

  const contextValue = {
    unreadCount,
    updateUnreadCount,
    decrementUnreadCount,
    showToastNotification,
    fetchUnreadCount: () => user && fetchUnreadCount(user._id || user.id)
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
