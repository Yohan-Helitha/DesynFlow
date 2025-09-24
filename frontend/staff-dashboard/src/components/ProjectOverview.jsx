
export default function ProjectOverview({ project, onBack }) {
  if (!project) {
    return <div className="text-center text-gray-500 p-8">No project selected.</div>;
  }

  return (
    <div className="bg-cream-primary min-h-screen p-8">
      <button
        className="mb-6 px-4 py-2 bg-brown-primary text-white rounded hover:bg-opacity-90 font-semibold"
        onClick={onBack}
      >
        ← Back to Projects
      </button>
      <h2 className="text-2xl font-bold text-brown-primary mb-6">Project Assignment & Overview</h2>
    <div className="bg-cream-primary rounded-lg shadow-md p-6 mb-6">
            <div className="text-xl font-bold text-brown-primary mb-2">{project.projectName}</div>
            <div className="text-gray-700 mb-2"><span className="font-semibold">Client:</span> {project.clientName}</div>
            <div className="text-gray-700 mb-2"><span className="font-semibold">Due Date:</span> {project.dueDate}</div>
            <div className="text-gray-700 mb-2"><span className="font-semibold">Assigned Team:</span> {project.assignedTeam}</div>
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                project.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : project.status === "In Progress"
                  ? "bg-blue-100 text-blue-700"
                  : project.status === "On Hold"
                  ? "bg-yellow-100 text-yellow-700"
                  : project.status === "Pending"
                  ? "bg-gray-100 text-gray-700"
                  : "bg-gray-100 text-gray-700"
              }`}>
                {project.status}
              </span>
              {project.status === "In Progress" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Progress</span>
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

    {/* Team Overview */}
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-brown-primary mb-2">Team Overview</h3>
            <div className="flex flex-wrap gap-8">
              <div>
                <div className="font-semibold text-brown-primary mb-1">Team Members</div>
                <ul className="text-gray-700 text-sm">
                  {project.teamMembers?.map((m, i) => (
                    <li key={i}>{m.name} <span className="text-xs text-gray-500">(Available - {m.load}% load)</span></li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-semibold text-brown-primary mb-1">Quick Stats</div>
                <div className="bg-blue-50 rounded p-2 mb-2">Active Tasks: <span className="font-bold">{project.quickStats?.activeTasks ?? 0}</span></div>
                <div className="bg-green-50 rounded p-2">Attendance Records: <span className="font-bold">{project.quickStats?.attendance ?? 0}</span></div>
              </div>
            </div>
          </div>

    {/* Timeline */}
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-brown-primary mb-2">Timeline</h3>
            <ul className="space-y-2">
              {project.timeline?.map((m, i) => (
                <li key={i} className="bg-cream-light rounded shadow px-4 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-brown-primary">{m.name}</span>
                    <span className="text-xs text-gray-600">{new Date(m.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{m.description}</div>
                </li>
              ))}
              {(!project.timeline || project.timeline.length === 0) && (
                <li className="text-gray-500">No timeline items found.</li>
              )}
            </ul>
          </div>

    {/* Documents */}
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-brown-primary mb-2">Documents</h3>
            <ul className="space-y-2">
              {project.documents?.length > 0 ? (
                project.documents.map((doc, i) => (
                  <li key={i} className="bg-white rounded shadow px-4 py-2 flex items-center justify-between">
                    <span className="font-semibold text-brown-primary">{doc.name}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No documents found.</li>
              )}
            </ul>
          </div>

    {/* Resource Requests */}
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-brown-primary mb-2">Resource Requests</h3>
            <ul className="space-y-2">
              {project.resourceRequests?.length > 0 ? (
                project.resourceRequests.map((req, i) => (
                  <li key={i} className="bg-white rounded shadow px-4 py-2 flex items-center justify-between">
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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-brown-primary mb-2">Reports</h3>
            <ul className="space-y-2">
              {project.reports?.length > 0 ? (
                project.reports.map((rep, i) => (
                  <li key={i} className="bg-white rounded shadow px-4 py-2 flex items-center justify-between">
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
  );
}
