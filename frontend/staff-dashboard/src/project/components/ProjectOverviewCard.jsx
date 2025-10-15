import React from "react";

export default function ProjectOverviewCard({ project }) {
  if (!project) return <div className="p-6 text-center text-gray-500">No project provided.</div>;

  return (
    <div>
      {/* Card background switched to a cleaner background; use `bg-white` so Tailwind theme colors render consistently. */}
      <div key={project._id} className="bg-white rounded-lg shadow p-6 mb-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-xl font-bold text-brown-primary">{project.projectName}</h3>
            <div className="text-sm text-gray-600">{project.clientName || "Client"}</div>
          </div>
          {/* Status badge uses the project's brown tokens to match other buttons/controls */}
          <span
            className={`px-3 py-1 rounded text-xs font-bold ${
              project.status === 'Active'
                ? 'bg-brown-primary text-white'
                : project.status === 'In Progress'
                ? 'bg-blue-500 text-white'
                : project.status === 'Completed'
                ? 'bg-purple-500 text-white'
                : project.status === 'On Hold'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {project.status || "Unknown"}
          </span>
        </div>
        <div className="text-sm text-gray-700 mb-2">
          {project.startDate ? `${new Date(project.startDate).toLocaleDateString()} - ${new Date(project.dueDate).toLocaleDateString()}` : "No dates set"}
        </div>
      </div>
    </div>
  );
}
