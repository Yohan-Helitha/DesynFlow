
import React, { useState, useEffect } from 'react';
import TeamOverviewCard from "../components/TeamOverviewCard";
import ProjectOverviewCard from "../components/ProjectOverviewCard";
import MilestoneList from "../components/MilestoneList";
import ProgressBar from "../components/ProgressBar";
import DocumentList from "../components/DocumentList";

export default function LeaderDashboard() {
  // Use real leaderId from database (Interior Design Team)
  const leaderId = "68d638d66e8afdd7536b87f8";
  const [team, setTeam] = useState(null);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [resources, setResources] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Starting to fetch data...');
        
        // Get all teams and find one where the leader matches
        console.log('Fetching teams...');
        const teamRes = await fetch(`http://localhost:4000/api/teams`);
        console.log('Team response status:', teamRes.status);
        
        if (!teamRes.ok) {
          const errorText = await teamRes.text();
          console.error('Team API error:', errorText);
          throw new Error(`Failed to fetch teams: ${teamRes.status}`);
        }
        
        const teamData = await teamRes.json();
        console.log('Team data received:', teamData);
        
        // Find team where the leader matches
        const teamObj = Array.isArray(teamData) 
          ? teamData.find(t => t.leaderId === leaderId || t.leaderId._id === leaderId)
          : (teamData.leaderId === leaderId || teamData.leaderId._id === leaderId) ? teamData : null;
        setTeam(teamObj);
        if (!teamObj || !teamObj._id) throw new Error("Team not found for leader");

        // Get ongoing project for this team
        console.log('Fetching projects...');
        const projRes = await fetch(`http://localhost:4000/api/projects`);
        console.log('Project response status:', projRes.status);
        
        if (!projRes.ok) {
          const errorText = await projRes.text();
          console.error('Project API error:', errorText);
          throw new Error(`Failed to fetch projects: ${projRes.status}`);
        }
        
        const projData = await projRes.json();
        console.log('Project data received:', projData);
        
        const ongoing = Array.isArray(projData)
          ? projData.find(p => p.assignedTeamId._id === teamObj._id && !["Completed","Cancelled"].includes(p.status))
          : null;
        setProject(ongoing);
        if (!ongoing) {
          console.warn('No ongoing project found for this team');
          setLoading(false);
          return;
        }

        // Get tasks for this team (using a generic tasks endpoint for now)
        console.log('Fetching tasks...');
        try {
          const tasksRes = await fetch(`http://localhost:4000/api/tasks`);
          if (tasksRes.ok) {
            const allTasks = await tasksRes.json();
            setTasks(Array.isArray(allTasks) ? allTasks.slice(0, 5) : []);
          } else {
            console.warn('Tasks API failed, continuing without tasks');
            setTasks([]);
          }
        } catch (taskError) {
          console.warn('Tasks API error:', taskError);
          setTasks([]);
        }

        // Get attendance for this team
        console.log('Fetching attendance...');
        try {
          const attRes = await fetch(`http://localhost:4000/api/team/${teamObj._id}`);
          if (attRes.ok) {
            const attData = await attRes.json();
            setAttendance(attData);
          } else {
            console.warn('Attendance API failed, continuing without attendance');
            setAttendance([]);
          }
        } catch (attError) {
          console.warn('Attendance API error:', attError);
          setAttendance([]);
        }

        // Get material requests for this project
        console.log('Fetching material requests...');
        try {
          const resReq = await fetch(`http://localhost:4000/api/project/${ongoing._id}`);
          if (resReq.ok) {
            const resData = await resReq.json();
            setResources(resData);
          } else {
            console.warn('Resource requests API failed, continuing without resources');
            setResources([]);
          }
        } catch (resError) {
          console.warn('Resource requests API error:', resError);
          setResources([]);
        }

        // Get reports for this project
        console.log('Fetching reports...');
        try {
          const repRes = await fetch(`http://localhost:4000/api/reports/project/${ongoing._id}`);
          if (repRes.ok) {
            const repData = await repRes.json();
            setReports(repData);
          } else {
            console.warn('Reports API failed, continuing without reports');
            setReports([]);
          }
        } catch (repError) {
          console.warn('Reports API error:', repError);
          setReports([]);
        }

        console.log('All data fetched successfully');
        setLoading(false);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError("Failed to load dashboard: " + err.message);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-brown-primary">Loading...</div>;
  if (error) return <div className="p-8 text-red-700">{error}</div>;
  if (!project) return <div className="p-8 text-gray-500">No ongoing project assigned.</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-brown-primary mb-6">Project Assignment & Overview</h2>
      <ProjectOverviewCard project={project} />
      <TeamOverviewCard team={team} tasks={tasks} attendance={attendance} />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-brown-primary mb-2">Timeline</h3>
          <MilestoneList milestones={project.timeline} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-brown-primary mb-2">Progress</h3>
          <ProgressBar progress={project.progress} />
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-brown-primary mb-2">Documents</h3>
        <DocumentList documents={project.attachments} />
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-brown-primary mb-2">Resource Requests</h3>
        <ul className="space-y-2">
          {resources.map((req, idx) => (
            <li key={req._id || idx} className="bg-white rounded shadow px-4 py-2 flex items-center justify-between">
              <span className="font-semibold text-brown-primary">Request {idx + 1}</span>
              <span className="text-xs text-gray-700">{req.status}</span>
            </li>
          ))}
          {resources.length === 0 && <li className="text-gray-500">No resource requests found.</li>}
        </ul>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-brown-primary mb-2">Reports</h3>
        <ul className="space-y-2">
          {reports.map((rep, idx) => (
            <li key={rep._id || idx} className="bg-white rounded shadow px-4 py-2 flex items-center justify-between">
              <span className="font-semibold text-brown-primary">{rep.reportType || `Report ${idx + 1}`}</span>
              <span className="text-xs text-gray-700">{rep.status}</span>
            </li>
          ))}
          {reports.length === 0 && <li className="text-gray-500">No reports found.</li>}
        </ul>
      </div>
    </div>
  );
}
