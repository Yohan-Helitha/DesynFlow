import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssignmentHistory = () => {
  const [historyAssignments, setHistoryAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState({});
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'declined'

  // Fetch assignment history
  const fetchAssignmentHistory = async () => {
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

      // Filter for completed and declined assignments (history)
      const completedAssignments = response.data.filter(
        assignment => ['completed', 'declined'].includes(assignment.status)
      );

      setHistoryAssignments(completedAssignments);
      setMessage(completedAssignments.length === 0 ? 'No completed assignments found' : '');
    } catch (error) {
      console.error('Error fetching assignment history:', error);
      setMessage('❌ Failed to fetch assignment history');
    } finally {
      setLoading(false);
    }
  };

  // Delete assignment from history
  const deleteAssignment = async (assignmentId) => {
    if (!confirm('⚠️ Are you sure you want to delete this assignment from history? This action cannot be undone.')) {
      return;
    }

    setDeleting(prev => ({ ...prev, [assignmentId]: true }));
    
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(
        `/api/assignment/${assignmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('✅ Assignment deleted successfully');
      fetchAssignmentHistory(); // Refresh the list
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setMessage('❌ Failed to delete assignment');
    } finally {
      setDeleting(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  // Filter assignments based on status
  const filteredAssignments = historyAssignments.filter(assignment => {
    if (filter === 'all') return true;
    return assignment.status === filter;
  });

  // Get status style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: '✅'
        };
      case 'declined':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          icon: '❌'
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

  // Calculate inspection duration
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  useEffect(() => {
    fetchAssignmentHistory();
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
        <h2 className="text-2xl font-bold text-dark-brown mb-2">📚 Assignment History</h2>
        <p className="text-gray-600">View completed and declined assignments with details</p>
      </div>

      {/* Filter Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            filter === 'all'
              ? 'bg-brown-primary text-cream-primary'
              : 'bg-cream-light text-brown-primary hover:bg-brown-primary hover:text-cream-primary'
          }`}
        >
          📋 All ({historyAssignments.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            filter === 'completed'
              ? 'bg-green-600 text-white'
              : 'bg-green-100 text-green-800 hover:bg-green-600 hover:text-white'
          }`}
        >
          ✅ Completed ({historyAssignments.filter(a => a.status === 'completed').length})
        </button>
        <button
          onClick={() => setFilter('declined')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            filter === 'declined'
              ? 'bg-red-600 text-white'
              : 'bg-red-100 text-red-800 hover:bg-red-600 hover:text-white'
          }`}
        >
          ❌ Declined ({historyAssignments.filter(a => a.status === 'declined').length})
        </button>
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

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.map((assignment) => {
          const status = assignment.status;
          const statusStyle = getStatusStyle(status);
          const isDeleting = deleting[assignment._id];

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
                    {status}
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
                    👨‍🔧 Inspector Name
                  </label>
                  <p className="text-dark-brown font-medium">
                    {assignment.inspector_ID?.username || 'N/A'}
                  </p>
                </div>

                {/* Timeline Information */}
                <div className="bg-cream-light rounded-lg p-3">
                  <label className="text-xs font-semibold text-brown-primary uppercase tracking-wide block mb-1">
                    🕐 Timeline
                  </label>
                  <div className="text-sm text-dark-brown space-y-1">
                    <p>Assigned: {new Date(assignment.assignAt).toLocaleDateString()}</p>
                    
                    {status === 'completed' && (
                      <>
                        {assignment.inspection_start_time && (
                          <p>Started: {new Date(assignment.inspection_start_time).toLocaleDateString()}</p>
                        )}
                        {assignment.inspection_end_time && (
                          <p><strong>Completed: {new Date(assignment.inspection_end_time).toLocaleDateString()}</strong></p>
                        )}
                        <p>Duration: {calculateDuration(assignment.inspection_start_time, assignment.inspection_end_time)}</p>
                      </>
                    )}
                    
                    {status === 'declined' && assignment.updatedAt && (
                      <p><strong>Declined: {new Date(assignment.updatedAt).toLocaleDateString()}</strong></p>
                    )}
                  </div>
                </div>

                {/* Decline Reason (if applicable) */}
                {status === 'declined' && assignment.decline_reason && (
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <label className="text-xs font-semibold text-red-800 uppercase tracking-wide block mb-1">
                      ❌ Decline Reason
                    </label>
                    <p className="text-red-700 text-sm">
                      {assignment.decline_reason}
                    </p>
                  </div>
                )}

                {/* Action Notes (if applicable) */}
                {assignment.action_notes && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <label className="text-xs font-semibold text-blue-800 uppercase tracking-wide block mb-1">
                      📝 Notes
                    </label>
                    <p className="text-blue-700 text-sm">
                      {assignment.action_notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Delete Action */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => deleteAssignment(assignment._id)}
                  disabled={isDeleting}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isDeleting 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-300'
                  }`}
                >
                  {isDeleting ? '⏳ Deleting...' : '🗑️ Delete from History'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && !loading && (
        <div className="text-center py-16 bg-cream-light rounded-xl border-2 border-dashed border-brown-light">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-dark-brown mb-2">
            No {filter === 'all' ? 'Assignment' : filter.charAt(0).toUpperCase() + filter.slice(1)} History
          </h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? 'No completed or declined assignments yet'
              : `No ${filter} assignments found`
            }
          </p>
          <button
            onClick={fetchAssignmentHistory}
            className="bg-brown-primary text-cream-primary px-6 py-2 rounded-lg hover:bg-dark-brown transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default AssignmentHistory;
