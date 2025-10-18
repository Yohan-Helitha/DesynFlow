import React, { useState, useEffect } from 'react';
import { FaTasks, FaFilter, FaSearch, FaCalendarAlt, FaClock, FaExclamationTriangle, FaPlay, FaStop, FaEdit, FaPlus, FaEye } from 'react-icons/fa';
import TeamMemberHeader from './TeamMemberHeader';
import TaskDetailsModal from './TaskDetailsModal';

export default function MyTasksTab() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [timeTracking, setTimeTracking] = useState({ active: false, taskId: null, startTime: null });

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    project: 'all',
    dueDate: 'all',
    search: ''
  });

  // Get logged in team member data
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData?.role === "team member") {
      setUser(userData);
      fetchTasksData(userData._id || userData.id);
    } else {
      setError("Access denied. Team member role required.");
      setLoading(false);
    }
  }, []);

  const fetchTasksData = async (userId) => {
    try {
      setLoading(true);
      
      // 1. Find which team this user belongs to
      const teamRes = await fetch(`/api/teams/populated`);
      const teamsData = await teamRes.json();
      const userTeam = teamsData.find(team => 
        team.members && team.members.some(member => {
          const memberId = member.userId?._id || member.userId?.id || member.userId;
          return memberId === userId;
        })
      );

      if (!userTeam) {
        throw new Error("No team found for this user");
      }

      // 2. Get projects assigned to this team
      const projRes = await fetch(`/api/projects`);
      const projectsData = await projRes.json();
      const teamProjects = projectsData.filter(
        p => p.assignedTeamId && (
          p.assignedTeamId._id === userTeam._id || 
          p.assignedTeamId === userTeam._id ||
          p.assignedTeamId.teamId === userTeam._id ||
          p.assignedTeamId.teamId === userTeam.teamId
        )
      );
      setProjects(teamProjects);

      // 3. Get all tasks assigned to this specific user
      const allTasks = [];
      for (const project of teamProjects) {
        try {
          const tasksRes = await fetch(`/api/tasks/project/${project._id}`);
          if (tasksRes.ok) {
            const projectTasks = await tasksRes.json();
            // Filter tasks assigned to this user
            const userTasks = projectTasks.filter(task => {
              const assignedToId = task.assignedTo?._id || task.assignedTo?.id || task.assignedTo;
              return assignedToId === userId;
            });
            allTasks.push(...userTasks.map(task => ({ 
              ...task, 
              projectName: project.projectName,
              projectStatus: project.status 
            })));
          }
        } catch (error) {
          console.warn(`Error fetching tasks for project ${project._id}:`, error);
        }
      }
      setTasks(allTasks);
      setFilteredTasks(allTasks);

      setLoading(false);
    } catch (err) {
      setError("Failed to load tasks: " + err.message);
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...tasks];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(task => 
        task.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.projectName?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Project filter
    if (filters.project !== 'all') {
      filtered = filtered.filter(task => task.projectName === filters.project);
    }

    // Due date filter
    if (filters.dueDate !== 'all') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);

        switch (filters.dueDate) {
          case 'overdue':
            return dueDate < today && task.status !== 'Completed' && task.status !== 'Done';
          case 'today':
            return dueDate.toDateString() === today.toDateString();
          case 'tomorrow':
            return dueDate.toDateString() === tomorrow.toDateString();
          case 'this-week':
            return dueDate >= today && dueDate <= nextWeek;
          default:
            return true;
        }
      });
    }

    setFilteredTasks(filtered);
  }, [tasks, filters]);

  // Update task status
  const updateTaskStatus = async (taskId, status, progressPercentage = null) => {
    try {
      const updateData = { 
        status,
        ...(progressPercentage !== null && { progressPercentage }),
        ...(status === 'Completed' && { completedAt: new Date() })
      };

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        // Update local state
        setTasks(prev => prev.map(task => 
          task._id === taskId 
            ? { ...task, ...updateData }
            : task
        ));
        alert(`Task status updated to ${status}!`);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Error updating task status');
    }
  };

  // Toggle time tracking
  const toggleTimeTracking = (taskId) => {
    if (timeTracking.active && timeTracking.taskId === taskId) {
      // Stop tracking
      setTimeTracking({ active: false, taskId: null, startTime: null });
      alert('Time tracking stopped');
    } else {
      // Start tracking
      setTimeTracking({ active: true, taskId, startTime: new Date() });
      alert('Time tracking started');
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Done': return 'bg-green-100 text-green-800';
  case 'In Progress': return 'bg-cream-light text-brown-primary';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if task is overdue
  const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'Completed' || task.status === 'Done') return false;
    return new Date(task.dueDate) < new Date();
  };

  // Bulk action handlers
  const handleBulkStatusChange = (status) => {
    const selectedTasks = filteredTasks.filter(task => task.selected);
    if (selectedTasks.length === 0) {
      alert('Please select tasks to update');
      return;
    }

    if (confirm(`Update ${selectedTasks.length} tasks to ${status}?`)) {
      selectedTasks.forEach(task => {
        updateTaskStatus(task._id, status, status === 'Completed' ? 100 : null);
      });
    }
  };

  const toggleTaskSelection = (taskId) => {
    setFilteredTasks(prev => prev.map(task => 
      task._id === taskId ? { ...task, selected: !task.selected } : task
    ));
  };

  const toggleSelectAll = () => {
    const allSelected = filteredTasks.every(task => task.selected);
    setFilteredTasks(prev => prev.map(task => ({ ...task, selected: !allSelected })));
  };

  if (loading) return <div className="p-8 text-brown-primary">Loading tasks...</div>;
  if (error) return <div className="p-8 text-red-700">{error}</div>;

  return (
    <div className="bg-cream-light min-h-screen">
      <TeamMemberHeader />
      
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-brown-primary flex items-center gap-2">
            <FaTasks /> My Tasks
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
              className="bg-brown-primary text-white px-4 py-2 rounded-lg hover:bg-brown-secondary flex items-center gap-2"
            >
              <FaCalendarAlt />
              {viewMode === 'list' ? 'Calendar View' : 'List View'}
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
              <FaPlus /> Create Task
            </button>
          </div>
        </div>

        {/* Filters */}
  <div className="bg-cream-light rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-brown-primary" />
            <span className="font-semibold text-brown-primary">Filters</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-primary"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={filters.project}
                onChange={(e) => setFilters({...filters, project: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project._id} value={project.projectName}>
                    {project.projectName}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <select
                value={filters.dueDate}
                onChange={(e) => setFilters({...filters, dueDate: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
              >
                <option value="all">All Dates</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due Today</option>
                <option value="tomorrow">Due Tomorrow</option>
                <option value="this-week">This Week</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {filteredTasks.some(task => task.selected) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {filteredTasks.filter(task => task.selected).length} tasks selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkStatusChange('In Progress')}
                  className="bg-brown-primary text-white px-3 py-1 rounded text-sm hover:bg-brown-primary-300"
                >
                  Start Selected
                </button>
                <button
                  onClick={() => handleBulkStatusChange('Completed')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Complete Selected
                </button>
                <button
                  onClick={() => handleBulkStatusChange('Blocked')}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Block Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-cream-light rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-brown-primary">{filteredTasks.length}</div>
            <div className="text-gray-600">Total Tasks</div>
          </div>
          <div className="bg-cream-light rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredTasks.filter(t => t.status === 'In Progress').length}
            </div>
            <div className="text-gray-600">In Progress</div>
          </div>
          <div className="bg-cream-light rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredTasks.filter(t => t.status === 'Completed' || t.status === 'Done').length}
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredTasks.filter(t => isOverdue(t)).length}
            </div>
            <div className="text-gray-600">Overdue</div>
          </div>
        </div>

        {/* Tasks List */}
  <div className="bg-cream-light rounded-lg shadow-md">
          {/* Table Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={filteredTasks.length > 0 && filteredTasks.every(task => task.selected)}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-brown-primary"
              />
              <span className="font-semibold text-brown-primary">
                {filteredTasks.length} tasks found
              </span>
            </div>
          </div>

          {/* Task Items */}
          <div className="divide-y divide-gray-200">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <div key={task._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={task.selected || false}
                      onChange={() => toggleTaskSelection(task._id)}
                      className="w-4 h-4 text-brown-primary"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-brown-primary cursor-pointer hover:underline"
                            onClick={() => {setSelectedTask(task); setShowTaskModal(true);}}>
                          {task.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {isOverdue(task) && (
                            <FaExclamationTriangle className="text-red-500" title="Overdue" />
                          )}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span><strong>Project:</strong> {task.projectName}</span>
                          <span><strong>Weight:</strong> {task.weight || 0}</span>
                          {task.dueDate && (
                            <span className={isOverdue(task) ? 'text-red-600 font-medium' : ''}>
                              <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <span><strong>Progress:</strong> {task.progressPercentage || 0}%</span>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-500 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleTimeTracking(task._id)}
                          className={`p-1 rounded ${
                            timeTracking.active && timeTracking.taskId === task._id
                              ? 'bg-red-500 text-white'
                              : 'bg-brown-primary text-white'
                          }`}
                          title={timeTracking.active && timeTracking.taskId === task._id ? 'Stop timer' : 'Start timer'}
                        >
                          {timeTracking.active && timeTracking.taskId === task._id ? <FaStop size={12} /> : <FaPlay size={12} />}
                        </button>
                        
                        {task.status !== 'Completed' && task.status !== 'Done' && (
                          <>
                            <button
                              onClick={() => updateTaskStatus(task._id, 'In Progress', 50)}
                              className="bg-brown-primary text-white px-2 py-1 rounded text-xs hover:bg-brown-primary-300"
                            >
                              Start
                            </button>
                            <button
                              onClick={() => updateTaskStatus(task._id, 'Completed', 100)}
                              className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => updateTaskStatus(task._id, 'Blocked')}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                            >
                              Block
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => {setSelectedTask(task); setShowTaskModal(true);}}
                          className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 flex items-center gap-1"
                        >
                          <FaEye size={10} /> Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FaTasks className="mx-auto text-4xl mb-4 opacity-50" />
                <p>No tasks found matching your filters.</p>
                <button className="mt-4 bg-brown-primary text-white px-4 py-2 rounded-lg hover:bg-brown-secondary">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Details Modal - Placeholder for now */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-cream-light rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-brown-primary mb-4">{selectedTask.name}</h2>
              <p className="text-gray-600 mb-4">Task details modal coming next...</p>
              <button
                onClick={() => setShowTaskModal(false)}
                className="bg-brown-primary text-white px-4 py-2 rounded-lg hover:bg-brown-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={selectedTask}
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
        }}
        onTaskUpdate={(updatedTask) => {
          setTasks(prev => prev.map(task => 
            (task._id || task.id) === (updatedTask._id || updatedTask.id) ? updatedTask : task
          ));
          setFilteredTasks(prev => prev.map(task => 
            (task._id || task.id) === (updatedTask._id || updatedTask.id) ? updatedTask : task
          ));
        }}
        timeTracking={timeTracking}
        onToggleTimeTracking={toggleTimeTracking}
      />
    </div>
  );
}
