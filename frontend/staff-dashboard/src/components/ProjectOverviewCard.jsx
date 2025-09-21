import React from "react";
export default function ProjectOverviewCard({ project }) {
  if (!project) return null;
  return (
    <div className="bg-cream-primary rounded-lg shadow p-6 mb-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-xl font-bold text-brown-primary">{project.projectName}</h3>
          <div className="text-sm text-gray-600">{project.clientName || "Client"}</div>
        </div>
        <span className={`px-3 py-1 rounded text-xs font-bold ${project.priority === 'high' ? 'bg-pink-100 text-pink-700' : project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{project.priority ? project.priority.charAt(0).toUpperCase() + project.priority.slice(1) + " Priority" : ""}</span>
      </div>
      <div className="text-sm text-gray-700 mb-2">
        {project.startDate ? `${new Date(project.startDate).toLocaleDateString()} - ${new Date(project.endDate).toLocaleDateString()}` : "No dates set"}
      </div>
      <div className="text-sm text-gray-700">{project.description}</div>
    </div>
  );
}
