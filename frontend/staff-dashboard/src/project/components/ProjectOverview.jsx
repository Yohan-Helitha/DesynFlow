import { FaUsers, FaTasks, FaCalendarAlt, FaFileAlt, FaBoxOpen, FaChartBar } from "react-icons/fa";

import { useEffect, useState } from "react";

export default function ProjectOverview({ projectId, onBack }) {
  const [project, setProject] = useState(null);
  const [quotationDocuments, setQuotationDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) throw new Error("Failed to fetch project");
        const data = await res.json();
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
    
    if (projectId) {
      fetchProject();
      fetchQuotationDocuments();
    }
  }, [projectId]);

  if (loading) return <div className="text-center text-gray-500 p-8">Loading project...</div>;
  if (error) return <div className="text-center text-red-500 p-8">Error: {error}</div>;
  if (!project) return <div className="text-center text-gray-500 p-8">No project selected.</div>;

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
                  ? "bg-green-100 text-green-700"
                  : project.status === "In Progress"
                  ? "bg-cream-light text-brown-primary"
                  : project.status === "Completed"
                  ? "bg-purple-100 text-purple-700"
                  : project.status === "On Hold"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {project.status}
            </span>
            {(project.status === "In Progress" || project.status === "Completed") && (
              <div className="flex items-center gap-2 w-full">
                <div className="w-32 bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      project.status === "Completed" 
                        ? "bg-purple-500" 
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
                {project.assignedTeamId?.members && Array.isArray(project.assignedTeamId.members) ? (
                  project.assignedTeamId.members.map((m, i) => (
                    <li key={i}>
                      {typeof m === 'object' ? (
                        <>
                          {m.name || m.username || `Member ${i + 1}`} - {m.role || 'No role specified'}
                          <span className="text-xs text-gray-500">
                            {m.availability && m.workload ? ` (${m.availability} - ${m.workload}% load)` : ''}
                          </span>
                        </>
                      ) : (
                        `${m}`
                      )}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No team members found.</li>
                )}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-brown-primary">Quick Stats</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-cream-light rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-gray-600">Active Tasks</div>
                  <div className="font-bold text-blue-700">{project.quickStats?.activeTasks ?? 0}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-gray-600">Attendance</div>
                  <div className="font-bold text-green-700">{project.quickStats?.attendance ?? 0}</div>
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
                  const filename = isObject ? attachment.filename || attachment.originalName : attachment.split('/').pop();
                  const displayName = isObject ? attachment.originalName || filename : filename?.replace(/_/g, ' ').replace(/\.[^/.]+$/, "");
                  const fileExtension = filename?.split('.').pop()?.toUpperCase();
                  const downloadUrl = `${isObject ? attachment.path : attachment}`;
                  
                  return (
                    <li
                      key={`attachment-${i}`}
                      className="bg-cream-light rounded-lg px-4 py-2 flex justify-between items-center shadow-sm hover:bg-cream-primary cursor-pointer"
                      onClick={() => window.open(downloadUrl, '_blank')}
                    >
                      <span className="font-semibold text-brown-primary">{displayName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{fileExtension}</span>
                        <span className="text-xs text-blue-600 font-medium">Download</span>
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
                    className="bg-green-50 rounded-lg px-4 py-3 flex justify-between items-center shadow-sm hover:bg-green-100 cursor-pointer border-l-4 border-green-500"
                    onClick={() => window.open(quotation.fileUrl, '_blank')}
                  >
                    <div>
                      <span className="font-semibold text-green-800">
                        Quotation v{quotation.version} (Est. #{quotation.estimateVersion})
                      </span>
                      <div className="text-xs text-green-600 flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          quotation.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                          quotation.status === 'Locked' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
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
                      <span className="text-xs text-green-600">PDF</span>
                      <span className="text-xs text-blue-600 font-medium">Download</span>
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
      </div>
    </div>
  );
}
