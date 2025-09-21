import React from 'react';

const teamLeaderNavItems = [
  { label: "Team Overview", icon: "🏠", id: "overview" },
  { label: "Attendance Management", icon: "📅", id: "attendance" },
  { label: "Resource Requests", icon: "📦", id: "resources" },
  { label: "Progress Reports", icon: "📊", id: "reports" },
  { label: "Team Settings", icon: "⚙️", id: "settings" },
];

const projectManagerNavItems = [
  { label: "Dashboard Overview", icon: "📊", id: "overview" },
  { label: "Assign Teams", icon: "👥", id: "assign-teams" },
  { label: "Manage Resources", icon: "📦", id: "manage-resources" },
  { label: "Track Progress", icon: "📈", id: "track-progress" },
  { label: "Reports & Analytics", icon: "📋", id: "reports" },
  { label: "Settings", icon: "⚙️", id: "settings" },
];

export default function Sidebar({ activeIndex, setActiveIndex, userRole = "project-manager" }) {
  const navItems = userRole === "team-leader" ? teamLeaderNavItems : projectManagerNavItems;
  const dashboardTitle = userRole === "team-leader" ? "Team Leader" : "Interior PM";
  
  return (
    <aside className="w-64 bg-brown-primary text-white flex flex-col shadow-lg">
      <div className="flex-1 p-4">
        <div className="text-center mb-8 text-xl font-bold text-cream-primary">
          {dashboardTitle}
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setActiveIndex(index)}
              className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                activeIndex === index 
                  ? 'bg-green-primary bg-opacity-30 border-l-4 border-cream-primary' 
                  : 'hover:bg-green-primary hover:bg-opacity-20'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span className="font-medium text-sm text-cream-primary">{item.label}</span>
            </div>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t border-green-primary border-opacity-30 text-center text-xs text-green-primary">
        {userRole === "team-leader" ? "Team Leader Dashboard v1.0" : "Interior Design PM v1.0"}
      </div>
    </aside>
  );
}