import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import LeaderDashboard from "./leaderDashboard";
import TaskBoard from "./components/task";
import TeamAttendance from "./components/TeamAttendance";
import PersonalFilesTab from './components/PersonalFilesTab';
import ResourceRequests from "./components/ResourceRequests";
import FlaggedIssuesPanel from "./components/FlaggedIssuesPanel";
import ProgressReports from "./components/ProgressReports";

export default function TeamLeaderMainDashboard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [project, setProject] = useState(null);
  const [teamData, setTeamData] = useState(null);
  
  // Get leader ID from logged-in user
  const getLeaderId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || user._id;
  };
  
  const leaderId = getLeaderId();

  useEffect(() => {
    // Fetch the first project for the resource requests
    const fetchProject = async () => {
      console.log('fetchProject called, leaderId:', leaderId);
      
      try {
        // Get team data first
        const teamRes = await fetch(`/api/teams`);
        const teamData = await teamRes.json();
        console.log('All teams:', teamData);
        
        const teamObj = Array.isArray(teamData)
          ? teamData.find(t => {
              const teamLeaderId = t.leaderId?._id || t.leaderId;
              console.log('Checking team:', t.teamName, 'leaderId:', teamLeaderId, 'matches:', teamLeaderId === leaderId);
              return teamLeaderId === leaderId;
            })
          : null;
        
        console.log('Found team for leader:', teamObj);
        setTeamData(teamObj); // Store team data for flagged issues

        if (teamObj) {
          // Get projects for this team
          const projRes = await fetch(`/api/projects`);
          const projData = await projRes.json();
          console.log('All projects:', projData);
          
          const teamProjects = projData.filter(
            p => p.assignedTeamId._id === teamObj._id
          );
          
          console.log('Filtered projects for team:', teamProjects);
          
          if (teamProjects.length > 0) {
            setProject(teamProjects[0]); // Use first project
          } else {
            console.log('No projects found for team');
          }
        } else {
          console.log('No team found for leader ID:', leaderId);
        }
      } catch (error) {
        console.error('Error fetching project for resource requests:', error);
      }
    };

    if (leaderId) {
      fetchProject();
    }
  }, [leaderId]);

  const renderContent = () => {
    switch (activeIndex) {
      case 0:
        return <LeaderDashboard />;
      case 1:
        return <TaskBoard />;
      case 2:
        // Replace attendance management with Personal Files view for team leader
        return <PersonalFilesTab />;
      case 3:
        return <ResourceRequests project={project} leaderId={leaderId} />;
      case 4:
        return <FlaggedIssuesPanel teamId={teamData?._id} projectId={project?._id} />;
      case 5:
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
