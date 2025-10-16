import React, { useState } from 'react';
import axios from 'axios';

const InspectionStatusUpdates = ({ assignment, inspector, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle inspection completion (when inspector clicks Available)
  const handleCompleteInspection = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('authToken');
      
      // Update assignment status to completed
      await axios.patch(
        `http://localhost:4000/api/assignment/status/${assignment._id}`,
        {
          status: 'completed',
          inspection_end_time: new Date(),
          action_notes: 'Inspection completed by inspector'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update inspector status back to available
      const inspectorId = inspector._id || inspector.id;
      await axios.post(
        'http://localhost:4000/api/inspector-location/update',
        {
          inspectorId: inspectorId,
          status: 'available'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage('✅ Inspection completed! You are now available for new assignments.');
      
      if (onStatusUpdate) {
        onStatusUpdate('completed');
      }
      
    } catch (error) {
      console.error('Error completing inspection:', error);
      setMessage('❌ Failed to complete inspection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle pause inspection
  const handlePauseInspection = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('authToken');
      
      await axios.patch(
        `http://localhost:4000/api/assignment/status/${assignment._id}`,
        {
          status: 'paused',
          action_notes: 'Inspection paused by inspector'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage('⏸️ Inspection paused.');
      
      if (onStatusUpdate) {
        onStatusUpdate('paused');
      }
      
    } catch (error) {
      console.error('Error pausing inspection:', error);
      setMessage('❌ Failed to pause inspection.');
    } finally {
      setLoading(false);
    }
  };

  // Handle resume inspection
  const handleResumeInspection = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('authToken');
      
      await axios.patch(
        `http://localhost:4000/api/assignment/status/${assignment._id}`,
        {
          status: 'in-progress',
          action_notes: 'Inspection resumed by inspector'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage('▶️ Inspection resumed.');
      
      if (onStatusUpdate) {
        onStatusUpdate('in-progress');
      }
      
    } catch (error) {
      console.error('Error resuming inspection:', error);
      setMessage('❌ Failed to resume inspection.');
    } finally {
      setLoading(false);
    }
  };

  // Get status display info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'assigned':
        return {
          color: 'bg-brown-primary-300 text-brown-primary border-brown-primary',
          icon: '📋',
          title: 'Assignment Pending',
          description: 'Please accept or decline this assignment'
        };
      case 'in-progress':
        return {
          color: 'bg-soft-green text-brown-primary border-green-primary',
          icon: '🔍',
          title: 'Inspection In Progress',
          description: 'Currently conducting inspection'
        };
      case 'paused':
        return {
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: '⏸️',
          title: 'Inspection Paused',
          description: 'Inspection temporarily paused'
        };
      case 'completed':
        return {
          color: 'bg-green-primary text-cream-primary border-green-primary',
          icon: '✅',
          title: 'Inspection Completed',
          description: 'Inspection finished successfully'
        };
      case 'declined':
        return {
          color: 'bg-red-400 text-cream-primary border-red-500',
          icon: '❌',
          title: 'Assignment Declined',
          description: 'Assignment was declined'
        };
      default:
        return {
          color: 'bg-brown-secondary text-cream-primary border-brown-secondary',
          icon: '❓',
          title: 'Unknown Status',
          description: 'Status unknown'
        };
    }
  };

  const statusInfo = getStatusInfo(assignment.status);

  return (
    <div className="bg-cream-primary rounded-lg p-4 border border-brown-primary-300">
      <h3 className="font-semibold text-brown-primary mb-4">📊 Inspection Status Updates</h3>
      
      {/* Current Status Display */}
      <div className={`rounded-lg p-4 border mb-4 ${statusInfo.color}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{statusInfo.icon}</span>
          <div>
            <h4 className="font-semibold">{statusInfo.title}</h4>
            <p className="text-sm">{statusInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`mb-4 p-3 rounded text-sm ${
          message.includes('✅') || message.includes('▶️') || message.includes('⏸️') 
            ? 'bg-green-primary text-cream-primary' 
            : 'bg-red-400 text-cream-primary'
        }`}>
          {message}
        </div>
      )}

      {/* Action Buttons Based on Status */}
      <div className="space-y-3">
        {assignment.status === 'in-progress' && (
          <div className="flex gap-3">
            <button
              onClick={handleCompleteInspection}
              disabled={loading}
              className="flex-1 bg-green-primary text-cream-primary py-2 px-4 rounded-lg hover:bg-soft-green disabled:opacity-50 font-medium"
            >
              {loading ? 'Completing...' : '✅ Complete Inspection'}
            </button>
            
            <button
              onClick={handlePauseInspection}
              disabled={loading}
              className="flex-1 bg-amber-500 text-cream-primary py-2 px-4 rounded-lg hover:bg-amber-600 disabled:opacity-50 font-medium"
            >
              {loading ? 'Pausing...' : '⏸️ Pause Inspection'}
            </button>
          </div>
        )}

        {assignment.status === 'paused' && (
          <div className="flex gap-3">
            <button
              onClick={handleResumeInspection}
              disabled={loading}
              className="flex-1 bg-soft-green text-brown-primary py-2 px-4 rounded-lg hover:bg-green-primary hover:text-cream-primary disabled:opacity-50 font-medium"
            >
              {loading ? 'Resuming...' : '▶️ Resume Inspection'}
            </button>
            
            <button
              onClick={handleCompleteInspection}
              disabled={loading}
              className="flex-1 bg-green-primary text-cream-primary py-2 px-4 rounded-lg hover:bg-soft-green disabled:opacity-50 font-medium"
            >
              {loading ? 'Completing...' : '✅ Complete Inspection'}
            </button>
          </div>
        )}

        {assignment.status === 'completed' && (
          <div className="bg-green-primary rounded-lg p-3 border border-green-primary">
            <p className="text-cream-primary text-sm font-medium">
              🎉 Inspection completed successfully! You are now available for new assignments.
            </p>
          </div>
        )}

        {assignment.status === 'declined' && (
          <div className="bg-red-400 rounded-lg p-3 border border-red-500">
            <p className="text-cream-primary text-sm font-medium">
              ❌ This assignment was declined. Waiting for new assignments from CSR.
            </p>
          </div>
        )}
      </div>

      {/* Status Timeline Info */}
      <div className="mt-4 pt-4 border-t border-brown-primary-300">
        <h5 className="font-medium text-brown-primary mb-2">📅 Timeline:</h5>
        <div className="space-y-1 text-sm text-brown-secondary">
          <p>📋 Assigned: {new Date(assignment.assignAt).toLocaleString()}</p>
          {assignment.inspection_start_time && (
            <p>🔍 Started: {new Date(assignment.inspection_start_time).toLocaleString()}</p>
          )}
          {assignment.inspection_end_time && (
            <p>✅ Completed: {new Date(assignment.inspection_end_time).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionStatusUpdates;