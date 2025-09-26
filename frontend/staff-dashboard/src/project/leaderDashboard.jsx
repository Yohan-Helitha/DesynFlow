import React, { useState, useEffect } from 'react';
import TeamOverviewCard from "../components/TeamOverviewCard";
import ProjectOverviewCard from "../components/ProjectOverviewCard";
import MilestoneList from "../components/MilestoneList";
import ProgressBar from "../components/ProgressBar";
import DocumentList from "../components/DocumentList";

export default function LeaderDashboard() {
  const leaderId = "68d638d66e8afdd7536b87f8";
  const [team, setTeam] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [resources, setResources] = useState([]);
  const [reports, setReports] = useState([]);
  const [meetings, setMeetings] = useState([]); // 👈 new
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Get all teams
        const teamRes = await fetch(`http://localhost:4000/api/teams`);
        const teamData = await teamRes.json();
        const teamObj = Array.isArray(teamData)
          ? teamData.find(t => t.leaderId === leaderId || t.leaderId._id === leaderId)
          : null;
        setTeam(teamObj);
        if (!teamObj) throw new Error("No team found for this leader");

        // 2. Get all projects for this team
        const projRes = await fetch(`http://localhost:4000/api/projects`);
        const projData = await projRes.json();
        const teamProjects = projData.filter(
          p => p.assignedTeamId._id === teamObj._id
        );
        setProjects(teamProjects);

        // 3. Get reports and meetings for the first ongoing project (optional)
        const ongoing = teamProjects.find(p => !["Completed","Cancelled"].includes(p.status));
        if (ongoing) {
          const repRes = await fetch(`http://localhost:4000/api/reports/project/${ongoing._id}`);
          setReports(repRes.ok ? await repRes.json() : []);

          const meetRes = await fetch(`http://localhost:4000/api/meetings/project/${ongoing._id}`);
          setMeetings(meetRes.ok ? await meetRes.json() : []);
        } else {
          setReports([]);
          setMeetings([]);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load dashboard: " + err.message);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-brown-primary">Loading...</div>;
  if (error) return <div className="p-8 text-red-700">{error}</div>;
  if (!projects.length) return <div className="p-8 text-gray-500">No projects assigned to your team.</div>;

  return (
    <div className="p-8 space-y-10">
      {/* 🔹 Project Overview */}
      <div>
        <h2 className="text-2xl font-bold text-brown-primary mb-6">Project Assignment & Overview</h2>
        {projects.map(project => (
          <ProjectOverviewCard key={project._id} project={project} />
        ))}
        <TeamOverviewCard team={team} tasks={tasks} attendance={attendance} />
      </div>

      {/* 🔹 Timeline & Progress */}
      {projects.map(project => (
        <div key={project._id + '-timeline'} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-brown-primary mb-2">Timeline</h3>
            <MilestoneList milestones={project.timeline} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-brown-primary mb-2">Progress</h3>
            <ProgressBar progress={project.progress} />
          </div>
        </div>
      ))}

      {/* 🔹 Documents */}
      {projects.map(project => (
        <div key={project._id + '-docs'}>
          <h3 className="text-lg font-semibold text-brown-primary mb-2">Documents</h3>
          <DocumentList documents={project.attachments} />
        </div>
      ))}

      {/* 🔹 Reports */}
      <div>
        <h3 className="text-lg font-semibold text-brown-primary mb-2">Reports</h3>
        <ul className="space-y-2">
          {reports.map((rep, idx) => (
            <li key={rep._id || idx} className="bg-white rounded shadow px-4 py-2 flex items-center justify-between">
              <div>
                <p className="font-semibold text-brown-primary">{rep.title || `Report ${idx + 1}`}</p>
                <p className="text-xs text-gray-500">{new Date(rep.createdAt).toLocaleDateString()}</p>
              </div>
              <a href={rep.pdfUrl} download className="text-blue-600 hover:underline">Download</a>
            </li>
          ))}
          {reports.length === 0 && <li className="text-gray-500">No reports found.</li>}
        </ul>
      </div>

      {/* 🔹 Meetings Section */}
      <div>
        <h3 className="text-lg font-semibold text-brown-primary mb-2">Meetings</h3>
        <ul className="space-y-2 mb-4">
          {meetings.map((meet, idx) => (
            <li key={meet._id || idx} className="bg-white rounded shadow px-4 py-2 flex items-center justify-between">
              <div>
                <p className="font-semibold text-brown-primary">{meet.title || `Meeting ${idx + 1}`}</p>
                <p className="text-xs text-gray-500">{new Date(meet.date).toLocaleString()}</p>
              </div>
              <a href={meet.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Join</a>
            </li>
          ))}
          {meetings.length === 0 && <li className="text-gray-500">No meetings scheduled.</li>}
        </ul>

        {/* Create New Meeting */}
        <button className="bg-brown-primary text-white px-4 py-2 rounded-lg hover:bg-brown-dark">
          + Create Meeting
        </button>
      </div>
    </div>
  );
}
