import React, { useEffect, useState } from 'react';

const STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    projectName: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    status: 'Pending'
  });

  // Sample task data
  const sampleTasks = [
    {
      _id: "1",
      title: "Prepare electrical wiring plan",
      projectName: "Downtown Office Renovation",
      assignedTo: "Mike Johnson",
      dueDate: "2023-11-15",
      priority: "high",
      status: "Pending",
    },
    {
      _id: "2",
      title: "Order flooring materials",
      projectName: "Riverside Apartments",
      assignedTo: "Sarah Chen",
      dueDate: "2023-11-12",
      priority: "medium",
      status: "Pending",
    },
    {
      _id: "3",
      title: "Install bathroom fixtures",
      projectName: "Downtown Office Renovation",
      assignedTo: "Robert Miller",
      dueDate: "2023-11-10",
      priority: "high",
      status: "In Progress",
    },
    {
      _id: "4",
      title: "Paint exterior walls",
      projectName: "City Park Pavilion",
      assignedTo: "Lisa Wong",
      dueDate: "2023-11-08",
      priority: "medium",
      status: "In Progress",
    },
    {
      _id: "5",
      title: "Foundation inspection",
      projectName: "Medical Center Expansion",
      assignedTo: "David Smith",
      dueDate: "2023-11-05",
      priority: "low",
      status: "Completed",
    },
    {
      _id: "6",
      title: "Install HVAC system",
      projectName: "Downtown Office Renovation",
      assignedTo: "James Wilson",
      dueDate: "2023-11-03",
      priority: "low",
      status: "Completed",
    },
  ];

  useEffect(() => {
    // Simulate loading tasks
    setTimeout(() => {
      setTasks(sampleTasks);
      setLoading(false);
    }, 500);
  }, []);

  const handleStatusChange = (task, newStatus) => {
    setTasks(prevTasks => 
      prevTasks.map(t => 
        t._id === task._id ? { ...t, status: newStatus } : t
      )
    );
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask(task);
    setShowAddModal(true);
  };

  const handleDeleteTask = (task) => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      setTasks(prevTasks => prevTasks.filter(t => t._id !== task._id));
    }
  };

  const handleAddTask = () => {
    if (editingTask) {
      // Update existing task
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t._id === editingTask._id ? { ...newTask, _id: editingTask._id } : t
        )
      );
    } else {
      // Add new task
      const task = {
        ...newTask,
        _id: Date.now().toString()
      };
      setTasks(prevTasks => [...prevTasks, task]);
    }
    setShowAddModal(false);
    setEditingTask(null);
    setNewTask({
      title: '',
      projectName: '',
      assignedTo: '',
      dueDate: '',
      priority: 'medium',
      status: 'Pending'
    });
  };

  const renderTaskCard = (task, status) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow" key={task._id}>
      <div className="font-semibold text-gray-800 text-base mb-1">{task.title}</div>
      <div className="text-amber-600 text-sm mb-3">{task.projectName}</div>
      <div className="flex justify-between items-center text-xs text-gray-600 mb-3">
        <span className="flex items-center">
          <span className="mr-1">👤</span>
          {task.assignedTo}
        </span>
        <span className="flex items-center">
          <span className="mr-1">📅</span>
          Due {task.dueDate?.slice(0, 10)}
        </span>
      </div>
      <div className={`inline-block px-2 py-1 text-xs rounded-md mb-3 ${
        task.priority === 'high' 
          ? 'bg-red-100 text-red-800' 
          : task.priority === 'medium' 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-green-100 text-green-800'
      }`}>
        {task.priority}
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
          <button 
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors"
            onClick={() => handleStatusChange(task, STATUS.COMPLETED)}
          >
            Complete
          </button>
        )}
        {status === STATUS.COMPLETED && (
          <button 
            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-xs transition-colors"
            onClick={() => handleStatusChange(task, STATUS.PENDING)}
          >
            Reopen
          </button>
        )}
      </div>
    </div>
  );

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  if (loading) return <div className="p-8 text-amber-600">Loading tasks...</div>;

  return (
    <div className="p-6 bg-cream-primary min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brown-primary">Task Management</h2>
        <div className="flex gap-3">
          <button className="bg-white hover:bg-gray-50 text-brown-primary px-4 py-2 rounded-lg border border-brown-light transition-colors flex items-center gap-2">
            🔍 Filter
          </button>
          <button 
            className="bg-brown-primary hover:bg-brown-secondary text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            ➕ Add Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-amber-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-brown-primary flex items-center gap-2">
              📋 Pending
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
              ⚡ In Progress
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
              ✅ Completed
            </span>
            <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
              {getTasksByStatus(STATUS.COMPLETED).length}
            </span>
          </div>
          <div className="space-y-3">
            {getTasksByStatus(STATUS.COMPLETED).map((task) => renderTaskCard(task, STATUS.COMPLETED))}
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
                    title: '',
                    projectName: '',
                    assignedTo: '',
                    dueDate: '',
                    priority: 'medium',
                    status: 'Pending'
                  });
                }}
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Enter task title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  value={newTask.projectName}
                  onChange={(e) => setNewTask({...newTask, projectName: e.target.value})}
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <input
                  type="text"
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                  placeholder="Enter assignee name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button 
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTask(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-brown-primary hover:bg-brown-secondary text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddTask}
                disabled={!newTask.title.trim()}
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
