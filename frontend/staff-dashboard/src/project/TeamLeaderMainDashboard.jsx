import React, { useState } from "react";
import Layout from "../components/Layout";
import LeaderDashboard from "./leaderDashboard";
import TaskBoard from "../components/task";
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
        return <TaskBoard />;
      case 2:
        return <TeamAttendance />;
      case 3:
        return <ResourceRequests />;
      case 4:
        return <ProgressReports />;
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