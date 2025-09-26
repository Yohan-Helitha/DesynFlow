import React, { useState, useEffect } from 'react';
import CreateMaterialRequestForm from './CreateMaterialRequestForm';

export default function ResourceRequests({ project, leaderId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editRequest, setEditRequest] = useState(null);

  const fetchRequests = async () => {
    if (!project?._id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/material-requests/project/${project._id}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [project]);

  const handleRequestCreated = (newRequest) => {
    if (editRequest) {
      // Update existing request
      setRequests(requests.map(req => 
        req._id === newRequest._id ? newRequest : req
      ));
      setEditRequest(null);
    } else {
      // Add new request
      setRequests([newRequest, ...requests]);
    }
  };

  const handleEditRequest = (request) => {
    setEditRequest(request);
    setShowRequestForm(true);
  };

  const handleDeleteRequest = async (requestId) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/material-requests/${requestId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setRequests(requests.filter(req => req._id !== requestId));
      } else {
        alert('Failed to delete request');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Error deleting request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'PartiallyApproved': return 'bg-blue-100 text-blue-800';
      case 'Fulfilled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-8 text-brown-primary">Loading resource requests...</div>;

  if (!project) {
    return <div className="p-8 text-gray-500">No project selected</div>;
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-brown-primary mb-6">Material Requests</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-brown-secondary">
            Requests for {project.projectName}
          </h3>
          <button 
            onClick={() => setShowRequestForm(true)}
            className="bg-brown-primary text-white px-4 py-2 rounded hover:bg-brown-secondary"
          >
            New Request
          </button>
        </div>
        
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request, index) => (
              <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-brown-primary">Request #{index + 1}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <button
                      onClick={() => handleEditRequest(request)}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(request._id)}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Items:</strong></p>
                  <ul className="ml-4 list-disc">
                    {request.items?.map((item, idx) => (
                      <li key={idx}>{item.itemName} - Qty: {item.qty}</li>
                    ))}
                  </ul>
                  <p><strong>Needed By:</strong> {new Date(request.neededBy).toLocaleDateString()}</p>
                  <p><strong>Created:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                  {request.warehouseNote && (
                    <p><strong>Notes:</strong> {request.warehouseNote}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No material requests found for this project.</p>
            <button 
              onClick={() => setShowRequestForm(true)}
              className="bg-brown-primary text-white px-6 py-2 rounded hover:bg-brown-secondary"
            >
              Create First Request
            </button>
          </div>
        )}
      </div>

      {/* Material Request Form Modal */}
      <CreateMaterialRequestForm
        isOpen={showRequestForm}
        onClose={() => {
          setShowRequestForm(false);
          setEditRequest(null);
        }}
        onRequestCreated={handleRequestCreated}
        project={project}
        leaderId={leaderId}
        editRequest={editRequest}
      />
    </div>
  );
}