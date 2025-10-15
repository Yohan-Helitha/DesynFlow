import React, { useEffect, useState } from 'react';
import { FaUser, FaCalendarAlt, FaClipboardList, FaBolt, FaCheckCircle, FaBan, FaPlus, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Done',
  BLOCKED: 'Blocked'
};

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [project, setProject] = useState(null);
  const [userNames, setUserNames] = useState({}); // Store user names by ID
  
  // Get leader ID from logged-in user
  const getLeaderId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || user._id;
  };
  
  const leaderId = getLeaderId();
  
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    weight: 0,
    status: 'Pending'
  });
  
  const [formErrors, setFormErrors] = useState({});

  // Fetch tasks, team members, and project data
  const fetchTasks = async () => {
    if (!project?._id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/tasks/project/${project._id}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data) ? data : []);
      } else {
        // If API returns error (like 404 for new projects), set empty array
        console.log(`No tasks found for project ${project._id}, this is normal for new projects`);
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Set empty tasks array instead of staying in loading state
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      // Get team data using populated endpoint
      const response = await fetch(`http://localhost:4000/api/teams/populated`);
      if (response.ok) {
        const teamsData = await response.json();
        
        // Find the team where the current user is the leader
        const userTeam = teamsData.find(team => {
          const teamLeaderId = team.leaderId?._id || team.leaderId;
          return teamLeaderId === leaderId;
        });
        
        if (userTeam && userTeam.members) {
          setTeamMembers(userTeam.members);
          
          // Extract user names directly from the populated data
          const names = {};
          userTeam.members.forEach(member => {
            if (member.userId && member.userId._id) {
              const userId = member.userId._id;
              const username = member.userId.username || member.userId.email || 'Unknown User';
              names[userId] = username;
            }
          });
          setUserNames(names);
        } else {
          console.log('No team found for leader ID:', leaderId);
          setTeamMembers([]);
        }
      } else {
        console.log('Failed to fetch teams data');
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
    }
  };

  const fetchUserNames = async (members) => {
    try {
      // Fetch teams data with populated user information
      const response = await fetch('http://localhost:4000/api/teams/populated');
      
      if (!response.ok) {
        throw new Error('Failed to fetch teams data');
      }
      
      const teamsData = await response.json();
      const names = {};
      
      // Extract user data from all teams
      teamsData.forEach(team => {
        if (team.members && Array.isArray(team.members)) {
          team.members.forEach(teamMember => {
            if (teamMember.userId && teamMember.userId._id) {
              const userId = teamMember.userId._id;
              const username = teamMember.userId.username || teamMember.userId.email || 'Unknown User';
              names[userId] = username;
            }
          });
        }
      });
      
      // Set the user names
      setUserNames(names);
    } catch (error) {
      console.error('Error fetching user names:', error);
      // Fallback: create names from member data if available
      const names = {};
      for (const member of members) {
        const userId = typeof member.userId === 'object' ? member.userId._id : member.userId;
        names[userId] = `User ${userId?.slice(-4) || 'Unknown'}`;
      }
      setUserNames(names);
    }
  };

  const fetchProject = async () => {
    console.log('fetchProject called, leaderId:', leaderId);
    
    try {
      // Get team data first using populated endpoint
      const teamRes = await fetch(`http://localhost:4000/api/teams/populated`);
      const teamData = await teamRes.json();
      console.log('All teams:', teamData);
      
      const teamObj = Array.isArray(teamData)
        ? teamData.find(t => {
            const teamLeaderId = t.leaderId?._id || t.leaderId;
            console.log('Checking team:', t.teamName, 'leaderId:', teamLeaderId, 'matches:', teamLeaderId === leaderId);
            return teamLeaderId === leaderId;
          })
        : null;
      
      console.log('Found team for leader:', teamObj);

      if (teamObj) {
        // Get projects for this team
        const projRes = await fetch(`http://localhost:4000/api/projects`);
        const projData = await projRes.json();
        console.log('All projects:', projData);
        
        const teamProjects = projData.filter(
          p => p.assignedTeamId._id === teamObj._id
        );
        
        console.log('Filtered projects for team:', teamProjects);
        
        if (teamProjects.length > 0) {
          setProject(teamProjects[0]); // Use first project
        } else {
          // No projects found for this team
          console.log('No projects found for team');
          setLoading(false);
        }
      } else {
        // No team found for this leader
        console.log('No team found for leader ID:', leaderId);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, []);

  useEffect(() => {
    if (project) {
      fetchTasks();
      fetchTeamMembers();
    }
  }, [project]);

  // Frontend validation functions
  const validateForm = () => {
    const errors = {};
    const today = new Date().toISOString().split('T')[0];

    // Required field validations
    if (!newTask.name.trim()) {
      errors.name = 'Task name is required';
    }

    if (!newTask.assignedTo) {
      errors.assignedTo = 'Please select a team member';
    }

    // Weight validations
    if (newTask.weight < 0) {
      errors.weight = 'Weight cannot be negative';
    }

    if (newTask.weight > 100) {
      errors.weight = 'Weight cannot exceed 100';
    }

    // Due date validations
    if (newTask.dueDate) {
      if (newTask.dueDate < today) {
        errors.dueDate = 'Due date cannot be in the past';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Real-time validation on field change
  const handleFieldChange = (field, value) => {
    setNewTask({ ...newTask, [field]: value });
    
    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: '' });
    }

    // Real-time weight validation
    if (field === 'weight') {
      const numValue = parseInt(value) || 0;
      if (numValue < 0 || numValue > 100) {
        setFormErrors({ 
          ...formErrors, 
          weight: numValue < 0 ? 'Weight cannot be negative' : 'Weight cannot exceed 100' 
        });
      }
    }

    // Real-time due date validation
    if (field === 'dueDate' && value) {
      const today = new Date().toISOString().split('T')[0];
      if (value < today) {
        setFormErrors({ 
          ...formErrors, 
          dueDate: 'Due date cannot be in the past' 
        });
      }
    }
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return newTask.name.trim() && 
           newTask.assignedTo && 
           newTask.weight >= 0 && 
           newTask.weight <= 100 &&
           Object.keys(formErrors).length === 0;
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const response = await fetch(`http://localhost:4000/api/tasks/${task._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          progressPercentage: newStatus === 'Done' ? 100 : newStatus === 'In Progress' ? 50 : 0
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t._id === task._id ? updatedTask : t
          )
        );
      } else {
        alert('Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Error updating task status');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask(task);
    setShowAddModal(true);
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm(`Are you sure you want to delete "${task.name}"?`)) {
      try {
        const response = await fetch(`http://localhost:4000/api/tasks/${task._id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setTasks(prevTasks => prevTasks.filter(t => t._id !== task._id));
        } else {
          alert('Failed to delete task');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task');
      }
    }
  };

  const handleAddTask = async () => {
    if (!project) {
      alert('No project selected');
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      const taskData = {
        ...newTask,
        projectId: project._id
      };

      if (editingTask) {
        // Update existing task
        const response = await fetch(`http://localhost:4000/api/tasks/${editingTask._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });

        if (response.ok) {
          const updatedTask = await response.json();
          setTasks(prevTasks => 
            prevTasks.map(t => 
              t._id === editingTask._id ? updatedTask : t
            )
          );
        } else {
          alert('Failed to update task');
          return;
        }
      } else {
        // Add new task
        const response = await fetch(`http://localhost:4000/api/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });

        if (response.ok) {
          const createdTask = await response.json();
          setTasks(prevTasks => [createdTask, ...prevTasks]);
        } else {
          alert('Failed to create task');
          return;
        }
      }

      // Reset form
      setShowAddModal(false);
      setEditingTask(null);
      setFormErrors({});
      setNewTask({
        name: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        priority: 'medium',
        weight: 0,
        status: 'Pending'
      });
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error saving task');
    }
  };

  const getMemberName = (assignedToId) => {
    const member = teamMembers.find(m => {
      const userId = typeof m.userId === 'object' ? m.userId._id : m.userId;
      return userId === assignedToId;
    });
    
    const displayName = userNames[assignedToId] || `User ${assignedToId?.slice(-4) || 'Unknown'}`;
    const role = member ? member.role || 'Member' : 'Member';
    
    return `${displayName} (${role})`;
  };

  const renderTaskCard = (task, status) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow" key={task._id}>
      <div className="font-semibold text-gray-800 text-base mb-1">{task.name}</div>
      {task.description && (
        <div className="text-gray-600 text-sm mb-2">{task.description}</div>
      )}
      <div className="text-amber-600 text-sm mb-3">{project?.projectName}</div>
      <div className="flex justify-between items-center text-xs text-gray-600 mb-3">
        <span className="flex items-center">
          <FaUser className="mr-1" />
          {getMemberName(task.assignedTo)}
        </span>
        {task.dueDate && (
          <span className="flex items-center">
            <FaCalendarAlt className="mr-1" />
            Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className={`inline-block px-2 py-1 text-xs rounded-md ${
          task.priority === 'high' 
            ? 'bg-red-brown text-white' 
            : task.priority === 'medium' 
              ? 'bg-brown-primary-300 text-white' 
              : 'bg-green-primary text-white'
        }`}>
          {task.priority}
        </div>
        {task.weight > 0 && (
          <div className="inline-block px-2 py-1 text-xs rounded-md bg-brown-primary-300 text-white">
            Weight: {task.weight}
          </div>
        )}
        {task.progressPercentage > 0 && (
          <div className="inline-block px-2 py-1 text-xs rounded-md bg-cream-primary text-dark-brown">
            {task.progressPercentage}%
          </div>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        {status === STATUS.PENDING && (
          <>
            <button 
              className="bg-bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-xs transition-colors"
              onClick={() => handleStatusChange(task, STATUS.IN_PROGRESS)}
            >
              Start
            </button>
            <button 
              className="bg-brown-primary hover:bg-brown-secondary text-white px-3 py-1 rounded text-xs transition-colors"
              onClick={() => handleEditTask(task)}
            >
              Edit
            </button>
            <button 
              className="bg-red-brown hover:bg-red-brown-600 text-white px-3 py-1 rounded text-xs transition-colors"
              onClick={() => handleDeleteTask(task)}
            >
              Delete
            </button>
          </>
        )}
        {status === STATUS.IN_PROGRESS && (
          <>
            <button 
              className="bg-soft-green hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors"
              onClick={() => handleStatusChange(task, STATUS.COMPLETED)}
            >
              Complete
            </button>
            <button 
              className="bg-warm-brown hover:bg-warm-brown-600 text-white px-3 py-1 rounded text-xs transition-colors"
              onClick={() => handleStatusChange(task, STATUS.BLOCKED)}
            >
              Block
            </button>
          </>
        )}
        {status === STATUS.COMPLETED && (
          <button 
            className="bg-warm-brown hover:bg-warm-brown-600 text-white px-3 py-1 rounded text-xs transition-colors"
            onClick={() => handleStatusChange(task, STATUS.PENDING)}
          >
            Reopen
          </button>
        )}
        {status === STATUS.BLOCKED && (
          <button 
            className="bg-warm-brown hover:bg-warm-brown-600 text-white px-3 py-1 rounded text-xs transition-colors"
            onClick={() => handleStatusChange(task, STATUS.IN_PROGRESS)}
          >
            Unblock
          </button>
        )}
      </div>
    </div>
  );

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  if (loading) return <div className="p-8 text-amber-600">Loading tasks...</div>;

  if (!project) {
    return (
      <div className="p-8 text-center">
        <FaClipboardList className="mx-auto mb-4 text-4xl text-gray-400" />
        <h3 className="text-lg font-semibold text-brown-primary mb-2">No Project Assigned</h3>
        <p className="text-gray-600">
          Your team doesn't have any projects assigned yet. Contact your project manager to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-cream-primary min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brown-primary">Task Management</h2>
        <div className="flex gap-3">
          <button 
            className="bg-brown-primary hover:bg-brown-secondary text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Add Task
          </button>
        </div>
      </div>

      {/* Show helpful message when no tasks exist */}
      {tasks.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="text-center">
            <FaClipboardList className="mx-auto mb-3 text-4xl text-blue-400" />
            <h3 className="text-lg font-semibold text-brown-primary mb-2">No Tasks Yet</h3>
            <p className="text-gray-600 mb-4">
              This is a new project! Start by creating your first task to organize and track your team's work.
            </p>
            <button 
              className="bg-brown-primary hover:bg-brown-secondary text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus /> Create Your First Task
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-amber-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-brown-primary flex items-center gap-2">
              <FaClipboardList /> Pending
            </span>
            <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded-full text-sm font-medium">
              {getTasksByStatus(STATUS.PENDING).length}
            </span>
          </div>
          <div className="space-y-3">
            {getTasksByStatus(STATUS.PENDING).length > 0 ? (
              getTasksByStatus(STATUS.PENDING).map((task) => renderTaskCard(task, STATUS.PENDING))
            ) : (
              <div className="text-gray-500 text-sm text-center py-8">
                <FaClipboardList className="mx-auto mb-2 text-2xl opacity-50" />
                No pending tasks
              </div>
            )}
          </div>
        </div>

  <div className="bg-cream-light rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-brown-primary flex items-center gap-2">
              <FaBolt /> In Progress
            </span>
            <span className="bg-brown-primary-300 text-white px-2 py-1 rounded-full text-sm font-medium">
              {getTasksByStatus(STATUS.IN_PROGRESS).length}
            </span>
          </div>
          <div className="space-y-3">
            {getTasksByStatus(STATUS.IN_PROGRESS).length > 0 ? (
              getTasksByStatus(STATUS.IN_PROGRESS).map((task) => renderTaskCard(task, STATUS.IN_PROGRESS))
            ) : (
              <div className="text-gray-500 text-sm text-center py-8">
                <FaBolt className="mx-auto mb-2 text-2xl opacity-50" />
                No tasks in progress
              </div>
            )}
          </div>
        </div>

  <div className="bg-cream-primary rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-brown-primary flex items-center gap-2">
              <FaCheckCircle /> Completed
            </span>
            <span className="bg-green-primary text-white px-2 py-1 rounded-full text-sm font-medium">
              {getTasksByStatus(STATUS.COMPLETED).length}
            </span>
          </div>
          <div className="space-y-3">
            {getTasksByStatus(STATUS.COMPLETED).length > 0 ? (
              getTasksByStatus(STATUS.COMPLETED).map((task) => renderTaskCard(task, STATUS.COMPLETED))
            ) : (
              <div className="text-gray-500 text-sm text-center py-8">
                <FaCheckCircle className="mx-auto mb-2 text-2xl opacity-50" />
                No completed tasks
              </div>
            )}
          </div>
        </div>

  <div className="bg-cream-light rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-brown-primary flex items-center gap-2">
              <FaBan /> Blocked
            </span>
            <span className="bg-red-brown text-white px-2 py-1 rounded-full text-sm font-medium">
              {getTasksByStatus(STATUS.BLOCKED).length}
            </span>
          </div>
          <div className="space-y-3">
            {getTasksByStatus(STATUS.BLOCKED).length > 0 ? (
              getTasksByStatus(STATUS.BLOCKED).map((task) => renderTaskCard(task, STATUS.BLOCKED))
            ) : (
              <div className="text-gray-500 text-sm text-center py-8">
                <FaBan className="mx-auto mb-2 text-2xl opacity-50" />
                No blocked tasks
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-brown-primary">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button 
                className="text-gray-500 hover:text-gray-700 text-xl"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTask(null);
                  setNewTask({
                    name: '',
                    description: '',
                    assignedTo: '',
                    dueDate: '',
                    priority: 'medium',
                    weight: 0,
                    status: 'Pending'
                  });
                }}
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Name *</label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Enter task name"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brown-primary ${
                    formErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Enter task description"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <input
                  type="text"
                  value={project?.projectName || 'Loading...'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To Team Member *</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => handleFieldChange('assignedTo', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brown-primary ${
                    formErrors.assignedTo ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select team member</option>
                  {teamMembers.map((member) => {
                    const userId = typeof member.userId === 'object' ? member.userId._id : member.userId;
                    const displayName = userNames[userId] || `User ${userId?.slice(-4) || 'Unknown'}`;
                    
                    return (
                      <option 
                        key={userId} 
                        value={userId}
                        disabled={member.availability === 'On Leave'}
                        className={member.availability === 'On Leave' ? 'text-gray-400' : ''}
                      >
                        {displayName} ({member.role || 'Member'}) - {member.availability}
                        {member.availability === 'On Leave' && ' (Unavailable)'}
                      </option>
                    );
                  })}
                </select>
                {formErrors.assignedTo && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.assignedTo}</p>
                )}
                {newTask.assignedTo && teamMembers.find(m => {
                  const userId = typeof m.userId === 'object' ? m.userId._id : m.userId;
                  return userId === newTask.assignedTo;
                })?.availability === 'Busy' && (
                  <p className="text-amber-600 text-xs mt-1"><FaExclamationTriangle className="inline mr-1" /> This team member is currently busy</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight/Points (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newTask.weight}
                  onChange={(e) => handleFieldChange('weight', e.target.value)}
                  placeholder="Task weight (0-100)"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brown-primary ${
                    formErrors.weight ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {formErrors.weight && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.weight}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">Enter a value between 0 and 100</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                  // lock dates before today and start day of project
                  min={(() => {
                    const today = new Date().toISOString().split('T')[0];
                    const projectStart = project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : today;
                    return projectStart > today ? projectStart : today;
                  })()}
                  //lock after dates after project due date
                  max={project?.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : undefined}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brown-primary ${
                    formErrors.dueDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {formErrors.dueDate && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.dueDate}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">Due date cannot be in the past</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => handleFieldChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-primary"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button 
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setNewTask({
                    name: '',
                    description: '',
                    assignedTo: '',
                    dueDate: '',
                    priority: 'medium',
                    weight: 0,
                    status: 'Pending'
                  });
                  setFormErrors({});
                  setShowAddModal(false);
                  setEditingTask(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-brown-primary hover:bg-brown-secondary text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddTask}
                disabled={!isFormValid()}
                title={!isFormValid() ? 'Please fix validation errors before submitting' : ''}
              >
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
