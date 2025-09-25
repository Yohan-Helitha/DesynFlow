import React, { useState } from "react";
import Layout from "../components/Layout";
import DashboardOverview from "../components/DashboardOverview";
import AssignTeams from "../components/AssignTeams";
import TeamManagement from "../components/TeamManagement";
import ReportsManagement from "../components/ProjectReport";

export default function ProjectManagerDashboard() {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderContent = () => {
    switch (activeIndex) {
      case 0:
        return <DashboardOverview />;
      case 1:
        return <AssignTeams />;
      case 2:
        return <TeamManagement />;
      case 3:
        return <ReportsManagement />;
      case 4:
        return <div className="text-brown-primary">Reports & Analytics - Coming Soon</div>;
      case 5:
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
