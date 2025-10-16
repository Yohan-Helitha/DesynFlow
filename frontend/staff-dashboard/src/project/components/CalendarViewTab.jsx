import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus, FaCalendarAlt, FaTasks, FaClock, FaFlag, FaUser, FaEye } from 'react-icons/fa';
import TeamMemberHeader from './TeamMemberHeader';
import TaskDetailsModal from './TaskDetailsModal';

export default function CalendarViewTab() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week'
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData?.role === "team member") {
      setUser(userData);
      fetchUserTasks(userData._id || userData.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserTasks = async (userId) => {
    try {
      setLoading(true);
      
      // Get user's team
      const teamResponse = await fetch(`http://localhost:4000/api/teams`);
      const teams = await teamResponse.json();
      
      const userTeam = teams.find(team => 
        team.members.some(member => 
          (member.userId._id || member.userId) === userId
        )
      );

      if (userTeam) {
        // Get tasks for team members
        const tasksResponse = await fetch(`http://localhost:4000/api/tasks`);
        const allTasks = await tasksResponse.json();
        
        // Filter tasks assigned to current user
        const userTasks = allTasks.filter(task => 
          (task.assignedTo._id || task.assignedTo) === userId
        );

        // Populate project names
        const projectsResponse = await fetch(`http://localhost:4000/api/projects`);
        const projects = await projectsResponse.json();
        
        const tasksWithProjects = userTasks.map(task => {
          const project = projects.find(p => (p._id || p.id) === (task.projectId._id || task.projectId));
          return {
            ...task,
            projectName: project?.projectName || 'Unknown Project'
          };
        });

        setTasks(tasksWithProjects);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCalendarDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    if (viewMode === 'week') {
      // Week view: get current week
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - day); // Start from Sunday
      
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        dates.push(date);
      }
      return dates;
    } else {
      // Month view: existing logic
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      
      // Start from Sunday of the week containing the first day
      startDate.setDate(startDate.getDate() - startDate.getDay());
      
      const dates = [];
      const endDate = new Date(lastDay);
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
      
      const current = new Date(startDate);
      while (current <= endDate) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      
      return dates;
    }
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isOverdue = (task) => {
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today && task.status !== 'Completed' && task.status !== 'Done';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case 'Done': return 'bg-green-600';
      case 'In Progress': return 'bg-blue-600';
      case 'Blocked': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const navigateToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDates = getCalendarDates();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-primary">
        <TeamMemberHeader title="Calendar View" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-primary">
      <TeamMemberHeader title="Calendar View" />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Calendar Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-brown-primary">
                {viewMode === 'week' 
                  ? `Week of ${currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                  : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                }
              </h2>
              <button
                onClick={navigateToToday}
                className="bg-brown-primary text-white px-4 py-2 rounded-lg hover:bg-brown-secondary text-sm"
              >
                Today
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 rounded text-sm ${
                    viewMode === 'month' ? 'bg-brown-primary text-white' : 'text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 rounded text-sm ${
                    viewMode === 'week' ? 'bg-brown-primary text-white' : 'text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  Week
                </button>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 rounded-lg hover:bg-gray-200"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 rounded-lg hover:bg-gray-200"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </div>

          {/* Task Summary */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-blue-600 font-bold text-lg">
                {tasks.filter(t => t.status === 'In Progress').length}
              </div>
              <div className="text-blue-600 text-sm">In Progress</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-yellow-600 font-bold text-lg">
                {tasks.filter(t => t.status === 'Pending').length}
              </div>
              <div className="text-yellow-600 text-sm">Pending</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-red-600 font-bold text-lg">
                {tasks.filter(t => isOverdue(t)).length}
              </div>
              <div className="text-red-600 text-sm">Overdue</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-green-600 font-bold text-lg">
                {tasks.filter(t => t.status === 'Completed' || t.status === 'Done').length}
              </div>
              <div className="text-green-600 text-sm">Completed</div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-brown-primary text-white">
            {dayNames.map(day => (
              <div key={day} className="p-4 text-center font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className={`grid ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'}`}>
            {calendarDates.map((date, index) => {
              const dateTasks = getTasksForDate(date);
              const isCurrentMonthDate = viewMode === 'week' ? true : isCurrentMonth(date);
              const isTodayDate = isToday(date);
              
              return (
                <div
                  key={index}
                  className={`${viewMode === 'week' ? 'min-h-40' : 'min-h-32'} border border-gray-200 p-2 cursor-pointer transition-colors ${
                    isCurrentMonthDate 
                      ? isTodayDate 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'bg-white hover:bg-gray-50'
                      : 'bg-gray-50 text-gray-400'
                  } ${
                    selectedDate?.toDateString() === date.toDateString() ? 'ring-2 ring-brown-primary' : ''
                  }`}
                  onClick={() => setSelectedDate(date)}
                  onMouseEnter={() => setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                >
                  {/* Date Number */}
                  <div className={`text-sm font-medium mb-1 ${
                    isTodayDate ? 'text-blue-600 font-bold' : isCurrentMonthDate ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {date.getDate()}
                    {viewMode === 'week' && (
                      <div className="text-xs text-gray-500">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    )}
                  </div>

                  {/* Tasks */}
                  <div className="space-y-1">
                    {dateTasks.slice(0, viewMode === 'week' ? 5 : 3).map((task, taskIndex) => (
                      <div
                        key={task._id || taskIndex}
                        className={`text-xs p-1 rounded cursor-pointer truncate ${
                          getStatusColor(task.status)
                        } text-white hover:opacity-80`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                          setShowTaskModal(true);
                        }}
                        title={`${task.name} - ${task.projectName} (${task.status})`}
                      >
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                          <span className="truncate">{task.name}</span>
                        </div>
                      </div>
                    ))}
                    
                    {dateTasks.length > (viewMode === 'week' ? 5 : 3) && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dateTasks.length - (viewMode === 'week' ? 5 : 3)} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-brown-primary mb-4 flex items-center gap-2">
              <FaCalendarAlt />
              Tasks for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            {(() => {
              const dayTasks = getTasksForDate(selectedDate);
              
              if (dayTasks.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <FaTasks className="mx-auto text-3xl mb-2" />
                    <p>No tasks scheduled for this date</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {dayTasks.map(task => (
                    <div
                      key={task._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskModal(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 mb-1">{task.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <FaUser size={10} />
                              {task.projectName}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              task.priority === 'high' ? 'bg-red-100 text-red-700' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {task.priority} priority
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              task.status === 'Completed' || task.status === 'Done' ? 'bg-green-100 text-green-700' :
                              task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                              task.status === 'Blocked' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {task.status}
                            </span>
                            {isOverdue(task) && (
                              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                                Overdue
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            Progress: {task.progressPercentage || 0}%
                          </div>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-brown-primary h-2 rounded-full"
                              style={{ width: `${task.progressPercentage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Task Quick View Modal */}
        {showTaskModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-brown-primary">{selectedTask.name}</h3>
                  <button
                    onClick={() => {
                      setShowTaskModal(false);
                      setSelectedTask(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Project:</span>
                    <span className="ml-2 text-gray-600">{selectedTask.projectName}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Due Date:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No due date'}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Priority:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      selectedTask.priority === 'high' ? 'bg-red-100 text-red-700' :
                      selectedTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {selectedTask.priority}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      selectedTask.status === 'Completed' || selectedTask.status === 'Done' ? 'bg-green-100 text-green-700' :
                      selectedTask.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      selectedTask.status === 'Blocked' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedTask.status}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Progress:</span>
                    <div className="mt-1">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{selectedTask.progressPercentage || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-brown-primary h-2 rounded-full"
                          style={{ width: `${selectedTask.progressPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {selectedTask.description && (
                    <div>
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="mt-1 text-gray-600 text-sm">{selectedTask.description}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => {
                      setShowTaskModal(false);
                      setShowTaskDetailsModal(true);
                    }}
                    className="flex-1 bg-brown-primary text-white px-4 py-2 rounded-lg hover:bg-brown-secondary flex items-center justify-center gap-2"
                  >
                    <FaEye />
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setShowTaskModal(false);
                      setSelectedTask(null);
                    }}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Task Details Modal */}
        {showTaskDetailsModal && selectedTask && (
          <TaskDetailsModal
            task={selectedTask}
            onClose={() => {
              setShowTaskDetailsModal(false);
              setSelectedTask(null);
            }}
            onTaskUpdate={(updatedTask) => {
              // Refresh tasks after update
              fetchUserTasks(user._id || user.id);
              setShowTaskDetailsModal(false);
              setSelectedTask(null);
            }}
          />
        )}
      </div>
    </div>
  );
}