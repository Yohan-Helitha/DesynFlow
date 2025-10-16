
import React, { useState, useEffect } from "react";
import ProjectOverview from "./ProjectOverview";

export default function AssignTeams() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    client: "",
    team: "",
    teamId: "",
    dueDate: "",
    startDate: "",
    inspectionReport: null,
  });
  const [teams, setTeams] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamError, setTeamError] = useState(null);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [editProjectId, setEditProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Fetch all teams
  useEffect(() => {
    async function fetchTeams() {
      try {
        setTeamLoading(true);
        setTeamError(null);
        const res = await fetch("http://localhost:4000/api/teams");
        if (!res.ok) throw new Error("Failed to fetch teams");
        const data = await res.json();
        setTeams(data.filter(t => t.active));
      } catch (err) {
        setTeamError(err.message);
      } finally {
        setTeamLoading(false);
      }
    }
    fetchTeams();
  }, []);

  // Filter available teams (exclude teams already assigned to active projects)
  useEffect(() => {
    if (teams.length > 0 && projects.length >= 0) {
      const assignedTeamIds = projects
        .filter(project => 
          project.assignedTeamId && 
          project.status === 'Active' && 
          project._id !== editProjectId // Allow current project's team to be selectable when editing
        )
        .map(project => project.assignedTeamId._id || project.assignedTeamId);
      
      console.log('Assigned team IDs (Active projects):', assignedTeamIds);
      const available = teams.filter(team => !assignedTeamIds.includes(team._id));
      console.log('Available teams:', available.map(t => t.teamName));
      setAvailableTeams(available);
    }
  }, [teams, projects, editProjectId]);

  // Fetch projects from backend
  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:4000/api/projects");
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        console.log('Fetched projects:', data);
        // Ensure data is always an array
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // Handlers for edit/delete
  const handleEdit = (project) => {
    setModalOpen(true);
    setEditProjectId(project._id);
    
    // Format dates for input fields (YYYY-MM-DD format)
    const formatDateForInput = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };

    setForm({
      name: project.projectName || "",
      client: typeof project.clientId === 'object' && project.clientId?.email 
        ? project.clientId.email 
        : typeof project.clientId === 'string' 
        ? project.clientId 
        : "",
      team: project.assignedTeamId?.teamName || "",
      teamId: project.assignedTeamId?._id || project.assignedTeamId || "",
      dueDate: formatDateForInput(project.dueDate),
      startDate: formatDateForInput(project.startDate),
      inspectionReport: null, // Can't pre-populate file input for security reasons
    });
  };
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:4000/api/projects/${id}`, {
        method: "DELETE"
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete project");
      }
      
      // Remove from local state
      setProjects((prev) => prev.filter((p) => p._id !== id));
      alert("Project deleted successfully!");
    } catch (error) {
      console.error('Delete error:', error);
      alert("Error deleting project: " + error.message);
    }
  };

  // Handler for create/update
  const handleSave = async () => {
    // Client-side validation
    const isEditing = !!editProjectId;
    const existingProject = isEditing ? projects.find(p => p._id === editProjectId) : null;
    const hasExistingReport = existingProject?.attachments?.length > 0;
    
    if (!form.name || !form.client || !form.startDate || !form.dueDate || 
        (!isEditing && !form.inspectionReport) || // For new projects, inspection report is required
        (!hasExistingReport && !form.inspectionReport)) { // For existing projects without report, new one is required
      alert("Please fill in all required fields. Team assignment is optional - projects without teams will be set to 'On Hold'.");
      return;
    }

    // Date validation
    const startDate = new Date(form.startDate);
    const dueDate = new Date(form.dueDate);
    if (dueDate < startDate) {
      alert("Due date cannot be earlier than start date.");
      return;
    }

    try {
      let inspectionReportPath = "";
      let inspectionReportOriginalName = "";

      // Upload inspection report if provided
      if (form.inspectionReport) {
        const formData = new FormData();
        formData.append('file', form.inspectionReport);

        const uploadRes = await fetch("http://localhost:4000/api/upload", {
          method: "POST",
          body: formData
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || "Failed to upload inspection report");
        }

        const uploadData = await uploadRes.json();
        console.log('Upload response:', uploadData);
        if (uploadData.message === 'File uploaded successfully' || uploadData.success) {
          inspectionReportPath = uploadData.path;
          inspectionReportOriginalName = uploadData.originalName;
        } else {
          console.error('Upload failed - response:', uploadData);
          throw new Error("Upload failed");
        }
      }

      // Create project data
      const projectData = {
        projectName: form.name,
        clientId: form.client,
        startDate: form.startDate,
        dueDate: form.dueDate,
        inspectionReportPath,
        inspectionReportOriginalName
      };

      // Only add assignedTeamId if a team is selected
      if (form.teamId) {
        projectData.assignedTeamId = form.teamId;
      }

      if (editProjectId) {
        // Update existing project
        const res = await fetch(`http://localhost:4000/api/projects/${editProjectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectData)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.errors ? errorData.errors.join(", ") : "Failed to update project");
        }

        const updatedProject = await res.json();
        setProjects(prev => prev.map(p => p._id === editProjectId ? updatedProject : p));
        alert("Project updated successfully!");
        
        // Auto refresh to get populated data
        setTimeout(async () => {
          try {
            const refreshRes = await fetch("http://localhost:4000/api/projects");
            if (refreshRes.ok) {
              const refreshedData = await refreshRes.json();
              setProjects(Array.isArray(refreshedData) ? refreshedData : []);
            }
          } catch (error) {
            console.error('Auto-refresh failed:', error);
          }
        }, 500);
      } else {
        // Create new project
        const res = await fetch("http://localhost:4000/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectData)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.errors ? errorData.errors.join(", ") : "Failed to create project");
        }

        const newProject = await res.json();
        setProjects(prev => [...prev, newProject]);
        alert("Project created successfully!");
        
        // Auto refresh to get populated data
        setTimeout(async () => {
          try {
            const refreshRes = await fetch("http://localhost:4000/api/projects");
            if (refreshRes.ok) {
              const refreshedData = await refreshRes.json();
              setProjects(Array.isArray(refreshedData) ? refreshedData : []);
            }
          } catch (error) {
            console.error('Auto-refresh failed:', error);
          }
        }, 500);
      }

      // Reset form and close modal
      setModalOpen(false);
      setEditProjectId(null);
      setForm({ 
        name: "", 
        client: "", 
        team: "", 
        teamId: "", 
        dueDate: "", 
        startDate: "", 
        inspectionReport: null 
      });
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };


  // Handler for view progress (show project overview in main area)
  const handleViewProgress = (project) => {
    setSelectedProject(project._id);
  };

  // Handler to go back to project list
  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading projects...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="bg-cream-light min-h-screen p-6">
      {selectedProject ? (
        <ProjectOverview projectId={selectedProject} onBack={handleBackToProjects} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-brown-primary">Assign Teams</h2>
            <button
              className="bg-brown-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90"
              onClick={() => {
                setModalOpen(true);
                setEditProjectId(null);
                setForm({ 
                  name: "", 
                  client: "", 
                  team: "", 
                  teamId: "", 
                  dueDate: "", 
                  startDate: "", 
                  inspectionReport: null 
                });
              }}
            >
              + Create Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!Array.isArray(projects) || projects.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-8">
                No projects found. Click "Create Project" to add your first project.
              </div>
            ) : (
              projects.filter(project => project && project._id).map((project) => (
                <div
                  key={project._id}
                  className="bg-cream-primary rounded-lg shadow p-6 flex flex-col justify-between border border-brown-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-brown-primary">
                      {project.projectName || "Unnamed Project"}
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
                      {project.status || "Unknown"}
                    </span>
                  </div>
                  <div className="mb-2 text-sm text-gray-700 leading-[1.8]">
                    <div><span className="font-semibold">Client:</span> {
                      typeof project.clientId === 'object' && project.clientId?.email 
                        ? project.clientId.email 
                        : typeof project.clientId === 'object' && project.clientId?.username
                        ? project.clientId.username
                        : typeof project.clientId === 'string' 
                        ? project.clientId 
                        : "N/A"
                    }</div>
                    <div><span className="font-semibold">Start Date:</span> {project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"}</div>
                    <div><span className="font-semibold">Due Date:</span> {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : "N/A"}</div>
                    <div><span className="font-semibold">Assigned Team:</span> {project.assignedTeamId?.teamName || "No Team Assigned"}</div>
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
                      className="bg-green-primary hover:bg-green-primary-300 text-white px-3 py-1 rounded text-xs font-semibold"
                      onClick={() => handleViewProgress(project)}
                    >
                      View Progress
                    </button>
                    <div className="flex gap-2 ml-auto">
                      <button
                        className="bg-brown-primary-300 hover:bg-brown-primary-200 text-white px-3 py-1 rounded text-xs font-semibold"
                        onClick={() => handleEdit(project)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-brown-primary hover:bg-brown-primary-300 text-white px-3 py-1 rounded text-xs font-semibold"
                        onClick={() => handleDelete(project._id)}
                      >
                        Delete
                      </button>
                    </div>
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
                  <button className="text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={() => { setModalOpen(false); setForm({ name: "", client: "", team: "", teamId: "", dueDate: "", startDate: "", inspectionReport: null }); setEditProjectId(null); }}>&times;</button>
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
                    <label className="block text-brown-primary font-semibold mb-1">Client Email *</label>
                    <input
                      type="email"
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
                      value={form.client}
                      onChange={e => setForm({ ...form, client: e.target.value })}
                      placeholder="Enter client email address"
                    />
                  </div>
                  <div>
                    <label className="block text-brown-primary font-semibold mb-1">Assigned Team (Optional)</label>
                    {teamLoading ? (
                      <div className="text-xs text-gray-500">Loading teams...</div>
                    ) : teamError ? (
                      <div className="text-xs text-red-500">{teamError}</div>
                    ) : (
                      <select
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
                        value={form.teamId}
                        onChange={e => {
                          const selectedTeam = availableTeams.find(team => team._id === e.target.value);
                          setForm({ 
                            ...form, 
                            teamId: e.target.value,
                            team: selectedTeam ? selectedTeam.teamName : ""
                          });
                        }}
                      >
                        <option value="">Select a team (or leave unassigned)</option>
                        {availableTeams.map(team => (
                          <option key={team._id} value={team._id} data-name={team.teamName}>
                            {team.teamName}
                          </option>
                        ))}
                        {availableTeams.length === 0 && !teamLoading && (
                          <option disabled>No available teams</option>
                        )}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-brown-primary font-semibold mb-1">Start Date *</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
                      value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-brown-primary font-semibold mb-1">Due Date *</label>
                    <input
                      type="date"
                      min={form.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
                      value={form.dueDate}
                      onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-brown-primary font-semibold mb-1">Inspection Report (PDF) *</label>
                    {editProjectId && projects.find(p => p._id === editProjectId)?.attachments?.length > 0 && (
                      <div className="mb-2 p-2 bg-blue-50 rounded border">
                        <div className="text-sm text-blue-700 font-medium">Current file:</div>
                        {projects.find(p => p._id === editProjectId)?.attachments?.map((attachment, i) => (
                          <div key={i} className="text-xs text-blue-600 mt-1">
                            📄 {attachment.originalName || attachment.filename || 'Inspection Report'}
                            <a 
                              href={`http://localhost:4000${attachment.path}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-2 underline hover:text-blue-800"
                            >
                              View
                            </a>
                          </div>
                        ))}
                        <div className="text-xs text-gray-600 mt-1">Upload a new file to replace the current one</div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="application/pdf"
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
                      onChange={e => {
                        const file = e.target.files[0];
                        setForm({ ...form, inspectionReport: file });
                      }}
                    />
                    {form.inspectionReport && (
                      <div className="text-xs text-green-700 mt-1">Selected: {form.inspectionReport.name}</div>
                    )}
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
                    disabled={(() => {
                      const isEditing = !!editProjectId;
                      const existingProject = isEditing ? projects.find(p => p._id === editProjectId) : null;
                      const hasExistingReport = existingProject?.attachments?.length > 0;
                      
                      return !form.name ||
                        !form.client ||
                        !form.startDate ||
                        !form.dueDate ||
                        (!isEditing && !form.inspectionReport) || // New project needs report
                        (!hasExistingReport && !form.inspectionReport) || // Existing project without report needs new one
                        (form.inspectionReport && form.inspectionReport.type !== "application/pdf");
                    })()}
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
