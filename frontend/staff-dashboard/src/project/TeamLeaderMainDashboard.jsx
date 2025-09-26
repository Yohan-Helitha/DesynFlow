import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import LeaderDashboard from "./leaderDashboard";
import TaskBoard from "../components/task";
import TeamAttendance from "../components/TeamAttendance";
import ResourceRequests from "../components/ResourceRequests";
import ProgressReports from "../components/ProgressReports";

export default function TeamLeaderMainDashboard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [project, setProject] = useState(null);
  const leaderId = "68d638d66e8afdd7536b87f8";

  useEffect(() => {
    // Fetch the first project for the resource requests
    const fetchProject = async () => {
      try {
        // Get team data first
        const teamRes = await fetch(`http://localhost:4000/api/teams`);
        const teamData = await teamRes.json();
        const teamObj = Array.isArray(teamData)
          ? teamData.find(t => t.leaderId === leaderId || t.leaderId._id === leaderId)
          : null;

        if (teamObj) {
          // Get projects for this team
          const projRes = await fetch(`http://localhost:4000/api/projects`);
          const projData = await projRes.json();
          const teamProjects = projData.filter(
            p => p.assignedTeamId._id === teamObj._id
          );
          
          if (teamProjects.length > 0) {
            setProject(teamProjects[0]); // Use first project
          }
        }
      } catch (error) {
        console.error('Error fetching project for resource requests:', error);
      }
    };

    fetchProject();
  }, []);

  const renderContent = () => {
    switch (activeIndex) {
      case 0:
        return <LeaderDashboard />;
      case 1:
        return <TaskBoard />;
      case 2:
        return <TeamAttendance />;
      case 3:
        return <ResourceRequests project={project} leaderId={leaderId} />;
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