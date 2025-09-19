
import React, { useState, useEffect } from "react";

export default function AssignTeams() {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    client: "",
    team: "",
    report: null,
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('http://localhost:4000/api/projects').then(res => res.json()),
      fetch('http://localhost:4000/api/teams').then(res => res.json())
    ])
      .then(([projectsData, teamsData]) => {
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setTeams(Array.isArray(teamsData) ? teamsData : []);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to fetch data: " + err.message);
        setLoading(false);
      });
  }, []);

  // Create project
  const handleCreate = async () => {
    setError(null);
    if (!form.name || !form.client) {
      setError("Project name and client are required");
      return;
    }
    try {
      const payload = {
        projectName: form.name,
        clientId: form.client,
        assignedTeamId: form.team || null,
        status: "Active",
        progress: 0
      };
      const res = await fetch('http://localhost:4000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create project");
      setModalOpen(false);
      setForm({ name: "", client: "", team: "", report: null });
      // Refresh data
      setLoading(true);
      const projectsRes = await fetch('http://localhost:4000/api/projects');
      const projectsData = await projectsRes.json();
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setLoading(false);
    } catch (err) {
      setError("Create error: " + err.message);
      setLoading(false);
    }
  };

  // Delete project
  const handleDelete = async (id) => {
    setError(null);
    try {
      const res = await fetch(`http://localhost:4000/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete project");
      // Refresh data
      setLoading(true);
      const projectsRes = await fetch('http://localhost:4000/api/projects');
      const projectsData = await projectsRes.json();
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setLoading(false);
    } catch (err) {
      setError("Delete error: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream-light min-h-screen p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-brown-primary">Assign Teams</h2>
        <button
          className="bg-brown-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90"
          onClick={() => setModalOpen(true)}
        >
          + Create Project
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-900 hover:text-red-700">×</button>
        </div>
      )}

      <div className="bg-cream-primary rounded-lg shadow p-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-brown-primary">Loading projects...</div>
          </div>
        ) : (
          <table className="w-full text-brown-primary">
            <thead className="bg-cream-light">
              <tr>
                <th className="py-2 px-3 text-left">Project Name</th>
                <th className="py-2 px-3 text-left">Client Name</th>
                <th className="py-2 px-3 text-left">Assigned Team</th>
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 px-3 text-center text-gray-500">
                    No projects found. Click "Create Project" to add your first project.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project._id} className={project.status === "On Hold" ? "bg-red-50" : ""}>
                    <td className="py-2 px-3 font-semibold">{project.projectName}</td>
                    <td className="py-2 px-3">{project.clientId || "Unknown Client"}</td>
                    <td className="py-2 px-3">{project.assignedTeamId?.teamName || "No Team Assigned"}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        project.status === "Active" ? "bg-green-100 text-green-primary" : 
                        project.status === "On Hold" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {project.status || "Unknown"}
                      </span>
                    </td>
                    <td className="py-2 px-3 flex gap-2">
                      <button className="text-brown-primary hover:text-green-primary">
                        <i className="fas fa-edit" />
                      </button>
                      <button className="text-brown-primary hover:text-red-600" onClick={() => handleDelete(project._id)}>
                        <i className="fas fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold text-brown-primary mb-4">Create New Project</h3>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">{error}</div>
            )}
            <div className="mb-3">
              <label className="block text-brown-primary font-semibold mb-1">Project Name *</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Enter project name"
              />
            </div>
            <div className="mb-3">
              <label className="block text-brown-primary font-semibold mb-1">Client *</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
                value={form.client}
                onChange={e => setForm({ ...form, client: e.target.value })}
                placeholder="Enter client name"
              />
            </div>
            <div className="mb-3">
              <label className="block text-brown-primary font-semibold mb-1">Assigned Team</label>
              <select
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
                value={form.team}
                onChange={e => setForm({ ...form, team: e.target.value })}
              >
                <option value="">No Team Assigned</option>
                {teams.map(team => (
                  <option key={team._id} value={team._id}>
                    {team.teamName} ({team.members?.length || 0} members)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-brown-primary font-semibold hover:bg-gray-300"
                onClick={() => {
                  setModalOpen(false);
                  setError(null);
                  setForm({ name: "", client: "", team: "", report: null });
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-brown-primary text-white font-semibold hover:bg-opacity-90"
                onClick={handleCreate}
                disabled={!form.name || !form.client}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
