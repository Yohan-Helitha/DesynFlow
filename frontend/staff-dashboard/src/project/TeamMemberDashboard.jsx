import React, { useState } from "react";
import { NotificationProvider } from "./contexts/NotificationContext";
import TeamMemberLayout from "./components/TeamMemberLayout";
import TeamDashboardOverview from "./components/TeamDashboardOverview";
import MyTasksTab from "./components/MyTasksTab";
import CalendarViewTab from "./components/CalendarViewTab";
import PersonalFilesTab from "./components/PersonalFilesTab";
import NotificationsTab from "./components/NotificationsTab";

// Placeholder components for Phase 2
// Removed NotificationsTab placeholder as we now have the full implementation

export default function TeamMemberDashboard() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Check if user is logged in and has team member role
  const getLoggedInUser = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === "team member") {
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  };

  const user = getLoggedInUser();

  // Access control
  if (!user) {
    return (
      <div className="min-h-screen bg-cream-light flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            This dashboard is only accessible to users with "team member" role. 
            Please log in with appropriate credentials.
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-brown-primary text-white px-4 py-2 rounded-lg hover:bg-brown-secondary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeIndex) {
      case 0:
        return <TeamDashboardOverview />;
      case 1:
        return <MyTasksTab />;
      case 2:
        return <CalendarViewTab />;
      case 3:
        return <PersonalFilesTab />;
      case 4:
        return <NotificationsTab />;
      default:
        return <TeamDashboardOverview />;
    }
  };

  return (
    <NotificationProvider>
      <TeamMemberLayout activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
        {renderContent()}
      </TeamMemberLayout>
    </NotificationProvider>
  );
}
