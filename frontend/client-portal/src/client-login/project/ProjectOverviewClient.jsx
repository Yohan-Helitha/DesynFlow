import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Sidebar from '../components/SideBar';
import ProjectModelViewer from './ProjectModelViewer';

export default function ProjectOverviewClient() {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("project");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        
        // Get JWT token from localStorage
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Headers with authentication
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Use client-specific endpoints for better security
        const res = await fetch('http://localhost:3000/api/client/projects', { headers });
        if (!res.ok) throw new Error(`Failed to load projects: ${res.statusText}`);
        const list = await res.json();
        
        // Don't use fallback data - only use real data from database
        if (Array.isArray(list) && list.length > 0) {
          const first = list[0];
          console.log('Project data received:', first);
          console.log('3D Model URL:', first.finalDesign3DUrl);
          console.log('Design Access Restriction:', first.designAccessRestriction);
          console.log('All project fields:', Object.keys(first));
          console.log('Project values:', Object.keys(first).map(key => `${key}: ${first[key]}`));
          setProject(first);

          // fetch meetings for the project using client endpoint
          const mres = await fetch(`http://localhost:3000/api/meetings/project/${first._id}`, { headers });
          if (mres.ok) {
            const mdata = await mres.json();
            console.log('Meetings data received:', mdata);
            setMeetings(Array.isArray(mdata) ? mdata : []);
          }
        } else {
          // No projects found for this client
          setProject(null);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleSectionSelect = (section) => {
    setActiveSection(section);
    if (section === "dashboard") navigate("/dashboard");
    if (section === "inspection") navigate("/inspection-request");
    if (section === "payments") navigate("/payments");
    if (section === "warranty") navigate("/warranty");
    if (section === "profile") navigate("/profile");
  };

  // Debug logging
  console.log('Project data:', project);
  console.log('Client ID:', project?.clientId);
  console.log('Team ID:', project?.assignedTeamId);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Sidebar 
        activeSection={activeSection} 
        onSelect={handleSectionSelect} 
        onLogout={handleLogout} 
      />
      <div style={{ flex: 1 }}>
        {loading ? (
          <div style={{padding: '24px'}}>Loading project data...</div>
        ) : error ? (
          <div style={{padding: '24px', color: 'red'}}>Error: {error}</div>
        ) : !project ? (
          <div style={{padding: '24px'}}>No projects found for your account. Please contact support if you believe this is an error.</div>
        ) : (
          <ProjectContent project={project} meetings={meetings} />
        )}
      </div>
    </div>
  );
}

function ProjectContent({ project, meetings }) {
  const progress = project.progress || 0;
  const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString() : '-';
  const dueDate = project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '-';

  return (
    <div style={{padding: '24px'}}>
      {/* Project summary header */}
      <div style={{backgroundColor: '#f9f9f9', padding: '24px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
        <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#8B4513', marginBottom: '8px'}}>{project.projectName || 'Project Name'}</h2>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div>
            <p style={{fontSize: '14px', color: '#4B5563'}}><strong>Client:</strong> {
              typeof project.clientId === 'object' && project.clientId?.email 
                ? project.clientId.email 
                : typeof project.clientId === 'string' 
                ? project.clientId 
                : '-'
            }</p>
            <p style={{fontSize: '14px', color: '#4B5563'}}><strong>Assigned Team:</strong> {
              typeof project.assignedTeamId === 'object' && project.assignedTeamId?.name 
                ? project.assignedTeamId.name 
                : typeof project.assignedTeamId === 'string' 
                ? project.assignedTeamId 
                : '-'
            }</p>
          </div>
          <div>
            <p style={{fontSize: '14px', color: '#4B5563'}}><strong>Start Date:</strong> {startDate}</p>
            <p style={{fontSize: '14px', color: '#4B5563'}}><strong>Due Date:</strong> {dueDate}</p>
            <div style={{marginTop: '8px'}}>
              <div style={{width: '100%', backgroundColor: '#E5E7EB', borderRadius: '6px', height: '12px'}}>
                <div style={{backgroundColor: '#8B4513', height: '12px', borderRadius: '6px', width: `${progress}%`}} />
              </div>
              <div style={{fontSize: '12px', color: '#6B7280', marginTop: '4px'}}>{progress}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Meetings section */}
      <div style={{backgroundColor: '#f9f9f9', padding: '24px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
        <h3 style={{fontSize: '20px', fontWeight: '600', color: '#8B4513', marginBottom: '12px'}}>Meetings</h3>
        {meetings.length === 0 ? (
          <div style={{fontSize: '14px', color: '#6B7280'}}>No upcoming meetings.</div>
        ) : (
          meetings.map((m) => (
            <div key={m._id} style={{padding: '12px', backgroundColor: 'white', borderRadius: '6px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <div>
                <div style={{fontWeight: '600', marginBottom: '4px'}}>{m.channel || 'Meeting'} Meeting</div>
                <div style={{fontSize: '12px', color: '#6B7280', marginBottom: '4px'}}>
                  {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString() : 'No date specified'}
                </div>
                <div style={{fontSize: '12px', color: '#4B5563', marginBottom: '2px'}}>
                  <strong>Platform:</strong> {m.channel || 'Not specified'}
                </div>
                {m.notes && (
                  <div style={{fontSize: '14px', color: '#4B5563', marginTop: '4px'}}>
                    <strong>Notes:</strong> {m.notes}
                  </div>
                )}
                {m.withClientId && (
                  <div style={{fontSize: '12px', color: '#6B7280', marginTop: '2px'}}>
                    <strong>With:</strong> {typeof m.withClientId === 'object' ? m.withClientId.email || m.withClientId.username : m.withClientId}
                  </div>
                )}
              </div>
              <div>
                {m.link ? (
                  <a 
                    style={{display: 'inline-block', backgroundColor: '#8B4513', color: 'white', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', fontSize: '14px', fontWeight: '600'}} 
                    href={m.link} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    Join
                  </a>
                ) : (
                  <span style={{display: 'inline-block', backgroundColor: '#9CA3AF', color: 'white', padding: '8px 16px', borderRadius: '4px', fontSize: '14px'}}>
                    No Link
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3D Model section */}
      <div style={{backgroundColor: '#f9f9f9', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
        <h3 style={{fontSize: '20px', fontWeight: '600', color: '#8B4513', marginBottom: '12px'}}>3D Model</h3>
        {project.finalDesign3DUrl ? (
          <ProjectModelViewer src={project.finalDesign3DUrl} restriction={project.designAccessRestriction || false} />
        ) : (
          <div style={{textAlign: 'center', padding: '40px', color: '#6B7280', backgroundColor: 'white', borderRadius: '8px', border: '2px dashed #D1D5DB'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>📦</div>
            <div style={{fontSize: '16px', fontWeight: '600', marginBottom: '8px'}}>No 3D Model Available</div>
            <div style={{fontSize: '14px'}}>The team leader will upload the 3D model once the design is ready.</div>
          </div>
        )}
      </div>
    </div>
  );
}
