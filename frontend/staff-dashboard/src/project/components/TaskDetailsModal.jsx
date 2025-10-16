import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlay, FaStop, FaClock, FaCalendarAlt, FaFlag, FaUser, FaFileAlt, FaUpload, FaDownload, FaComments, FaExclamationTriangle, FaSave } from 'react-icons/fa';

export default function TaskDetailsModal({ task, isOpen, onClose, onTaskUpdate, timeTracking, onToggleTimeTracking }) {
  const [taskData, setTaskData] = useState(task);
  const [isEditing, setIsEditing] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [uploadFiles, setUploadFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [issueDetails, setIssueDetails] = useState({ description: '', flaggedAt: new Date() });
  const [showIssueForm, setShowIssueForm] = useState(false);

  useEffect(() => {
    if (task) {
      setTaskData(task);
      // In a real implementation, you would fetch comments and files here
      // For now, we'll use mock data
      setComments([
        {
          id: 1,
          author: 'Team Leader',
          content: 'Please make sure to follow the design guidelines.',
          timestamp: '2025-10-14T10:30:00Z'
        },
        {
          id: 2,
          author: 'anna_member12',
          content: 'Started working on the initial planning phase.',
          timestamp: '2025-10-15T09:15:00Z'
        }
      ]);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/tasks/${taskData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: taskData.name,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          status: taskData.status,
          progressPercentage: taskData.progressPercentage
        })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        onTaskUpdate(updatedTask);
        setIsEditing(false);
        alert('Task updated successfully!');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'Blocked') {
      setShowIssueForm(true);
      return;
    }

    const updatedData = {
      ...taskData,
      status: newStatus,
      progressPercentage: newStatus === 'Completed' ? 100 : 
                         newStatus === 'In Progress' ? Math.max(taskData.progressPercentage || 0, 25) : 
                         taskData.progressPercentage
    };

    setTaskData(updatedData);
    await handleSave();
  };

  const handleBlockTask = async () => {
    if (!issueDetails.description.trim()) {
      alert('Please provide a description for the issue');
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`/api/tasks/${taskData._id}/block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueDescription: issueDetails.description,
          blockedBy: currentUser?.id || currentUser?._id
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTaskData({ ...taskData, status: 'Blocked' });
        onTaskUpdate(result.task);
        setShowIssueForm(false);
        setIssueDetails({ description: '', flaggedAt: new Date() });
        alert('Task blocked and issue logged successfully for weekly reporting');
      } else {
        const error = await response.json();
        alert(`Error blocking task: ${error.message}`);
      }
    } catch (error) {
      console.error('Error blocking task:', error);
      alert('Error blocking task');
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      try {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        
        // In a real implementation, you'd upload the file to a file storage service first
        // For now, we'll simulate by using the filename
        const response = await fetch(`/api/tasks/${taskData._id}/attachments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: `${Date.now()}_${file.name}`,
            originalName: file.name,
            uploadedBy: currentUser?.id || currentUser?._id,
            fileSize: file.size,
            mimeType: file.type
          })
        });

        if (response.ok) {
          const updatedTask = await response.json();
          onTaskUpdate(updatedTask);
        } else {
          alert(`Error uploading ${file.name}`);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Error uploading ${file.name}`);
      }
    }
    
    setUploadFiles(prev => [...prev, ...files]);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`/api/tasks/${taskData._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          author: currentUser?.id || currentUser?._id
        })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        
        // Update local comments
        const newCommentObj = {
          id: Date.now(),
          author: currentUser?.username || 'Current User',
          content: newComment,
          timestamp: new Date().toISOString()
        };
        
        setComments(prev => [...prev, newCommentObj]);
        setNewComment('');
        
        // Update parent task
        onTaskUpdate(updatedTask);
      } else {
        alert('Error adding comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'In Progress': return 'text-blue-600 bg-blue-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Blocked': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-brown-primary">
              {isEditing ? (
                <input
                  type="text"
                  value={taskData.name}
                  onChange={(e) => setTaskData({...taskData, name: e.target.value})}
                  className="border border-gray-300 rounded px-2 py-1 text-lg font-bold"
                />
              ) : (
                taskData.name
              )}
            </h2>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(taskData.status)}`}>
              {taskData.status}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(taskData.priority)}`}>
              {taskData.priority} priority
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <FaSave /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-brown-primary text-white px-4 py-2 rounded-lg hover:bg-brown-secondary"
              >
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <div className="flex h-96 overflow-hidden">
          {/* Left Side - Task Details */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Task Information */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                {isEditing ? (
                  <textarea
                    value={taskData.description || ''}
                    onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
                    placeholder="Task description..."
                  />
                ) : (
                  <p className="text-gray-600">{taskData.description || 'No description provided'}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaCalendarAlt className="inline mr-1" /> Due Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
                    />
                  ) : (
                    <p className="text-gray-600">
                      {taskData.dueDate ? new Date(taskData.dueDate).toLocaleDateString() : 'No due date'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaFlag className="inline mr-1" /> Priority
                  </label>
                  {isEditing ? (
                    <select
                      value={taskData.priority}
                      onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  ) : (
                    <p className="text-gray-600 capitalize">{taskData.priority}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                  <p className="text-gray-600">{taskData.weight || 0} points</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <p className="text-gray-600">{taskData.projectName}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progress</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-brown-primary h-3 rounded-full transition-all duration-300"
                      style={{ width: `${taskData.progressPercentage || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{taskData.progressPercentage || 0}%</span>
                </div>
                {isEditing && (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={taskData.progressPercentage || 0}
                    onChange={(e) => setTaskData({...taskData, progressPercentage: parseInt(e.target.value)})}
                    className="w-full mt-2"
                  />
                )}
              </div>
            </div>

            {/* Time Tracking */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <FaClock /> Time Tracking
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  {timeTracking.active && timeTracking.taskId === taskData._id ? (
                    <p className="text-blue-600">
                      Timer running since {timeTracking.startTime?.toLocaleTimeString()}
                    </p>
                  ) : (
                    <p className="text-gray-600">No active timer</p>
                  )}
                </div>
                <button
                  onClick={() => onToggleTimeTracking(taskData._id)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    timeTracking.active && timeTracking.taskId === taskData._id
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {timeTracking.active && timeTracking.taskId === taskData._id ? (
                    <>
                      <FaStop /> Stop Timer
                    </>
                  ) : (
                    <>
                      <FaPlay /> Start Timer
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Status Actions */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Quick Actions</h3>
              <div className="flex gap-2 flex-wrap">
                {taskData.status !== 'In Progress' && (
                  <button
                    onClick={() => handleStatusChange('In Progress')}
                    className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 text-sm"
                  >
                    Start Task
                  </button>
                )}
                {taskData.status !== 'Completed' && taskData.status !== 'Done' && (
                  <button
                    onClick={() => handleStatusChange('Completed')}
                    className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 text-sm"
                  >
                    Mark Complete
                  </button>
                )}
                {taskData.status !== 'Blocked' && (
                  <button
                    onClick={() => handleStatusChange('Blocked')}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm flex items-center gap-1"
                  >
                    <FaExclamationTriangle size={12} /> Block Task
                  </button>
                )}
                {taskData.status !== 'Pending' && (
                  <button
                    onClick={() => handleStatusChange('Pending')}
                    className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 text-sm"
                  >
                    Reset to Pending
                  </button>
                )}
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <FaFileAlt /> Attachments
              </h3>
              <div className="border border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex items-center justify-center gap-2 text-gray-600 hover:text-brown-primary"
                >
                  <FaUpload /> Upload Files
                </label>
              </div>
              
              {uploadFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {uploadFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <FaFileAlt /> {file.name}
                      <button className="text-blue-600 hover:underline">
                        <FaDownload size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Comments */}
          <div className="w-1/3 border-l border-gray-200 p-6 overflow-y-auto">
            <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
              <FaComments /> Comments
            </h3>
            
            {/* Comments List */}
            <div className="space-y-3 mb-4">
              {comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-brown-primary">{comment.author}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{comment.content}</p>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="space-y-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brown-primary"
              />
              <button
                onClick={addComment}
                disabled={!newComment.trim()}
                className="w-full bg-brown-primary text-white px-3 py-2 rounded-lg hover:bg-brown-secondary text-sm disabled:opacity-50"
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>

        {/* Issue Form Modal */}
        {showIssueForm && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                <FaExclamationTriangle /> Block Task - Report Issue
              </h3>
              <p className="text-gray-600 mb-4">
                Please describe the issue that's blocking this task. This will be tracked for weekly reports.
              </p>
              <textarea
                value={issueDetails.description}
                onChange={(e) => setIssueDetails({...issueDetails, description: e.target.value})}
                placeholder="Describe the issue in detail..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleBlockTask}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Block Task
                </button>
                <button
                  onClick={() => setShowIssueForm(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
