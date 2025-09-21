import React, { useState, useEffect } from 'react';

export default function ResourceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        // Get first project for demo
        const projRes = await fetch(`http://localhost:4000/api/projects`);
        const projects = await projRes.json();
        const firstProject = projects[0];
        
        if (firstProject) {
          const reqRes = await fetch(`http://localhost:4000/api/project/${firstProject._id}`);
          const reqData = await reqRes.json();
          setRequests(reqData);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching requests:', error);
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  if (loading) return <div className="p-8 text-brown-primary">Loading resource requests...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-brown-primary mb-6">Resource Requests Management</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-brown-secondary">Material Requests</h3>
          <button className="bg-brown-primary text-white px-4 py-2 rounded hover:bg-brown-secondary">
            New Request
          </button>
        </div>
        
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request, index) => (
              <div key={request._id || index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-brown-primary">Request #{index + 1}</h4>
                  <span className={`px-2 py-1 text-xs rounded ${
                    request.status === 'Pending' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>Items:</strong> {request.items?.length || 0} items requested</p>
                  <p><strong>Created:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                  {request.warehouseNote && (
                    <p><strong>Notes:</strong> {request.warehouseNote}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No resource requests found.</p>
        )}
      </div>
    </div>
  );
}