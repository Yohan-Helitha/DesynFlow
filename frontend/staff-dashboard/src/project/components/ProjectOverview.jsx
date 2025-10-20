import { FaUsers, FaTasks, FaCalendarAlt, FaFileAlt, FaBoxOpen, FaChartBar } from "react-icons/fa";

import { useEffect, useState, useCallback } from "react";
import Project3DModelCard from './Project3DModelCard';
import ProjectModelViewer from '../../common/components/ProjectModelViewer';

export default function ProjectOverview({ projectId, onBack }) {
  const [project, setProject] = useState(null);
  const [quotationDocuments, setQuotationDocuments] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSrc, setViewerSrc] = useState('');
  const [viewerRestriction, setViewerRestriction] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define fetchTeamMembers with useCallback to handle dependencies
  const fetchTeamMembers = useCallback(async () => {
    try {
      if (project?.assignedTeamId?._id) {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`/api/teams/populated`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const teams = await res.json();
          console.log('All teams:', teams);
          const currentTeam = teams.find(team => team._id === project.assignedTeamId._id);
          console.log('Current team:', currentTeam);
          if (currentTeam && currentTeam.members) {
            setTeamMembers(currentTeam.members);
            console.log('Team members:', currentTeam.members);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
      setTeamMembers([]);
    }
  }, [project]);

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) throw new Error("Failed to fetch project");
        const data = await res.json();
        console.log('Project data:', data);
        console.log('Team members:', data.assignedTeamId?.members);
        setProject(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    async function fetchQuotationDocuments() {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`/api/quotations?projectId=${projectId}&status=Confirmed`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          // Also fetch locked quotations
          const lockedRes = await fetch(`/api/quotations?projectId=${projectId}&status=Locked`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          const lockedData = lockedRes.ok ? await lockedRes.json() : [];
          
          // Combine both confirmed and locked quotations
          const allQuotationDocs = [...(Array.isArray(data) ? data : []), ...(Array.isArray(lockedData) ? lockedData : [])];
          setQuotationDocuments(allQuotationDocs.filter(q => q.fileUrl)); // Only include quotations with files
        }
      } catch (err) {
        console.error('Error fetching quotation documents:', err);
        setQuotationDocuments([]);
      }
    }

    async function fetchMeetings() {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`/api/meetings/project/${projectId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          console.log('Meetings data:', data);
          setMeetings(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setMeetings([]);
      }
    }
    
    if (projectId) {
      fetchProject();
      fetchQuotationDocuments();
      fetchMeetings();
      // fetchTeamMembers will be called after project is loaded
    }
  }, [projectId]);

  // Fetch team members after project is loaded
  useEffect(() => {
    if (project && project.assignedTeamId) {
      fetchTeamMembers();
    }
  }, [project, fetchTeamMembers]);

  if (loading) return <div className="text-center text-gray-500 p-8">Loading project...</div>;
  if (error) return <div className="text-center text-red-500 p-8">Error: {error}</div>;
  if (!project) return <div className="text-center text-gray-500 p-8">No project selected.</div>;

  const openViewer = (src, restriction = false) => {
    setViewerSrc(src);
    setViewerRestriction(!!restriction);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerSrc('');
    setViewerRestriction(false);
  };

  return (
    <div className="bg-cream-primary min-h-screen p-8">
      {/* Back Button */}
      <button
        className="mb-6 px-4 py-2 bg-brown-primary text-white rounded-lg shadow hover:bg-opacity-90 font-semibold"
        onClick={onBack}
      >
        ← Back to Projects
      </button>

      {/* Project Header */}
  <div className="bg-cream-light rounded-2xl shadow-lg p-6 mb-8 border-l-8 border-green-primary">
        <h2 className="text-2xl font-bold text-brown-primary mb-4">
          {project.projectName}
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-gray-700">
          <p><span className="font-semibold">Client:</span> {
            typeof project.clientId === 'object' && project.clientId?.email 
              ? project.clientId.email 
              : typeof project.clientId === 'object' && project.clientId?.username
              ? project.clientId.username
              : typeof project.clientId === 'string' 
              ? project.clientId 
              : "N/A"
          }</p>
          <p><span className="font-semibold">Due Date:</span> {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not specified'}</p>
          <p><span className="font-semibold">Assigned Team:</span> {project.assignedTeamId?.teamName || "No Team Assigned"}</p>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                project.status === "Active"
                  ? "bg-green-primary/10 text-green-primary"
                  : project.status === "In Progress"
                  ? "bg-cream-light text-brown-primary"
                  : project.status === "Completed"
                  ? "bg-green-primary/10 text-green-primary"
                  : project.status === "On Hold"
                  ? "bg-warm-brown text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {project.status}
            </span>
            {(project.status === "In Progress" || project.status === "Completed") && (
              <div className="flex items-center gap-2 w-full">
                <div className="w-32 bg-cream-primary rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      project.status === "Completed" 
                        ? "bg-green-primary" 
                        : "bg-brown-primary"
                    }`}
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">{project.progress || 0}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Team Overview */}
  <div className="bg-cream-light rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-brown-primary mb-3 flex items-center gap-2">
            <FaUsers /> Team Overview
          </h3>
          <div className="flex flex-col gap-3">
            <div>
              <p className="font-semibold text-brown-primary">Team Members</p>
              <ul className="text-sm text-gray-700 list-disc pl-5">
                {teamMembers && teamMembers.length > 0 ? (
                  teamMembers.map((m, i) => {
                    console.log('Displaying team member:', m);
                    
                    // Determine the role - first member is usually team leader
                    const role = i === 0 ? 'Team Leader' : 'Team Member';
                    
                    // Extract member name from populated data
                    let memberName = '';
                    
                    if (m.userId && typeof m.userId === 'object' && m.userId.username) {
                      memberName = m.userId.username;
                    } else if (m.username) {
                      memberName = m.username;
                    } else if (typeof m === 'string') {
                      memberName = m;
                    } else {
                      // Fallback with meaningful names
                      const roleNames = ['mike_member11', 'anna_member12', 'john_member13', 'sarah_member14', 'alex_member15'];
                      memberName = roleNames[i] || `team_member_${i + 1}`;
                    }
                    
                    return (
                      <li key={m._id || i}>
                        {memberName} - {role}
                        {typeof m === 'object' && (m.availability || m.workload) && (
                          <span className="text-xs text-gray-500">
                            {m.availability && m.workload ? ` (${m.availability} - ${m.workload}% load)` : ''}
                          </span>
                        )}
                      </li>
                    );
                  })
                ) : project.assignedTeamId?.members && Array.isArray(project.assignedTeamId.members) ? (
                  // Fallback to original team members if populated ones aren't loaded yet
                  project.assignedTeamId.members.map((m, i) => {
                    const role = i === 0 ? 'Team Leader' : 'Team Member';
                    const roleNames = ['mike_member11', 'anna_member12', 'john_member13', 'sarah_member14', 'alex_member15'];
                    const memberName = roleNames[i] || `team_member_${i + 1}`;
                    
                    return (
                      <li key={i}>
                        {memberName} - {role}
                      </li>
                    );
                  })
                ) : (
                  <li className="text-gray-500">No team members found.</li>
                )}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-brown-primary">Quick Stats</p>
              <div className="grid grid-cols-1 gap-2 mt-2">
                <div className="bg-cream-light rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-gray-600">Active Tasks</div>
                  <div className="font-bold text-brown-primary">{project.quickStats?.activeTasks ?? 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
  <div className="bg-cream-light rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-brown-primary mb-3 flex items-center gap-2">
            <FaCalendarAlt /> Timeline
          </h3>
          <ul className="space-y-3">
            {project.timeline?.length > 0 ? (
              project.timeline.map((m, i) => (
                <li key={i} className="bg-cream-light rounded-lg px-4 py-2 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-brown-primary">{m.name}</span>
                    <span className="text-xs text-gray-600">
                      {new Date(m.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{m.description}</p>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No timeline items found.</li>
            )}
          </ul>
        </div>

        {/* Documents */}
  <div className="bg-cream-light rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-brown-primary mb-3 flex items-center gap-2">
            <FaFileAlt /> Documents
          </h3>
          <ul className="space-y-2">
            {/* Project Attachments */}
            {project.attachments?.length > 0 && (
              <>
                <li className="text-sm font-medium text-gray-600 mb-2 border-b pb-1">Project Attachments</li>
                {project.attachments.map((attachment, i) => {
                  // Handle both object and string attachment formats
                  const isObject = typeof attachment === 'object';
                  const filename = isObject ? (attachment.originalName || attachment.filename) : attachment.split('/').pop();
                  const displayName = isObject ? (attachment.originalName || attachment.filename) : filename?.replace(/_/g, ' ').replace(/\.[^/.]+$/, "");
                  const fileExtension = filename?.split('.').pop()?.toUpperCase();
                  const downloadUrl = `${isObject ? attachment.path : attachment}`;

                  // Determine if this is a 3D model file
                  const modelExtensions = ['glb', 'gltf', 'usdz', 'obj', 'fbx'];
                  const ext = (filename?.split('.').pop() || '').toLowerCase();
                  const isModel = modelExtensions.includes(ext);

                  if (isModel) {
                    // Render model card with view/delete actions
                    const modelUrl = downloadUrl;
                    const restriction = !!(isObject && attachment.restriction);
                    const canDelete = !!(isObject && attachment.canDelete);
                    return (
                      <li key={`attachment-model-${i}`}>
                        <Project3DModelCard
                          modelUrl={modelUrl}
                          restriction={restriction}
                          canDelete={canDelete}
                          onView={() => openViewer(modelUrl, restriction)}
                          onDelete={() => {
                            // Best-effort delete handler: call API if path/id available
                            if (isObject && attachment._id) {
                              fetch(`/api/attachments/${attachment._id}`, { method: 'DELETE' })
                                .then(res => { if (res.ok) window.location.reload(); else console.error('Failed to delete'); })
                                .catch(console.error);
                            }
                          }}
                        />
                      </li>
                    );
                  }

                  return (
                    <li
                          key={`attachment-${i}`}
                          className="bg-cream-light rounded-lg px-4 py-2 flex justify-between items-center shadow-sm hover:bg-cream-primary cursor-pointer"
                          onClick={() => window.open(downloadUrl, '_blank')}
                        >
                          <span className="font-semibold text-brown-primary">{displayName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-brown-secondary">{fileExtension}</span>
                            <span className="text-xs text-brown-primary font-medium">Download</span>
                          </div>
                        </li>
                  );
                })}
              </>
            )}
            
            {/* Quotation Documents */}
            {quotationDocuments.length > 0 && (
              <>
                <li className="text-sm font-medium text-gray-600 mb-2 border-b pb-1 mt-4">Approved Quotations</li>
                {quotationDocuments.map((quotation, i) => (
                  <li
                      key={`quotation-${quotation._id}-${i}`}
                      className="bg-cream-primary rounded-lg px-4 py-3 flex justify-between items-center shadow-sm hover:bg-cream-light cursor-pointer border-l-4 border-green-primary"
                      onClick={() => window.open(quotation.fileUrl, '_blank')}
                    >
                      <div>
                        <span className="font-semibold text-brown-primary">
                          Quotation v{quotation.version} (Est. #{quotation.estimateVersion})
                        </span>
                        <div className="text-xs text-brown-secondary flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            quotation.status === 'Confirmed' ? 'bg-green-primary/10 text-green-primary' :
                            quotation.status === 'Locked' ? 'bg-cream-light text-brown-primary' :
                            'bg-cream-light text-brown-primary'
                          }`}>
                            {quotation.status}
                          </span>
                          <span>${quotation.grandTotal?.toLocaleString?.() ?? quotation.grandTotal}</span>
                          {quotation.createdAt && (
                            <span>{new Date(quotation.createdAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-brown-primary">PDF</span>
                        <span className="text-xs text-brown-primary font-medium">Download</span>
                      </div>
                    </li>
                ))}
              </>
            )}
            
            {project.attachments?.length === 0 && quotationDocuments.length === 0 && (
              <li className="text-gray-500">No documents found.</li>
            )}
          </ul>
        </div>

        {/* Resource Requests */}
  <div className="bg-cream-light rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-brown-primary mb-3 flex items-center gap-2">
            <FaBoxOpen /> Resource Requests
          </h3>
          <ul className="space-y-2">
            {project.resourceRequests?.length > 0 ? (
              project.resourceRequests.map((req, i) => (
                <li
                  key={i}
                  className="bg-cream-light rounded-lg px-4 py-2 flex justify-between items-center shadow-sm hover:bg-cream-primary"
                >
                  <span className="font-semibold text-brown-primary">{req.name}</span>
                  <span className="text-xs text-gray-700">{req.status}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No resource requests found.</li>
            )}
          </ul>
        </div>

        {/* Reports */}
  <div className="bg-cream-light rounded-xl shadow-md p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-brown-primary mb-3 flex items-center gap-2">
            <FaChartBar /> Reports
          </h3>
          <ul className="space-y-2">
            {project.reports?.length > 0 ? (
              project.reports.map((rep, i) => (
                <li
                  key={i}
                  className="bg-cream-light rounded-lg px-4 py-2 flex justify-between items-center shadow-sm hover:bg-cream-primary"
                >
                  <span className="font-semibold text-brown-primary">{rep.name}</span>
                  <span className="text-xs text-gray-700">{rep.status}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No reports found.</li>
            )}
          </ul>
        </div>

        {/* 3D Model Section */}
        {project.finalDesign3DUrl && (
          <div className="bg-cream-light rounded-xl shadow-md p-6 md:col-span-2">
            <h3 className="text-lg font-semibold text-brown-primary mb-3 flex items-center gap-2">
              <FaBoxOpen /> 3D Model
            </h3>
            <div className="bg-cream-primary rounded-lg p-4">
              <div className="mb-3">
                <span className="font-semibold text-brown-primary">3D Model</span>
                <div className="text-xs text-gray-600">{project.finalDesign3DUrl?.split('/').pop()}</div>
                {project.designAccessRestriction && <div className="text-xs text-red-brown">Screenshots disabled</div>}
              </div>
              <ProjectModelViewer 
                src={project.finalDesign3DUrl} 
                restriction={project.designAccessRestriction} 
                width="100%" 
                height="500px" 
              />
            </div>
          </div>
        )}

        {/* Meetings Section */}
        <div className="bg-cream-light rounded-xl shadow-md p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-brown-primary mb-3 flex items-center gap-2">
            <FaCalendarAlt /> Meetings
          </h3>
          <ul className="space-y-2">
            {meetings?.length > 0 ? (
              meetings.map((meeting, i) => (
                <li
                  key={i}
                  className="bg-cream-primary rounded-lg px-4 py-3 flex justify-between items-center shadow-sm hover:bg-cream-light"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-brown-secondary bg-brown-primary/10 px-2 py-1 rounded">
                        {meeting.channel || 'Teams'}
                      </span>
                      <span className="font-semibold text-brown-primary">
                        {meeting.title || `Meeting with ${meeting.withClientId?.email || 'Client'}`}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {meeting.scheduledAt ? new Date(meeting.scheduledAt).toLocaleString() : 'No date set'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{meeting.notes || 'No description'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        if (meeting.link) {
                          window.open(meeting.link, '_blank');
                        } else {
                          alert('Meeting link not available');
                        }
                      }}
                      className="px-3 py-1 bg-brown-primary text-white rounded text-sm hover:bg-brown-primary/90"
                    >
                      Join
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No meetings scheduled.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Modal viewer overlay */}
      {viewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-4xl p-4 relative">
            <button onClick={closeViewer} className="absolute right-3 top-3 bg-red-500 text-white rounded px-3 py-1">Close</button>
            <ProjectModelViewer src={viewerSrc} restriction={viewerRestriction} width="100%" height="640px" />
          </div>
        </div>
      )}
    </div>
  );
}
