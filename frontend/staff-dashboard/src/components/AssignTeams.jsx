
import React, { useState } from "react";
import ProjectOverview from "./ProjectOverview";

// Sample data for projects
const sampleProjects = [
  {
    _id: "1",
    projectName: "Modern Living Room Renovation",
    clientName: "John Doe",
    dueDate: "2025-10-15",
    assignedTeam: "Interior Design Team",
    status: "Active",
    progress: 35,
  },
  {
    _id: "2",
    projectName: "Office Space Complete Makeover",
    clientName: "Jane Smith",
    dueDate: "2025-11-01",
    assignedTeam: "Interior Design Team",
    status: "In Progress",
    progress: 70,
  },
  {
    _id: "3",
    projectName: "Luxury Bedroom Suite Design",
    clientName: "Acme Corp",
    dueDate: "2025-12-20",
    assignedTeam: "Project Management Team",
    status: "On Hold",
    progress: 0,
  },
  {
    _id: "4",
    projectName: "Downtown Office Expansion",
    clientName: "XYZ Ltd",
    dueDate: "2026-01-10",
    assignedTeam: "No Team Assigned",
    status: "Pending",
    progress: 0,
  },
];


export default function AssignTeams() {
  const [projects, setProjects] = useState(sampleProjects);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    client: "",
    team: "",
    dueDate: "",
  });
  const [editProjectId, setEditProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Handlers for edit/delete
  const handleEdit = (project) => {
    setModalOpen(true);
    setEditProjectId(project._id);
    setForm({
      name: project.projectName,
      client: project.clientName,
      team: project.assignedTeam,
      dueDate: project.dueDate,
    });
  };
  const handleDelete = (id) => {
    setProjects((prev) => prev.filter((p) => p._id !== id));
  };

  // Handler for create/update
  const handleSave = () => {
    if (!form.name || !form.client || !form.dueDate) return;
    if (editProjectId) {
      setProjects((prev) =>
        prev.map((p) =>
          p._id === editProjectId
            ? {
                ...p,
                projectName: form.name,
                clientName: form.client,
                assignedTeam: form.team,
                dueDate: form.dueDate,
              }
            : p
        )
      );
    } else {
      setProjects((prev) => [
        ...prev,
        {
          _id: Date.now().toString(),
          projectName: form.name,
          clientName: form.client,
          assignedTeam: form.team || "No Team Assigned",
          dueDate: form.dueDate,
          status: "Pending",
          progress: 0,
        },
      ]);
    }
    setModalOpen(false);
    setEditProjectId(null);
    setForm({ name: "", client: "", team: "", dueDate: "" });
  };


  // Handler for view progress (show project overview in main area)
  const handleViewProgress = (project) => {
    setSelectedProject(project);
  };

  // Handler to go back to project list
  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  return (
    <div className="bg-cream-light min-h-screen p-6">
      {selectedProject ? (
        <ProjectOverview project={selectedProject} onBack={handleBackToProjects} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-brown-primary">Assign Teams</h2>
            <button
              className="bg-brown-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90"
              onClick={() => {
                setModalOpen(true);
                setEditProjectId(null);
                setForm({ name: "", client: "", team: "", dueDate: "" });
              }}
            >
              + Create Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-8">
                No projects found. Click "Create Project" to add your first project.
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-cream-primary rounded-lg shadow p-6 flex flex-col justify-between border border-brown-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-brown-primary">
                      {project.projectName}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-bold ml-2 ${
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
                  </div>
                  <div className="mb-2 text-sm text-gray-700">
                    <div><span className="font-semibold">Client:</span> {project.clientName}</div>
                    <div><span className="font-semibold">Due Date:</span> {project.dueDate}</div>
                    <div><span className="font-semibold">Assigned Team:</span> {project.assignedTeam}</div>
                  </div>
                  {project.status === "In Progress" && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="text-gray-600">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-brown-primary h-2.5 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold"
                      onClick={() => handleViewProgress(project)}
                    >
                      View Progress
                    </button>
                    {(project.status === "On Hold" || project.status === "Pending") && (
                      <>
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold"
                          onClick={() => handleEdit(project)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold"
                          onClick={() => handleDelete(project._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 w-full max-w-lg shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-brown-primary">{editProjectId ? "Edit Project" : "Create New Project"}</h3>
                  <button className="text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={() => { setModalOpen(false); setForm({ name: "", client: "", team: "", dueDate: "" }); setEditProjectId(null); }}>&times;</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-brown-primary font-semibold mb-1">Project Name *</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <label className="block text-brown-primary font-semibold mb-1">Client *</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
                      value={form.client}
                      onChange={e => setForm({ ...form, client: e.target.value })}
                      placeholder="Enter client name"
                    />
                  </div>
                  <div>
                    <label className="block text-brown-primary font-semibold mb-1">Assigned Team</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
                      value={form.team}
                      onChange={e => setForm({ ...form, team: e.target.value })}
                      placeholder="Enter team name"
                    />
                  </div>
                  <div>
                    <label className="block text-brown-primary font-semibold mb-1">Due Date *</label>
                    <input
                      type="date"
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
                      value={form.dueDate}
                      onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-8">
                  <button
                    className="px-4 py-2 rounded bg-gray-200 text-brown-primary font-semibold hover:bg-gray-300"
                    onClick={() => {
                      setModalOpen(false);
                      setForm({ name: "", client: "", team: "", dueDate: "" });
                      setEditProjectId(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-brown-primary text-white font-semibold hover:bg-opacity-90"
                    onClick={handleSave}
                    disabled={!form.name || !form.client || !form.dueDate}
                  >
                    {editProjectId ? "Update Project" : "Create Project"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
