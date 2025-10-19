import React, { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaSearch, 
  FaFilter, 
  FaTasks, 
  FaProjectDiagram, 
  FaUsers, 
  FaFile, 
  FaCalendarAlt, 
  FaExclamationTriangle,
  FaEye,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaFlag
} from 'react-icons/fa';
import { toast } from 'sonner';
import TeamMemberHeader from './TeamMemberHeader';
import { useNotifications } from '../contexts/NotificationContext';

export default function NotificationsTab() {
  const { updateUnreadCount } = useNotifications();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filters, setFilters] = useState({
    type: 'all',
    isRead: 'all',
    priority: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasMore: false
  });
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData?.role === "team member") {
      setUser(userData);
      fetchNotifications(userData._id || userData.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchNotifications = async (userId, page = 1) => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        userId,
        page: page.toString(),
        limit: '15',
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.isRead !== 'all' && { isRead: filters.isRead }),
        ...(filters.priority !== 'all' && { priority: filters.priority }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`/api/notifications?${queryParams}`);
      const result = await response.json();
      
      if (result.success) {
        setNotifications(result.data.notifications);
        setUnreadCount(result.data.unreadCount);
        updateUnreadCount(result.data.unreadCount);
        setPagination(result.data.pagination);
      } else {
        toast.error('Failed to load notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id || user.id,
          notificationIds
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setNotifications(prev => prev.map(notification => 
          notificationIds.includes(notification._id) 
            ? { ...notification, isRead: true }
            : notification
        ));
        
        // Update unread count
        const newUnreadCount = Math.max(0, unreadCount - notificationIds.length);
        setUnreadCount(newUnreadCount);
        updateUnreadCount(newUnreadCount);
        
        toast.success('Notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id || user.id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
        setUnreadCount(0);
        updateUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}?userId=${user._id || user.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    // Debounce search
    if (filterType === 'search') {
      clearTimeout(window.searchTimeout);
      window.searchTimeout = setTimeout(() => {
        fetchNotifications(user._id || user.id, 1);
      }, 500);
    } else {
      fetchNotifications(user._id || user.id, 1);
    }
  };

  const handleNotificationAction = async (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await markAsRead([notification._id]);
    }

    // Handle specific actions
    switch (notification.actionType) {
      case 'view_task':
        toast.info('This would open the task details');
        break;
      case 'view_project':
        toast.info('This would open the project details');
        break;
      case 'download_file':
        toast.info('This would download the file');
        break;
      case 'join_meeting':
        if (notification.actionData?.url) {
          window.open(notification.actionData.url, '_blank');
        }
        break;
      case 'reply':
        toast.info('This would open the reply interface');
        break;
      default:
        toast.info('Notification viewed');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assignment':
      case 'task_update':
        return <FaTasks className="text-blue-500" />;
      case 'project_update':
        return <FaProjectDiagram className="text-green-500" />;
      case 'team_message':
        return <FaUsers className="text-purple-500" />;
      case 'file_sharing':
        return <FaFile className="text-orange-500" />;
      case 'meeting_reminder':
        return <FaCalendarAlt className="text-red-500" />;
      case 'system_alert':
        return <FaExclamationTriangle className="text-yellow-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      'task_assignment': 'Task Assignment',
      'task_update': 'Task Update',
      'project_update': 'Project Update',
      'team_message': 'Team Message',
      'file_sharing': 'File Sharing',
      'meeting_reminder': 'Meeting Reminder',
      'system_alert': 'System Alert'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-primary">
        <TeamMemberHeader title="Notifications" onLogout={handleLogout} />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-primary">
      <TeamMemberHeader title="Notifications" onLogout={handleLogout} />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header with Statistics */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-brown-primary text-white p-3 rounded-lg">
                <FaBell size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-brown-primary">Notifications</h1>
                <p className="text-gray-600">Stay updated with your latest activities</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{unreadCount}</div>
                <div className="text-sm text-gray-600">Unread</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{pagination.totalCount}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="bg-brown-primary text-white px-4 py-2 rounded-lg hover:bg-brown-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaCheckCircle />
              Mark All Read
            </button>

            <div className="flex items-center gap-2">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary focus:border-transparent"
              />
            </div>

            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary"
            >
              <option value="all">All Types</option>
              <option value="task_assignment">Task Assignment</option>
              <option value="task_update">Task Update</option>
              <option value="project_update">Project Update</option>
              <option value="team_message">Team Message</option>
              <option value="file_sharing">File Sharing</option>
              <option value="meeting_reminder">Meeting Reminder</option>
              <option value="system_alert">System Alert</option>
            </select>

            <select
              value={filters.isRead}
              onChange={(e) => handleFilterChange('isRead', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary"
            >
              <option value="all">All Status</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <FaBell className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {filters.search || filters.type !== 'all' || filters.isRead !== 'all' || filters.priority !== 'all'
                  ? 'Try adjusting your filters to see more notifications.'
                  : 'You\'re all caught up! New notifications will appear here.'}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg shadow-md border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.isRead ? 'ring-2 ring-blue-200' : ''
                } hover:shadow-lg transition-shadow cursor-pointer`}
                onClick={() => handleNotificationAction(notification)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 text-xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                            notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            <FaFlag className="inline mr-1" size={8} />
                            {notification.priority}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            {getTypeLabel(notification.type)}
                          </span>
                        </div>
                        
                        <p className={`${!notification.isRead ? 'text-gray-800' : 'text-gray-600'} mb-2`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaClock />
                            {notification.timeAgo}
                          </span>
                          
                          {notification.senderId && (
                            <span className="flex items-center gap-1">
                              <FaUsers size={10} />
                              From: {notification.senderId.name}
                            </span>
                          )}
                          
                          {notification.metadata?.fieldName && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {notification.metadata.fieldName}: {notification.metadata.oldValue} → {notification.metadata.newValue}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead([notification._id]);
                          }}
                          className="text-blue-500 hover:text-blue-700 p-1 rounded"
                          title="Mark as read"
                        >
                          <FaEye />
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className="text-red-500 hover:text-red-700 p-1 rounded"
                        title="Delete notification"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => fetchNotifications(user._id || user.id, pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="px-4 py-2 bg-brown-primary text-white rounded-lg hover:bg-brown-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => fetchNotifications(user._id || user.id, pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="px-4 py-2 bg-brown-primary text-white rounded-lg hover:bg-brown-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
