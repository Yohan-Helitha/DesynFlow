import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssignmentStatusManager = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [message, setMessage] = useState('');

  // Fetch all assignments with their current status
  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setMessage('❌ Authentication required');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        '/api/assignment/list',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Filter for non-completed assignments (active assignments)
      const activeAssignments = response.data.filter(
        assignment => !['completed', 'declined'].includes(assignment.status)
      );

      setAssignments(activeAssignments);
      setMessage(activeAssignments.length === 0 ? 'No active assignments found' : '');
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setMessage('❌ Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  // Update assignment status
  const updateAssignmentStatus = async (assignmentId, newStatus, additionalData = {}) => {
    setUpdating(prev => ({ ...prev, [assignmentId]: true }));
    
    try {
      const token = localStorage.getItem('authToken');
      const updateData = {
        status: newStatus,
        ...additionalData
      };

      // Add timing data based on status
      if (newStatus === 'in-progress' && !additionalData.inspection_start_time) {
        updateData.inspection_start_time = new Date().toISOString();
      }
      
      if (newStatus === 'completed' && !additionalData.inspection_end_time) {
        updateData.inspection_end_time = new Date().toISOString();
      }

      await axios.patch(
        `/api/assignment/status/${assignmentId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`✅ Assignment status updated to ${newStatus}`);
      fetchAssignments(); // Refresh the list
    } catch (error) {
      console.error('Error updating assignment status:', error);
      setMessage(`❌ Failed to update assignment status`);
    } finally {
      setUpdating(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  // Get status color and icon
  const getStatusStyle = (status) => {
    switch (status) {
      case 'assigned':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          icon: '📋'
        };
      case 'in-progress':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          icon: '🔄'
        };
      case 'paused':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          border: 'border-orange-200',
          icon: '⏸️'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: '❓'
        };
    }
  };

  // Get available next statuses
  const getAvailableStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'assigned':
        return ['in-progress'];
      case 'in-progress':
        return ['paused', 'completed'];
      case 'paused':
        return ['in-progress', 'completed'];
      default:
        return [];
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-dark-brown mb-2">📊 Assignment Status Management</h2>
        <p className="text-gray-600">Track and update assignment progress in real-time</p>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 
          message.includes('❌') ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message}
        </div>
      )}

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => {
          const status = assignment.status;
          const statusStyle = getStatusStyle(status);
          const availableStatuses = getAvailableStatuses(status);
          const isUpdating = updating[assignment._id];

          return (
            <div 
              key={assignment._id}
              className="bg-white rounded-xl shadow-lg border border-brown-light p-6 hover:shadow-xl transition-all duration-300"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusStyle.bg} ${statusStyle.border} border`}>
                  <span className="text-lg">{statusStyle.icon}</span>
                  <span className={`text-sm font-semibold ${statusStyle.text} capitalize`}>
                    {status.replace('-', ' ')}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  ID: {assignment._id.slice(-6)}
                </div>
              </div>

              {/* Assignment Details */}
              <div className="space-y-3 mb-4">
                <div className="bg-cream-light rounded-lg p-3">
                  <label className="text-xs font-semibold text-brown-primary uppercase tracking-wide block mb-1">
                    👤 Client
                  </label>
                  <p className="text-dark-brown font-medium">
                    {assignment.inspectionRequest?.clientName || 'N/A'}
                  </p>
                </div>

                <div className="bg-cream-light rounded-lg p-3">
                  <label className="text-xs font-semibold text-brown-primary uppercase tracking-wide block mb-1">
                    📍 Property
                  </label>
                  <p className="text-dark-brown text-sm">
                    {assignment.inspectionRequest?.propertyAddress || 'N/A'}
                  </p>
                </div>

                <div className="bg-cream-light rounded-lg p-3">
                  <label className="text-xs font-semibold text-brown-primary uppercase tracking-wide block mb-1">
                    👨‍🔧 Inspector
                  </label>
                  <p className="text-dark-brown font-medium">
                    {assignment.inspector_ID?.username || 'N/A'}
                  </p>
                </div>

                {/* Timing Information */}
                <div className="bg-cream-light rounded-lg p-3">
                  <label className="text-xs font-semibold text-brown-primary uppercase tracking-wide block mb-1">
                    🕐 Timeline
                  </label>
                  <div className="text-sm text-dark-brown space-y-1">
                    <p>Assigned: {new Date(assignment.assignAt).toLocaleDateString()}</p>
                    {assignment.inspection_start_time && (
                      <p>Started: {new Date(assignment.inspection_start_time).toLocaleDateString()}</p>
                    )}
                    {assignment.inspection_end_time && (
                      <p>Completed: {new Date(assignment.inspection_end_time).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Update Actions */}
              {availableStatuses.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-brown-primary uppercase tracking-wide block">
                    🔄 Update Status
                  </label>
                  {availableStatuses.map((newStatus) => (
                    <button
                      key={newStatus}
                      onClick={() => updateAssignmentStatus(assignment._id, newStatus)}
                      disabled={isUpdating}
                      className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isUpdating 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-brown-primary text-cream-primary hover:bg-dark-brown hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-brown-primary/40'
                      }`}
                    >
                      {isUpdating ? '⏳ Updating...' : 
                        newStatus === 'in-progress' ? '▶️ Start Inspection' :
                        newStatus === 'paused' ? '⏸️ Pause Inspection' :
                        newStatus === 'completed' ? '✅ Mark Complete' :
                        `Set ${newStatus.replace('-', ' ')}`
                      }
                    </button>
                  ))}
                </div>
              )}

              {/* No Actions Available */}
              {availableStatuses.length === 0 && (
                <div className="text-center py-3">
                  <p className="text-sm text-gray-500">
                    {status === 'completed' ? '✅ Assignment Completed' : 
                     status === 'declined' ? '❌ Assignment Declined' : 
                     'No actions available'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {assignments.length === 0 && !loading && (
        <div className="text-center py-16 bg-cream-light rounded-xl border-2 border-dashed border-brown-light">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-dark-brown mb-2">No Active Assignments</h3>
          <p className="text-gray-600 mb-4">All assignments are either completed or declined</p>
          <button
            onClick={fetchAssignments}
            className="bg-brown-primary text-cream-primary px-6 py-2 rounded-lg hover:bg-dark-brown transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default AssignmentStatusManager;
