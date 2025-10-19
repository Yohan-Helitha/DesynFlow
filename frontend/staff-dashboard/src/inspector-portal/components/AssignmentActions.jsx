import React, { useState } from 'react';
import axios from 'axios';

const AssignmentActions = ({ assignment, onActionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [message, setMessage] = useState('');

  // Handle assignment acceptance
  const handleAcceptAssignment = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('authToken');
      
      // Update assignment status to accepted and start inspection
      const response = await axios.patch(
        `/api/assignment/status/${assignment._id}`,
        {
          status: 'in-progress',
          inspection_start_time: new Date(),
          action_notes: 'Assignment accepted by inspector'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage('✅ Assignment accepted! Inspection started.');
      
      if (onActionComplete) {
        onActionComplete('accepted', assignment);
      }
      
    } catch (error) {
      console.error('Error accepting assignment:', error);
      setMessage('❌ Failed to accept assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle assignment decline
  const handleDeclineAssignment = async () => {
    if (!declineReason.trim()) {
      setMessage('❌ Please provide a reason for declining the assignment.');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('authToken');
      
      // Update assignment status to declined with reason
      const response = await axios.patch(
        `/api/assignment/status/${assignment._id}`,
        {
          status: 'declined',
          decline_reason: declineReason,
          action_notes: `Assignment declined by inspector: ${declineReason}`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage('✅ Assignment declined. Reason sent to CSR.');
      setShowDeclineReason(false);
      setDeclineReason('');
      
      if (onActionComplete) {
        onActionComplete('declined', assignment, declineReason);
      }
      
    } catch (error) {
      console.error('Error declining assignment:', error);
      setMessage('❌ Failed to decline assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show decline reason input
  const handleDeclineClick = () => {
    setShowDeclineReason(true);
    setMessage('');
  };

  // Cancel decline action
  const handleCancelDecline = () => {
    setShowDeclineReason(false);
    setDeclineReason('');
    setMessage('');
  };

  // Don't show actions if assignment is not in 'assigned' status
  if (assignment.status !== 'assigned') {
    return null;
  }

  return (
    <div className="bg-cream-secondary rounded-lg p-4 border border-brown-primary-300">
      <h4 className="font-semibold text-brown-primary mb-3">🎯 Assignment Actions Required</h4>
      
      {/* Status Message */}
      {message && (
        <div className={`mb-3 p-2 rounded text-sm ${
          message.includes('✅') ? 'bg-green-primary text-cream-primary' : 'bg-red-400 text-cream-primary'
        }`}>
          {message}
        </div>
      )}

      {!showDeclineReason ? (
        /* Accept/Decline Buttons */
        <div className="flex gap-3">
          <button
            onClick={handleAcceptAssignment}
            disabled={loading}
            className="flex-1 bg-green-primary text-cream-primary py-2 px-4 rounded-lg hover:bg-soft-green disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Processing...' : '✅ Accept Assignment'}
          </button>
          
          <button
            onClick={handleDeclineClick}
            disabled={loading}
            className="flex-1 bg-red-500 text-cream-primary py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            ❌ Decline Assignment
          </button>
        </div>
      ) : (
        /* Decline Reason Input */
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-brown-primary mb-1">
              Reason for declining assignment: *
            </label>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Please explain why you cannot accept this assignment..."
              rows={3}
              className="w-full border border-brown-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary bg-cream-primary text-brown-primary"
              maxLength={500}
            />
            <p className="text-xs text-brown-secondary mt-1">
              {declineReason.length}/500 characters. This reason will be sent to the CSR.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleDeclineAssignment}
              disabled={loading || !declineReason.trim()}
              className="flex-1 bg-red-500 text-cream-primary py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Submitting...' : '📝 Submit Decline Reason'}
            </button>
            
            <button
              onClick={handleCancelDecline}
              disabled={loading}
              className="flex-1 bg-brown-secondary text-cream-primary py-2 px-4 rounded-lg hover:bg-brown-primary disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-brown-secondary">
        <p>ℹ️ Accept the assignment to start inspection immediately, or decline with a reason that will be sent to the Customer Service Representative.</p>
      </div>
    </div>
  );
};

export default AssignmentActions;
