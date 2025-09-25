import React, { useEffect, useState } from "react";

export default function ProjectOverviewCard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:4000/api/projects");
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading projects...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  if (!projects.length) return <div className="p-6 text-center text-gray-500">No projects found.</div>;

  return (
    <div>
      {projects.map((project) => (
        <div key={project._id} className="bg-cream-primary rounded-lg shadow p-6 mb-4">
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
      ))}
    </div>
  );
}
