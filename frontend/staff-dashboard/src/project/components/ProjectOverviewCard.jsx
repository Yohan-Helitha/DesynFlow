import React from "react";

export default function ProjectOverviewCard({ project }) {
  if (!project) return <div className="p-6 text-center text-gray-500">No project provided.</div>;

  return (
    <div>
      <div key={project._id} className="bg-cream-primary rounded-lg shadow p-6 mb-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-xl font-bold text-brown-primary">{project.projectName}</h3>
            <div className="text-sm text-gray-600">{project.clientName || "Client"}</div>
          </div>
          <span className={`px-3 py-1 rounded text-xs font-bold ${project.status === 'Active' ? 'bg-green-100 text-green-700' : project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{project.status || "Unknown"}</span>
        </div>
        <div className="text-sm text-gray-700 mb-2">
          {project.startDate ? `${new Date(project.startDate).toLocaleDateString()} - ${new Date(project.dueDate).toLocaleDateString()}` : "No dates set"}
        </div>
      </div>
    </div>
  );
}
