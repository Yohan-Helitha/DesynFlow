import React, { useState } from "react";
import TeamMemberLayout from "./components/TeamMemberLayout";
import TeamDashboardOverview from "./components/TeamDashboardOverview";
import MyTasksTab from "./components/MyTasksTab";

// Placeholder components for Phase 2
function NotificationsTab() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-brown-primary mb-4">Notifications</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Notifications center coming in Phase 3...</p>
        <div className="mt-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
        </div>
      </div>
    </div>
  );
}

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
        return <NotificationsTab />;
      default:
        return <TeamDashboardOverview />;
    }
  };

  return (
    <TeamMemberLayout activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
      {renderContent()}
    </TeamMemberLayout>
  );
}