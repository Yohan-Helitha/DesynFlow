import React, { useState, useEffect } from 'react';

const NotificationToast = ({ notification, onClose, onAction }) => {
  useEffect(() => {
    // Auto-close notification after 30 seconds for assignment notifications (to allow time for action)
    // Auto-close after 8 seconds for other notifications
    const timeout = notification.type === 'new_assignment' ? 30000 : 8000;
    const timer = setTimeout(() => {
      onClose();
    }, timeout);

    return () => clearTimeout(timer);
  }, [onClose, notification.type]);

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'new_assignment':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          icon: '📋',
          title: 'New Assignment!'
        };
      case 'assignment_accepted':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-green-600',
          icon: '✅',
          title: 'Assignment Accepted'
        };
      case 'assignment_declined':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-red-600',
          icon: '❌',
          title: 'Assignment Declined'
        };
      case 'assignment_completed':
        return {
          bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
          icon: '🏁',
          title: 'Assignment Completed'
        };
      case 'assignment_updated':
        return {
          bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
          icon: '📝',
          title: 'Assignment Updated'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          icon: '🔔',
          title: 'Notification'
        };
    }
  };

  const style = getNotificationStyle(notification.type);

  return (
    <div className={`fixed top-4 right-4 z-50 ${style.bg} text-white rounded-lg shadow-2xl p-4 min-w-80 max-w-96 animate-slide-in`}>
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white hover:text-gray-300 transition-colors"
      >
        ✕
      </button>

      {/* Notification content */}
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{style.icon}</div>
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-1">{style.title}</h4>
          <p className="text-sm opacity-90 mb-2">{notification.message}</p>
          
          {/* Assignment details */}
          {notification.assignment && (
            <div className="bg-white bg-opacity-20 rounded p-2 text-xs">
              <div className="flex justify-between mb-1">
                <span className="font-medium">Client:</span>
                <span>{notification.assignment.clientName || 'N/A'}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Property:</span>
                <span className="text-right">{notification.assignment.propertyAddress || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className="capitalize">{notification.assignment.status || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons for assignment notifications */}
      {notification.type === 'new_assignment' && notification.actionData && onAction && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onAction('accept', notification)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors duration-200"
          >
            ✅ Accept
          </button>
          <button
            onClick={() => onAction('decline', notification)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors duration-200"
          >
            ❌ Decline
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-3 w-full bg-white bg-opacity-30 rounded-full h-1">
        <div 
          className="bg-white h-1 rounded-full animate-progress" 
          style={{ animationDuration: notification.type === 'new_assignment' ? '30s' : '8s' }}
        ></div>
      </div>
    </div>
  );
};

const NotificationSystem = ({ notifications, onRemove, onAction }) => {
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="pointer-events-auto space-y-2">
        {notifications.map((notification, index) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => onRemove(notification.id)}
            onAction={onAction}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationSystem;