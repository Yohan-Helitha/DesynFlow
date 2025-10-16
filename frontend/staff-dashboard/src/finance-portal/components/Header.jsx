import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

export const Header = ({ title }) => {
  return (
    <div className="flex justify-between items-center py-6">
      <h1 className="text-2xl font-semibold">{title}</h1>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <NotificationDropdown />

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
