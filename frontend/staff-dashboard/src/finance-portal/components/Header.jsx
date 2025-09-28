import React, { useState } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
// import { NotificationsPanel } from './NotificationsPanel';

export const Header = ({ title }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="flex justify-between items-center py-6">
      <h1 className="text-2xl font-semibold">{title}</h1>

      <div className="flex items-center space-x-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search for anything..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-md w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative p-2 rounded-full hover:bg-gray-100"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
              5
            </span>
          </button>
          {/* {showNotifications && (
            <NotificationsPanel onClose={() => setShowNotifications(false)} />
          )} */}
        </div>

        {/* User */}
        <div className="flex items-center ml-4">
          <div className="w-10 h-10 rounded-full bg-indigo-400 flex items-center justify-center text-indigo-800 font-bold mr-3">
            AR
          </div>
          <div className="mr-2">
            <div className="font-medium text-sm">Ali Raza</div>
            <div className="text-xs text-gray-500">Finance Manager</div>
          </div>
          <ChevronDown size={16} className="text-gray-500" />
        </div>
      </div>
    </div>
  );
};
