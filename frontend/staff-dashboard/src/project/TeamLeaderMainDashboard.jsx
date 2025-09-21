import React, { useState } from "react";
import Layout from "../components/Layout";
import LeaderDashboard from "./leaderDashboard";
import TeamAttendance from "../components/TeamAttendance";
import ResourceRequests from "../components/ResourceRequests";
import ProgressReports from "../components/ProgressReports";

export default function TeamLeaderMainDashboard() {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderContent = () => {
    switch (activeIndex) {
      case 0:
        return <LeaderDashboard />;
      case 1:
        return <TeamAttendance />;
      case 2:
        return <ResourceRequests />;
      case 3:
        return <ProgressReports />;
      case 4:
        return <div className="text-brown-primary">Team Settings - Coming Soon</div>;
      default:
        return <LeaderDashboard />;
    }
  };

  return (
    <Layout 
      activeIndex={activeIndex} 
      setActiveIndex={setActiveIndex}
      userRole="team-leader"
    >
      {renderContent()}
    </Layout>
  );
}