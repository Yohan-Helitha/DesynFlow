import React, { useEffect, useState } from 'react';
import { FaUser, FaCalendarAlt, FaClipboardList, FaBolt, FaCheckCircle, FaBan, FaFilter, FaPlus, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

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
  const leaderId = "68d638d66e8afdd7536b87f8";
  
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
    if (!project?._id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/tasks/project/${project._id}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/team-members/${leaderId}`);
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.members || []);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchProject = async () => {
    try {
      // Get team data first
      const teamRes = await fetch(`http://localhost:4000/api/teams`);
      const teamData = await teamRes.json();
      const teamObj = Array.isArray(teamData)
        ? teamData.find(t => t.leaderId === leaderId || t.leaderId._id === leaderId)
        : null;

      if (teamObj) {
        // Get projects for this team
        const projRes = await fetch(`http://localhost:4000/api/projects`);
        const projData = await projRes.json();
        const teamProjects = projData.filter(
          p => p.assignedTeamId._id === teamObj._id
        );
        
        if (teamProjects.length > 0) {
          setProject(teamProjects[0]); // Use first project
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error);
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
    const member = teamMembers.find(m => m.userId === assignedToId);
    return member ? `${member.userId} (${member.role || 'Member'})` : assignedToId;
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
            ? 'bg-red-100 text-red-800' 
            : task.priority === 'medium' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
        }`}>
          {task.priority}
        </div>
        {task.weight > 0 && (
          <div className="inline-block px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-800">
            Weight: {task.weight}
          </div>
        )}
        {task.progressPercentage > 0 && (
          <div className="inline-block px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-800">
            {task.progressPercentage}%
          </div>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        {status === STATUS.PENDING && (
          <>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
              onClick={() => handleStatusChange(task, STATUS.IN_PROGRESS)}
            >
              Start
            </button>
            <button 
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs transition-colors"
              onClick={() => handleEditTask(task)}
            >
              Edit
            </button>
            <button 
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
              onClick={() => handleDeleteTask(task)}
            >
              Delete
            </button>
          </>
        )}
        {status === STATUS.IN_PROGRESS && (
          <>
            <button 
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors"
              onClick={() => handleStatusChange(task, STATUS.COMPLETED)}
            >
              Complete
            </button>
            <button 
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
              onClick={() => handleStatusChange(task, STATUS.BLOCKED)}
            >
              Block
            </button>
          </>
        )}
        {status === STATUS.COMPLETED && (
          <button 
            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-xs transition-colors"
            onClick={() => handleStatusChange(task, STATUS.PENDING)}
          >
            Reopen
          </button>
        )}
        {status === STATUS.BLOCKED && (
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
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
    return <div className="p-8 text-gray-500">No project selected</div>;
  }

  return (
    <div className="p-6 bg-cream-primary min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brown-primary">Task Management</h2>
        <div className="flex gap-3">
          <button className="bg-white hover:bg-gray-50 text-brown-primary px-4 py-2 rounded-lg border border-brown-light transition-colors flex items-center gap-2">
            <FaFilter /> Filter
          </button>
          <button 
            className="bg-brown-primary hover:bg-brown-secondary text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Add Task
          </button>
        </div>
      </div>

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
            {getTasksByStatus(STATUS.PENDING).map((task) => renderTaskCard(task, STATUS.PENDING))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-brown-primary flex items-center gap-2">
              <FaBolt /> In Progress
            </span>
            <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
              {getTasksByStatus(STATUS.IN_PROGRESS).length}
            </span>
          </div>
          <div className="space-y-3">
            {getTasksByStatus(STATUS.IN_PROGRESS).map((task) => renderTaskCard(task, STATUS.IN_PROGRESS))}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-brown-primary flex items-center gap-2">
              <FaCheckCircle /> Completed
            </span>
            <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
              {getTasksByStatus(STATUS.COMPLETED).length}
            </span>
          </div>
          <div className="space-y-3">
            {getTasksByStatus(STATUS.COMPLETED).map((task) => renderTaskCard(task, STATUS.COMPLETED))}
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-brown-primary flex items-center gap-2">
              <FaBan /> Blocked
            </span>
            <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
              {getTasksByStatus(STATUS.BLOCKED).length}
            </span>
          </div>
          <div className="space-y-3">
            {getTasksByStatus(STATUS.BLOCKED).map((task) => renderTaskCard(task, STATUS.BLOCKED))}
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
                  {teamMembers.map((member) => (
                    <option 
                      key={member.userId} 
                      value={member.userId}
                      disabled={member.availability === 'On Leave'}
                      className={member.availability === 'On Leave' ? 'text-gray-400' : ''}
                    >
                      {member.userId} ({member.role || 'Member'}) - {member.availability}
                      {member.availability === 'On Leave' && ' (Unavailable)'}
                    </option>
                  ))}
                </select>
                {formErrors.assignedTo && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.assignedTo}</p>
                )}
                {newTask.assignedTo && teamMembers.find(m => m.userId === newTask.assignedTo)?.availability === 'Busy' && (
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
                  min={new Date().toISOString().split('T')[0]} // Disable past dates
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
