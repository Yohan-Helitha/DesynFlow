import React, { useState, useEffect } from 'react';
import { FaTasks, FaCheckCircle, FaClock, FaCalendarAlt, FaChartLine, FaProjectDiagram, FaPlay, FaStop } from 'react-icons/fa';
import TeamMemberHeader from './TeamMemberHeader';
import ProgressBar from './ProgressBar';

export default function TeamDashboardOverview() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeTracking, setTimeTracking] = useState({ active: false, taskId: null, startTime: null });

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Get logged in team member data
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData?.role === "team member") {
      setUser(userData);
      fetchDashboardData(userData._id || userData.id);
    } else {
      setError("Access denied. Team member role required.");
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async (userId) => {
    try {
      setLoading(true);
      
      // 1. Find which team this user belongs to
      const teamRes = await fetch(`/api/teams/populated`);
      const teamsData = await teamRes.json();
      const userTeam = teamsData.find(team => 
        team.members && team.members.some(member => {
          const memberId = member.userId?._id || member.userId?.id || member.userId;
          const userIdToCheck = userId;
          return memberId === userIdToCheck;
        })
      );

      if (!userTeam) {
        throw new Error("No team found for this user");
      }
      setTeam(userTeam);

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

      // 3. Get tasks assigned to this specific user
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
            allTasks.push(...userTasks.map(task => ({ ...task, projectName: project.projectName })));
          }
        } catch (error) {
          console.warn(`Error fetching tasks for project ${project._id}:`, error);
        }
      }
      setTasks(allTasks);

      setLoading(false);
    } catch (err) {
      setError("Failed to load dashboard: " + err.message);
      setLoading(false);
    }
  };

  // Calculate dashboard metrics
  const getDashboardMetrics = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Completed' || task.status === 'Done').length;
    const pendingTasks = tasks.filter(task => task.status === 'Pending').length;
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
    const blockedTasks = tasks.filter(task => task.status === 'Blocked').length;
    
    // Today's priorities (tasks due today or overdue)
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const todayPriorities = tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate <= today && task.status !== 'Done' && task.status !== 'Completed';
    });

    // Performance metrics
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      blockedTasks,
      todayPriorities,
      completionRate
    };
  };

  // Calculate project progress for user's tasks
  const calculateUserProjectProgress = (project) => {
    const projectTasks = tasks.filter(task => {
      const taskProjectId = task.projectId?._id || task.projectId?.id || task.projectId;
      const projectId = project._id || project.id;
      return taskProjectId === projectId;
    });
    
    if (projectTasks.length === 0) return 0;
    
    const totalWeight = projectTasks.reduce((sum, task) => sum + (task.weight || 0), 0);
    const completedWeight = projectTasks
      .filter(task => task.status === 'Done' || task.status === 'Completed')
      .reduce((sum, task) => sum + (task.weight || 0), 0);
    
    return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  };

  // Quick actions
  const markTaskComplete = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'Completed',
          progressPercentage: 100,
          completedAt: new Date()
        })
      });

      if (response.ok) {
        // Update local state
        setTasks(prev => prev.map(task => 
          task._id === taskId 
            ? { ...task, status: 'Completed', progressPercentage: 100, completedAt: new Date() }
            : task
        ));
        alert('Task marked as complete!');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Error completing task');
    }
  };

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

  if (loading) return <div className="p-8 text-brown-primary">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-red-700">{error}</div>;

  const metrics = getDashboardMetrics();

  return (
    <div className="bg-cream-light min-h-screen">
      <TeamMemberHeader onLogout={handleLogout} />
      
      <div className="p-8 space-y-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-brown-primary mb-2">
            Welcome back, {user?.username || 'Team Member'}!
          </h1>
          <p className="text-gray-600">
            Team: {team?.teamName || 'No team assigned'} | 
            Active Projects: {projects.length} | 
            Your Tasks: {metrics.totalTasks}
          </p>
        </div>

        {/* Personal Task Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Tasks</p>
                <p className="text-2xl font-bold text-brown-primary">{metrics.totalTasks}</p>
              </div>
              <FaTasks className="text-3xl text-brown-primary opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-600">{metrics.completedTasks}</p>
              </div>
              <FaCheckCircle className="text-3xl text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.inProgressTasks}</p>
              </div>
              <FaClock className="text-3xl text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.completionRate}%</p>
              </div>
              <FaChartLine className="text-3xl text-purple-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Today's Priorities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-brown-primary mb-4 flex items-center gap-2">
            <FaCalendarAlt /> Today's Priorities
          </h3>
          {metrics.todayPriorities.length > 0 ? (
            <div className="space-y-3">
              {metrics.todayPriorities.slice(0, 5).map(task => (
                <div key={task._id} className="flex items-center justify-between bg-cream-light rounded-lg p-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-brown-primary">{task.name}</h4>
                    <p className="text-sm text-gray-600">
                      {task.projectName} • Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority} priority
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleTimeTracking(task._id)}
                      className={`p-2 rounded-full ${
                        timeTracking.active && timeTracking.taskId === task._id
                          ? 'bg-red-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}
                      title={timeTracking.active && timeTracking.taskId === task._id ? 'Stop timer' : 'Start timer'}
                    >
                      {timeTracking.active && timeTracking.taskId === task._id ? <FaStop size={12} /> : <FaPlay size={12} />}
                    </button>
                    <button
                      onClick={() => markTaskComplete(task._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No urgent tasks for today. Great job!</p>
          )}
        </div>

        {/* Project Overview Cards */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-brown-primary mb-4 flex items-center gap-2">
            <FaProjectDiagram /> My Projects
          </h3>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => {
                const userProgress = calculateUserProjectProgress(project);
                const userTasksCount = tasks.filter(task => {
                  const taskProjectId = task.projectId?._id || task.projectId?.id || task.projectId;
                  const projectId = project._id || project.id;
                  return taskProjectId === projectId;
                }).length;
                
                return (
                  <div key={project._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-brown-primary">{project.projectName}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        project.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : project.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : project.status === "Completed"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Your Tasks:</span> {userTasksCount}</p>
                      <p><span className="font-medium">Due Date:</span> {
                        project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'
                      }</p>
                    </div>

                    {userProgress > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Your Progress</span>
                          <span className="text-gray-600">{userProgress}%</span>
                        </div>
                        <ProgressBar progress={userProgress} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No projects assigned to your team.</p>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-brown-primary mb-4">Performance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{metrics.completionRate}%</div>
              <div className="text-gray-600">Task Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{metrics.inProgressTasks}</div>
              <div className="text-gray-600">Active Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{metrics.todayPriorities.length}</div>
              <div className="text-gray-600">Due Today</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
