import { FaUsers, FaTasks, FaCalendarAlt, FaFileAlt, FaBoxOpen, FaChartBar } from "react-icons/fa";

import { useEffect, useState } from "react";

export default function ProjectOverview({ projectId, onBack }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`http://localhost:4000/api/projects/${projectId}`);
        if (!res.ok) throw new Error("Failed to fetch project");
        const data = await res.json();
        setProject(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (projectId) fetchProject();
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
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-l-8 border-green-primary">
        <h2 className="text-2xl font-bold text-brown-primary mb-4">
          {project.projectName}
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-gray-700">
          <p><span className="font-semibold">Client:</span> {project.clientId}</p>
          <p><span className="font-semibold">Due Date:</span> {project.dueDate || 'Not specified'}</p>
          <p><span className="font-semibold">Assigned Team:</span> {project.assignedTeamId?.teamName}</p>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                project.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : project.status === "In Progress"
                  ? "bg-blue-100 text-blue-700"
                  : project.status === "On Hold"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {project.status}
            </span>
            {project.status === "In Progress" && (
              <div className="flex items-center gap-2 w-full">
                <div className="w-32 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-brown-primary h-2.5 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">{project.progress}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Team Overview */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-brown-primary mb-3 flex items-center gap-2">
            <FaUsers /> Team Overview
          </h3>
          <div className="flex flex-col gap-3">
            <div>
              <p className="font-semibold text-brown-primary">Team Members</p>
              <ul className="text-sm text-gray-700 list-disc pl-5">
                {project.assignedTeamId?.members?.map((m, i) => (
                  <li key={i}>
                    {m.role}{" "}
                    <span className="text-xs text-gray-500">
                      ({m.availability} - {m.workload}% load)
                    </span>
                  </li>
                )) || <li className="text-gray-500">No team members found.</li>}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-brown-primary">Quick Stats</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-blue-50 rounded-lg p-3 text-center shadow-sm">
                  Active Tasks:{" "}
                  <span className="font-bold">{project.quickStats?.activeTasks ?? 0}</span>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center shadow-sm">
                  Attendance:{" "}
                  <span className="font-bold">{project.quickStats?.attendance ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-md p-6">
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
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-brown-primary mb-3 flex items-center gap-2">
            <FaFileAlt /> Documents
          </h3>
          <ul className="space-y-2">
            {project.attachments?.length > 0 ? (
              project.attachments.map((docPath, i) => {
                // Extract filename from path
                const filename = docPath.split('/').pop() || 'Document';
                const displayName = filename.replace(/_/g, ' ').replace(/\.[^/.]+$/, "");
                const fileExtension = filename.split('.').pop()?.toUpperCase();
                const downloadUrl = `http://localhost:4000${docPath}`;
                
                return (
                  <li
                    key={i}
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
              })
            ) : (
              <li className="text-gray-500">No documents found.</li>
            )}
          </ul>
        </div>

        {/* Resource Requests */}
        <div className="bg-white rounded-xl shadow-md p-6">
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
        <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2">
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
