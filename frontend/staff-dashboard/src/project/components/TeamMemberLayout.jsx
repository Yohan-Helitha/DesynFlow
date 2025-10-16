import React from "react";
import { FaHome, FaTasks, FaBell, FaFolder, FaCalendarAlt } from "react-icons/fa";
import { useNotifications } from "../contexts/NotificationContext";
import { useNotifications } from "../contexts/NotificationContext";

export default function TeamMemberLayout({ activeIndex, setActiveIndex, children }) {
  const { unreadCount } = useNotifications();
  
  const menuItems = [
    { icon: FaHome, label: "Dashboard Overview", index: 0 },
    { icon: FaTasks, label: "My Tasks", index: 1 },
    { icon: FaCalendarAlt, label: "Calendar View", index: 2 },
    { icon: FaFolder, label: "Personal Files", index: 3 },
    { icon: FaBell, label: "Notifications", index: 4 }
  ];

  return (
    <div className="flex h-screen bg-cream-light">
      {/* Sidebar */}
      <div className="w-64 bg-brown-primary text-cream-primary flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-brown-secondary">
          <h1 className="text-xl font-bold">Team Member</h1>
          <p className="text-sm text-cream-secondary">DesynFlow Dashboard</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.index}>
                  <button
                    onClick={() => setActiveIndex(item.index)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeIndex === item.index
                        ? "bg-brown-secondary text-cream-primary font-semibold"
                        : "text-cream-secondary hover:bg-brown-secondary hover:text-cream-primary"
                    }`}
                  >
                    <div className="relative">
                      <Icon size={18} />
                      {item.label === "Notifications" && unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info at bottom */}
        <div className="p-4 border-t border-brown-secondary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brown-secondary text-cream-primary rounded-full flex items-center justify-center font-semibold">
              TM
            </div>
            <div>
              <div className="font-semibold text-sm">Team Member</div>
              <div className="text-xs text-cream-secondary">Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header will be rendered by individual components */}
        
        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}