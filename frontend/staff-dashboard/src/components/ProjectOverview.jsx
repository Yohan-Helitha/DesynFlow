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

  // ...existing code...
  return (
    <div className="bg-cream-primary min-h-screen p-8">
      {/* Back Button */}
      <button
        className="mb-6 px-4 py-2 bg-brown-primary text-white rounded-lg shadow hover:bg-opacity-90 font-semibold"
        onClick={onBack}
      >
        ← Back to Projects
      </button>
      {/* ...existing code for project details... */}
      {/* Project Header, Two-column layout, etc. (unchanged) */}
      {/* ...existing code... */}
    </div>
  );
}
