import React, { useState } from "react";
import Layout from "../components/Layout";
import DashboardOverview from "../components/DashboardOverview";
import AssignTeams from "../components/AssignTeams";
import LeaderDashboard from "./leaderDashboard";

export default function ProjectManagerDashboard() {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderContent = () => {
    switch (activeIndex) {
      case 0:
        return <DashboardOverview />;
      case 1:
        return <AssignTeams />;
      case 2:
        return <LeaderDashboard />;
      case 3:
        return <div className="text-brown-primary">Manage Resources - Coming Soon</div>;
      case 4:
        return <div className="text-brown-primary">Track Progress - Coming Soon</div>;
      case 5:
        return <div className="text-brown-primary">Reports & Analytics - Coming Soon</div>;
      case 6:
        return <div className="text-brown-primary">Settings - Coming Soon</div>;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <Layout activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
      {renderContent()}
    </Layout>
  );
}
