import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InspectionRequests = ({ csr, onAuthError }) => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch inspection requests
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Simple check: if no token, redirect to login
      if (!token) {
        console.error('No auth token found in InspectionRequests');
        if (onAuthError) onAuthError();
        return;
      }
      
      const response = await axios.get('/api/inspection-request/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Inspection Requests Data:', response.data);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        console.error('Authentication failed in InspectionRequests');
        if (onAuthError) onAuthError();
        return;
      }
      
      // Set empty array for other errors - will show "No Inspection Requests"
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
  };

  const closeModal = () => {
    setSelectedRequest(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Description */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-dark-brown mb-2">Inspection Requests</h2>
        <p className="text-brown-secondary">Cards display client name, property location, and preferred date. Click "View Details" for complete information.</p>
      </div>
      
      {/* Request Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((request) => (
          <div 
            key={request._id} 
            className="bg-cream-primary rounded-xl shadow-lg border border-cream-light p-6 hover:shadow-xl transition-shadow duration-300 transform hover:scale-[1.02]"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-primary rounded-full"></div>
                <span className="text-xs font-medium text-green-primary uppercase tracking-wide">Request</span>
              </div>
              <div className="text-xs text-brown-secondary">
                ID: {request._id.slice(-6)}
              </div>
            </div>

            {/* Main Card Content */}
            <div className="space-y-4 mb-6">
              {/* Client Name */}
              <div className="bg-cream-light rounded-lg p-3">
                <label className="text-xs font-semibold text-brown-primary uppercase tracking-wide block mb-1">
                  👤 Client Name
                </label>
                <p className="text-lg font-bold text-dark-brown">{request.client_name || 'N/A'}</p>
              </div>
              
              {/* Property Location */}
              <div className="bg-cream-light rounded-lg p-3">
                <label className="text-xs font-semibold text-brown-primary uppercase tracking-wide block mb-1">
                  📍 Property Location
                </label>
                <p className="text-dark-brown font-medium">{request.propertyLocation_address || 'N/A'}</p>
              </div>
              
              {/* Preferred Date */}
              <div className="bg-cream-light rounded-lg p-3">
                <label className="text-xs font-semibold text-brown-primary uppercase tracking-wide block mb-1">
                  📅 Preferred Date
                </label>
                <p className="text-dark-brown font-medium">
                  {request.inspection_date 
                    ? new Date(request.inspection_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short', 
                        day: 'numeric'
                      })
                    : 'N/A'
                  }
                </p>
              </div>
              
              {/* Status */}
              <div className="bg-cream-light rounded-lg p-3">
                <label className="text-xs font-semibold text-brown-primary uppercase tracking-wide block mb-1">
                  🔄 Status
                </label>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    request.status === 'pending' ? 'bg-yellow-500' :
                    request.status === 'assigned' ? 'bg-blue-500' :
                    request.status === 'in-progress' ? 'bg-orange-500' :
                    request.status === 'completed' ? 'bg-green-500' :
                    request.status === 'cancelled' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`}></div>
                  <span className={`text-sm font-medium capitalize ${
                    request.status === 'pending' ? 'text-yellow-600' :
                    request.status === 'assigned' ? 'text-blue-600' :
                    request.status === 'in-progress' ? 'text-orange-600' :
                    request.status === 'completed' ? 'text-green-600' :
                    request.status === 'cancelled' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {request.status || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* View Details Button */}
            <button
              onClick={() => handleViewDetails(request)}
              className="w-full bg-gradient-to-r from-green-primary to-green-secondary text-cream-primary py-3 px-4 rounded-lg font-semibold hover:from-green-secondary hover:to-soft-green transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-green-primary/40"
            >
              View Details →
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {requests.length === 0 && !loading && (
        <div className="text-center py-16 bg-cream-light rounded-xl border-2 border-dashed border-brown-secondary">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-dark-brown mb-2">No Inspection Requests</h3>
          <p className="text-brown-secondary">New inspection requests will appear here</p>
        </div>
      )}

      {/* Enhanced Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-cream-primary rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-cream-light bg-gradient-to-r from-cream-light to-cream-primary">
              <div>
                <h3 className="text-2xl font-bold text-dark-brown">Complete Request Details</h3>
                <p className="text-brown-secondary mt-1">All information about this inspection request</p>
              </div>
              <button
                onClick={closeModal}
                className="text-brown-secondary hover:text-dark-brown hover:bg-cream-light p-2 rounded-full transition-colors"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Primary Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-cream-light rounded-lg p-4 border border-green-primary/30">
                  <label className="text-sm font-semibold text-green-primary block mb-2">👤 Client Name</label>
                  <p className="text-lg font-bold text-dark-brown">{selectedRequest.client_name}</p>
                </div>
                
                <div className="bg-cream-light rounded-lg p-4 border border-green-secondary/30">
                  <label className="text-sm font-semibold text-green-secondary block mb-2">📧 Email Address</label>
                  <p className="text-dark-brown">{selectedRequest.email}</p>
                </div>
                
                <div className="bg-cream-light rounded-lg p-4 border border-brown-primary-300/30">
                  <label className="text-sm font-semibold text-brown-primary-300 block mb-2">📞 Phone Number</label>
                  <p className="text-dark-brown">{selectedRequest.phone_number}</p>
                </div>
                
                <div className="bg-cream-light rounded-lg p-4 border border-warm-brown/30">
                  <label className="text-sm font-semibold text-warm-brown block mb-2">🏠 Property Type</label>
                  <p className="text-dark-brown capitalize">{selectedRequest.propertyType}</p>
                </div>
              </div>

              {/* Property Address */}
              <div className="bg-cream-light rounded-lg p-4 border border-cream-light">
                <label className="text-sm font-semibold text-brown-primary block mb-2">📍 Property Address</label>
                <p className="text-dark-brown text-lg">{selectedRequest.propertyLocation_address}</p>
              </div>

              {/* Date and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-cream-light rounded-lg p-4 border border-green-primary/30">
                  <label className="text-sm font-semibold text-green-primary block mb-2">📅 Preferred Date</label>
                  <p className="text-dark-brown text-lg">
                    {new Date(selectedRequest.inspection_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="bg-cream-light rounded-lg p-4 border border-soft-green/30">
                  <label className="text-sm font-semibold text-soft-green block mb-2">� Request Status</label>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedRequest.status === 'pending' ? 'bg-yellow-500' :
                      selectedRequest.status === 'assigned' ? 'bg-blue-500' :
                      selectedRequest.status === 'in-progress' ? 'bg-orange-500' :
                      selectedRequest.status === 'completed' ? 'bg-green-500' :
                      selectedRequest.status === 'cancelled' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`}></div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                      selectedRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                      selectedRequest.status === 'assigned' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                      selectedRequest.status === 'in-progress' ? 'bg-orange-100 text-orange-700 border border-orange-300' :
                      selectedRequest.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-300' :
                      selectedRequest.status === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-300' :
                      'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}>
                      {selectedRequest.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Special Requests */}
              {selectedRequest.specialRequests && (
                <div className="bg-cream-light rounded-lg p-4 border border-red-brown/30">
                  <label className="text-sm font-semibold text-red-brown block mb-2">⚠️ Special Requests</label>
                  <p className="text-dark-brown">{selectedRequest.specialRequests}</p>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-cream-light bg-cream-light">
              <button
                onClick={closeModal}
                className="bg-dark-brown text-cream-primary py-2 px-6 rounded-lg font-semibold hover:bg-brown-primary transition-colors focus:outline-none focus:ring-4 focus:ring-soft-green/40"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionRequests;

