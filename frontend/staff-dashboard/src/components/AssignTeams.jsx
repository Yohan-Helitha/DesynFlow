import React, { useEffect, useState } from "react";

export default function AssignTeams() {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    client: "",
    team: "",
    report: null,
  });
  const [availableTeams, setAvailableTeams] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchTeams();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
  };

  const fetchTeams = async () => {
    const res = await fetch("/api/teams?available=true");
    const data = await res.json();
    setTeams(data);
    setAvailableTeams(data.filter(team => team.available));
  };

  const handleCreate = async () => {
    // Only show available teams in dropdown
    const payload = {
      name: form.name,
      client: form.client,
      team: form.team,
      report: form.report,
    };
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setModalOpen(false);
    fetchProjects();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    fetchProjects();
  };

  return (
    <div className="bg-cream-light min-h-screen p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-brown-primary">Assign Teams</h2>
        <button
          className="bg-brown-primary text-white px-4 py-2 rounded-lg font-semibold"
          onClick={() => setModalOpen(true)}
        >
          + Create Project
        </button>
      </div>
      <div className="bg-cream-primary rounded-lg shadow p-4">
        <table className="w-full text-brown-primary">
          <thead className="bg-cream-light">
            <tr>
              <th className="py-2 px-3 text-left">Project Name</th>
              <th className="py-2 px-3 text-left">Client Name</th>
              <th className="py-2 px-3 text-left">Assigned Team</th>
              <th className="py-2 px-3 text-left">Status</th>
              <th className="py-2 px-3 text-left">Attached Report</th>
              <th className="py-2 px-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project._id} className={project.status === "On Hold" ? "bg-red-50" : ""}>
                <td className="py-2 px-3 font-semibold">{project.name}</td>
                <td className="py-2 px-3">{project.client}</td>
                <td className="py-2 px-3">
                  {project.team || "No Team Assigned"}
                </td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${project.status === "Active" ? "bg-green-100 text-green-primary" : "bg-yellow-100 text-yellow-700"}`}>
                    {project.status}
                  </span>
                </td>
                <td className="py-2 px-3">
                  {project.report ? <a href={project.report} className="text-brown-primary underline">View</a> : "None"}
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
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold text-brown-primary mb-4">Create New Project</h3>
            <div className="mb-3">
              <label className="block text-brown-primary font-semibold mb-1">Project Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="block text-brown-primary font-semibold mb-1">Client</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={form.client}
                onChange={e => setForm({ ...form, client: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="block text-brown-primary font-semibold mb-1">Assigned Team</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.team}
                onChange={e => setForm({ ...form, team: e.target.value })}
              >
                <option value="">No Team Assigned</option>
                {availableTeams.map(team => (
                  <option key={team._id} value={team.name}>{team.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-brown-primary font-semibold mb-1">Inspection Report (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                className="w-full border rounded px-3 py-2"
                onChange={e => setForm({ ...form, report: e.target.files[0] })}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-gray-200 text-brown-primary font-semibold" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-brown-primary text-white font-semibold" onClick={handleCreate}>Create Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
