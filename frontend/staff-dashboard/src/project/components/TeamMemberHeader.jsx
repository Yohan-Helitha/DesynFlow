import React, { useState, useEffect } from 'react';
import { FaBell, FaSignOutAlt } from "react-icons/fa";

export default function TeamMemberHeader({ onLogout }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Get logged in user data
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData?.role === "team member") {
        setUser(userData);
        // Fetch notifications for this user
        fetchNotifications(userData._id || userData.id);
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
  }, []);

  const fetchNotifications = async (userId) => {
    try {
      // Mock notifications for now - will be replaced with real API call
      const mockNotifications = [
        {
          id: 1,
          type: "task_assigned",
          message: "New task assigned: Room Planning",
          time: "5 min ago",
          read: false
        },
        {
          id: 2,
          type: "due_date",
          message: "Task 'Space Design' is due tomorrow",
          time: "1 hour ago",
          read: false
        },
        {
          id: 3,
          type: "project_update",
          message: "Project status changed to In Progress",
          time: "2 hours ago",
          read: true
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.warn('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return "TM";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserDisplayName = () => {
    return user.username || user.email || "Team Member";
  };

  return (
    <header className="bg-white shadow-sm p-6 flex items-center justify-between">
      <div className="flex-1" />

      <div className="flex items-center gap-6 ml-6">
        <div className="relative group">
          <div className="cursor-pointer">
            <button className="p-2 rounded-full bg-brown-primary-300 hover:bg-brown-primary text-white">
              <FaBell size={20} />
            </button>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="absolute top-8 right-0 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10 hidden group-hover:block">
            <div className="p-4 border-b border-gray-200 font-semibold">Notifications</div>
            <ul className="max-h-64 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <li key={notif.id} className={`px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        notif.type === 'task_assigned' ? 'bg-blue-100 text-blue-600' :
                        notif.type === 'due_date' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {notif.type === 'task_assigned' ? '📋' :
                         notif.type === 'due_date' ? '⏰' : '📊'}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{notif.message}</div>
                        <div className="text-xs text-gray-500 mt-1">{notif.time}</div>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-gray-500 text-center">No notifications</li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brown-primary text-cream-primary rounded-full flex items-center justify-center font-semibold">
            {getInitials(getUserDisplayName())}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{getUserDisplayName()}</div>
            <div className="text-sm text-gray-500">Team Member</div>
          </div>
        </div>

        <button
          onClick={() => onLogout && onLogout()}
          className="flex items-center space-x-2 px-4 py-2 bg-brown-primary text-cream-primary hover:bg-brown-primary-dark rounded-lg transition-colors duration-200 ml-4"
          title="Logout"
        >
          <FaSignOutAlt />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
}
