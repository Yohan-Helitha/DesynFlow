import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssignedJobs = ({ inspector, onCollectData }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch assigned jobs for the inspector
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!inspector || (!inspector._id && !inspector.id)) {
        console.log('No inspector data available');
        setAssignments([]);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found');
        setAssignments([]);
        setLoading(false);
        return;
      }

      const inspectorId = inspector._id || inspector.id;
      const response = await axios.get(
        `http://localhost:4000/api/assignment/inspector/${inspectorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Assignments Response:', response.data);
      setAssignments(response.data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      if (err.response?.status === 401) {
        setError('Authentication required. Please login to view assignments.');
      } else if (err.response?.status === 404) {
        console.log('No assignments found - this is normal');
        setAssignments([]);
      } else {
        setError(`Failed to load assignments: ${err.message}`);
      }
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [inspector]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-brown-primary-300 pb-4">
          <h2 className="text-2xl font-bold text-brown-primary flex items-center space-x-2">
            <span>📋</span>
            <span>My Assignments</span>
          </h2>
          <p className="text-brown-secondary mt-1">Your assigned inspection jobs</p>
        </div>
        <div className="bg-cream-light rounded-lg p-8 text-center border border-brown-primary-300">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brown-primary mb-4"></div>
          <p className="text-brown-secondary">Loading your assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="border-b border-brown-primary-300 pb-4">
          <h2 className="text-2xl font-bold text-brown-primary flex items-center space-x-2">
            <span>📋</span>
            <span>My Assignments</span>
          </h2>
          <p className="text-brown-secondary mt-1">Your assigned inspection jobs</p>
        </div>
        <div className="bg-red-light rounded-lg p-6 border border-red-primary">
          <h3 className="text-lg font-semibold text-red-primary mb-2">Error Loading Assignments</h3>
          <p className="text-red-secondary mb-4">{error}</p>
          <button 
            onClick={fetchAssignments}
            className="px-4 py-2 bg-red-primary text-cream-primary rounded hover:bg-red-secondary transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-brown-primary-300 pb-4">
        <h2 className="text-2xl font-bold text-brown-primary flex items-center space-x-2">
          <span>📋</span>
          <span>My Assignments</span>
        </h2>
        <p className="text-brown-secondary mt-1">Your assigned inspection jobs</p>
      </div>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div className="bg-cream-light rounded-lg p-8 text-center border border-brown-primary-300">
          <div className="text-brown-primary-300 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-brown-primary mb-2">No Assignments Yet</h3>
          <p className="text-brown-secondary mb-4">You haven't been assigned any inspection jobs yet.</p>
          <p className="text-sm text-brown-primary-300">Check back later or contact your supervisor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="bg-cream-primary rounded-lg shadow-lg border border-brown-primary-300 p-6 hover:shadow-xl transition-all duration-300">
              {/* Assignment Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-primary rounded-full"></div>
                  <span className="text-xs font-medium text-green-primary uppercase tracking-wide">Assigned Job</span>
                </div>
                <div className="text-xs text-brown-primary-300">
                  ID: {assignment._id?.slice(-6)}
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-4 mb-6">
                <div className="bg-cream-light rounded-lg p-3 border border-brown-primary-200">
                  <label className="text-xs font-semibold text-brown-primary uppercase tracking-wide block mb-1">
                    👤 Client Name
                  </label>
                  <p className="text-brown-primary font-semibold">
                    {assignment.inspectionRequest?.clientName || 'N/A'}
                  </p>
                </div>
                
                <div className="bg-cream-light rounded-lg p-3 border border-brown-primary-200">
                  <label className="text-xs font-semibold text-brown-primary uppercase tracking-wide block mb-1">
                    📱 Client Mobile
                  </label>
                  <p className="text-brown-secondary">
                    {assignment.inspectionRequest?.clientPhone || assignment.inspectionRequest?.phone || 'N/A'}
                  </p>
                </div>
                
                <div className="bg-cream-light rounded-lg p-3 border border-brown-primary-200">
                  <label className="text-xs font-semibold text-brown-primary uppercase tracking-wide block mb-1">
                    📍 Site Location
                  </label>
                  <p className="text-brown-secondary text-sm">
                    {assignment.inspectionRequest?.propertyAddress || assignment.inspectionRequest?.siteLocation || 'N/A'}
                  </p>
                </div>
                
                <div className="bg-cream-light rounded-lg p-3 border border-brown-primary-200">
                  <label className="text-xs font-semibold text-brown-primary uppercase tracking-wide block mb-1">
                    📅 Preferred Date
                  </label>
                  <p className="text-brown-secondary">
                    {assignment.inspectionRequest?.preferredDate 
                      ? new Date(assignment.inspectionRequest.preferredDate).toLocaleDateString()
                      : assignment.inspectionRequest?.scheduledDate
                      ? new Date(assignment.inspectionRequest.scheduledDate).toLocaleDateString()
                      : 'Not specified'
                    }
                  </p>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="flex space-x-3">
                <button
                  onClick={() => onCollectData(assignment)}
                  className="flex-1 bg-gradient-to-r from-green-primary to-soft-green text-cream-primary py-3 px-4 rounded-lg font-semibold hover:from-soft-green hover:to-green-primary transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-green-primary-300"
                >
                  📝 Collect Data
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedJobs;