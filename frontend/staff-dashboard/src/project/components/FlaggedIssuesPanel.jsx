import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCheck, FaClock, FaUser, FaCalendarAlt, FaFileAlt } from 'react-icons/fa';

export default function FlaggedIssuesPanel({ teamId, projectId }) {
  const [flaggedIssues, setFlaggedIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unresolved'); // 'all', 'unresolved', 'resolved'
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    fetchFlaggedIssues();
  }, [teamId, projectId, filter]);

  const fetchFlaggedIssues = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (projectId) params.append('projectId', projectId);
      if (teamId) params.append('teamId', teamId);
      if (filter === 'unresolved') params.append('resolved', 'false');
      if (filter === 'resolved') params.append('resolved', 'true');

      const response = await fetch(`/api/flagged-issues?${params}`);
      
      if (response.ok) {
        const issues = await response.json();
        setFlaggedIssues(issues);
      } else {
        console.error('Failed to fetch flagged issues');
      }
    } catch (error) {
      console.error('Error fetching flagged issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveIssue = async (issue) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(
        `/api/progress-updates/${issue.progressUpdateId}/issues/${issue._id}/resolve`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resolvedBy: currentUser?.id || currentUser?._id
          })
        }
      );

      if (response.ok) {
        alert('Issue resolved successfully');
        fetchFlaggedIssues(); // Refresh the list
      } else {
        alert('Error resolving issue');
      }
    } catch (error) {
      console.error('Error resolving issue:', error);
      alert('Error resolving issue');
    }
  };

  const getIssueAge = (flaggedAt) => {
    const days = Math.floor((new Date() - new Date(flaggedAt)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const getIssuePriority = (days) => {
    if (days >= 7) return 'high';
    if (days >= 3) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-brown-primary flex items-center gap-2">
          <FaExclamationTriangle className="text-red-500" />
          Flagged Issues
          {flaggedIssues.length > 0 && (
            <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm">
              {flaggedIssues.filter(issue => !issue.resolved).length} unresolved
            </span>
          )}
        </h3>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brown-primary"
          >
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
            <option value="all">All Issues</option>
          </select>
        </div>
      </div>

      {flaggedIssues.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FaCheck className="mx-auto mb-2 text-3xl text-green-500" />
          <p>No {filter === 'all' ? '' : filter} issues found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {flaggedIssues.map((issue) => {
            const days = Math.floor((new Date() - new Date(issue.flaggedAt)) / (1000 * 60 * 60 * 24));
            const priority = getIssuePriority(days);
            
            return (
              <div
                key={issue._id}
                className={`border rounded-lg p-4 ${getPriorityColor(priority)} ${
                  issue.resolved ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">
                        {issue.projectName}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        Flagged {getIssueAge(issue.flaggedAt)}
                      </span>
                      {!issue.resolved && days >= 3 && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                          {days >= 7 ? 'Critical' : 'Attention Needed'}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-3">{issue.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FaUser size={12} />
                        <span>{issue.submittedBy?.username || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt size={12} />
                        <span>{new Date(issue.flaggedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaFileAlt size={12} />
                        <span>{issue.summary}</span>
                      </div>
                    </div>

                    {issue.resolved && (
                      <div className="mt-2 text-sm text-green-600">
                        ✓ Resolved on {new Date(issue.resolvedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setSelectedIssue(selectedIssue === issue._id ? null : issue._id)}
                      className="text-brown-primary hover:text-brown-secondary text-sm underline"
                    >
                      {selectedIssue === issue._id ? 'Hide Details' : 'View Details'}
                    </button>
                    
                    {!issue.resolved && (
                      <button
                        onClick={() => resolveIssue(issue)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>

                {selectedIssue === issue._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h5 className="font-medium text-gray-800 mb-2">Progress Update Context:</h5>
                      <p className="text-sm text-gray-600 mb-2">{issue.summary}</p>
                      
                      <div className="text-xs text-gray-500">
                        <p><strong>Progress Update ID:</strong> {issue.progressUpdateId}</p>
                        <p><strong>Project:</strong> {issue.projectName}</p>
                        <p><strong>Submitted by:</strong> {issue.submittedBy?.username}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Weekly Report Integration Notice */}
      {filter === 'unresolved' && flaggedIssues.filter(issue => !issue.resolved).length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <FaFileAlt className="text-blue-600 mt-1" />
            <div>
              <h4 className="font-medium text-blue-800">Weekly Report Integration</h4>
              <p className="text-sm text-blue-600 mt-1">
                These unresolved issues will be automatically included in your weekly team report. 
                You can decide which issues to escalate to project managers during the report generation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
