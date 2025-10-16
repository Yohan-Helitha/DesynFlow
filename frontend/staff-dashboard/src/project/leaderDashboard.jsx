import React, { useState, useEffect } from 'react';
import TeamOverviewCard from "./components/TeamOverviewCard";
import ProjectOverviewCard from "./components/ProjectOverviewCard";
import MilestoneList from "./components/MilestoneList";
import ProgressBar from "./components/ProgressBar";
import DocumentList from "./components/DocumentList";
import CreateMeetingForm from "./components/CreateMeetingForm";

export default function LeaderDashboard() {
  // Get the logged-in user's data and validate role
  const getLoggedInLeader = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === "team leader") {
        return {
          id: user._id || user.id,
          user: user
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  };
  
  const leaderData = getLoggedInLeader();
  const leaderId = leaderData?.id;
  const [team, setTeam] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [resources, setResources] = useState([]);
  const [reports, setReports] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [editMeeting, setEditMeeting] = useState(null);

  // Check if user is logged in and has team leader role
  if (!leaderData || !leaderId) {
    return (
      <div className="p-8 text-red-700">
        <h2 className="text-xl font-bold mb-4">Access Denied</h2>
        <p>This dashboard is only accessible to users with "team leader" role. Please log in with appropriate credentials.</p>
      </div>
    );
  }

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

        // 3. Get reports, meetings, and tasks for the first ongoing project (optional)
        const ongoing = teamProjects.find(p => !["Completed","Cancelled"].includes(p.status));
        if (ongoing) {
          const repRes = await fetch(`http://localhost:4000/api/reports/project/${ongoing._id}`);
          setReports(repRes.ok ? await repRes.json() : []);

          // Fetch tasks for the project
          const tasksRes = await fetch(`http://localhost:4000/api/tasks/project/${ongoing._id}`);
          if (tasksRes.ok) {
            const tasksData = await tasksRes.json();
            setTasks(tasksData);
          }

          await fetchMeetings(ongoing._id);
        } else {
          setReports([]);
          setMeetings([]);
          setTasks([]);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load dashboard: " + err.message);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Meeting handlers
  const handleCreateMeeting = () => {
    setEditMeeting(null);
    setShowMeetingForm(true);
  };

  const handleEditMeeting = (meeting) => {
    setEditMeeting(meeting);
    setShowMeetingForm(true);
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;

    try {
      const response = await fetch(`http://localhost:4000/api/meetings/${meetingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete meeting');
      }

      setMeetings(prev => prev.filter(m => m._id !== meetingId));
      alert('Meeting deleted successfully!');
    } catch (error) {
      console.error('Delete meeting error:', error);
      alert('Error deleting meeting: ' + error.message);
    }
  };

  const handleMeetingCreated = (savedMeeting) => {
    if (editMeeting) {
      // Update existing meeting
      setMeetings(prev => prev.map(m => m._id === savedMeeting._id ? savedMeeting : m));
      alert('Meeting updated successfully!');
    } else {
      // Add new meeting
      setMeetings(prev => [...prev, savedMeeting]);
      alert('Meeting created successfully!');
    }
  };

  const fetchMeetings = async (projectId) => {
    try {
      const meetRes = await fetch(`http://localhost:4000/api/meetings/project/${projectId}`);
      if (meetRes.ok) {
        const meetData = await meetRes.json();
        setMeetings(meetData);
      }
    } catch (error) {
      console.warn('Meetings API error:', error);
      setMeetings([]);
    }
  };

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
            <MilestoneList milestones={project.timeline} tasks={tasks} projectId={project._id} />
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
        <h3 className="text-lg font-semibold text-brown-primary mb-2">Generated Reports</h3>
        <ul className="space-y-2">
          {reports.map((rep, idx) => (
            <li key={rep._id || idx} className="bg-white rounded shadow px-4 py-2 flex items-center justify-between">
              <div>
                <p className="font-semibold text-brown-primary">{rep.reportType || `Report ${idx + 1}`}</p>
                <p className="text-xs text-gray-500">Created: {new Date(rep.createdAt).toLocaleDateString()}</p>
                {rep.dateStart && rep.dateEnd && (
                  <p className="text-xs text-gray-500">Period: {rep.dateStart} to {rep.dateEnd}</p>
                )}
                {rep.summary && (
                  <p className="text-xs text-gray-600 mt-1">{rep.summary}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded ${
                  rep.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {rep.status}
                </span>
                {rep.filePath && rep.status === 'completed' && (
                  <a 
                    href={`http://localhost:4000${rep.filePath}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    📄 Download
                  </a>
                )}
              </div>
            </li>
          ))}
          {reports.length === 0 && <li className="text-gray-500">No reports generated yet.</li>}
        </ul>
      </div>

      {/* 🔹 Meetings Section */}
      <div>
        <h3 className="text-lg font-semibold text-brown-primary mb-2">Meetings</h3>
        <ul className="space-y-2 mb-4">
          {meetings.map((meet, idx) => (
            <li key={meet._id || idx} className="bg-white rounded shadow px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{meet.channel}</span>
                    <p className="font-semibold text-brown-primary">{meet.channel} Meeting</p>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {new Date(meet.scheduledAt).toLocaleString()}
                  </p>
                  {meet.notes && (
                    <p className="text-xs text-gray-600">{meet.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {meet.link && (
                    <a 
                      href={meet.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Join
                    </a>
                  )}
                  <button
                    onClick={() => handleEditMeeting(meet)}
                    className="text-green-600 hover:text-green-800 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMeeting(meet._id)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
          {meetings.length === 0 && <li className="text-gray-500">No meetings scheduled.</li>}
        </ul>

        {/* Create New Meeting */}
        <button 
          onClick={handleCreateMeeting}
          className="bg-brown-primary text-white px-4 py-2 rounded-lg hover:bg-brown-dark"
        >
          + Create Meeting
        </button>
      </div>

      {/* Meeting Form Modal */}
      <CreateMeetingForm
        isOpen={showMeetingForm}
        onClose={() => setShowMeetingForm(false)}
        onMeetingCreated={handleMeetingCreated}
        project={projects[0]} // Use first project for now
        editMeeting={editMeeting}
      />
    </div>
  );
}
