import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';

export const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Sidebar */}
      <div className={`${isCollapsed ? 'w-20' : 'w-60'} transition-all`}>
        <Sidebar isCollapsed={isCollapsed} />
      </div>
      {/* Main */}
      <main className="flex-1 overflow-auto p-6 bg-gray-100">
        {/* Toggle Button */}
        <button
          className="mb-4 flex items-center px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu size={18} className="mr-2" />
          {isCollapsed ? 'Expand' : 'Collapse'}
        </button>
        <Outlet />
      </main>
    </div>
  );
};
