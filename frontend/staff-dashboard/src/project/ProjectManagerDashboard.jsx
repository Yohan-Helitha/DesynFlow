import React, { useState } from "react";
import Layout from "./components/Layout";
import DashboardOverview from "./components/DashboardOverview";
import AssignTeams from "./components/AssignTeams";
import TeamManagement from "./components/TeamManagement";
import ReportsManagement from "./components/ProjectReport";
import ProjectFinance from "./components/ProjectFinance";

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
        return <ProjectFinance />;
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
