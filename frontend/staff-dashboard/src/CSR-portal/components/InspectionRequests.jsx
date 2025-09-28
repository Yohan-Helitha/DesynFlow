import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InspectionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch inspection requests
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:4000/api/inspection-request/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Description */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Inspection Requests</h2>
        <p className="text-gray-600">Cards display client name, property location, and preferred date. Click "View Details" for complete information.</p>
      </div>
      
      {/* Request Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((request) => (
          <div 
            key={request._id} 
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300 transform hover:scale-[1.02]"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Request</span>
              </div>
              <div className="text-xs text-gray-500">
                ID: {request._id.slice(-6)}
              </div>
            </div>

            {/* Main Card Content - Only Required Fields */}
            <div className="space-y-4 mb-6">
              {/* Client Name */}
              <div className="bg-gray-50 rounded-lg p-3">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                  👤 Client Name
                </label>
                <p className="text-lg font-bold text-gray-900">{request.clientName || 'N/A'}</p>
              </div>
              
              {/* Property Location */}
              <div className="bg-gray-50 rounded-lg p-3">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                  📍 Property Location
                </label>
                <p className="text-gray-800 font-medium">{request.propertyAddress || 'N/A'}</p>
              </div>
              
              {/* Preferred Date */}
              <div className="bg-gray-50 rounded-lg p-3">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                  📅 Preferred Date
                </label>
                <p className="text-gray-800 font-medium">
                  {request.preferredDate 
                    ? new Date(request.preferredDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short', 
                        day: 'numeric'
                      })
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
            
            {/* View Details Button */}
            <button
              onClick={() => handleViewDetails(request)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              View Details →
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {requests.length === 0 && !loading && (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Inspection Requests</h3>
          <p className="text-gray-500">New inspection requests will appear here</p>
        </div>
      )}

      {/* Enhanced Modal for detailed view */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Complete Request Details</h3>
                <p className="text-gray-600 mt-1">All information about this inspection request</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Primary Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <label className="text-sm font-semibold text-blue-800 block mb-2">👤 Client Name</label>
                  <p className="text-lg font-bold text-gray-900">{selectedRequest.clientName}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <label className="text-sm font-semibold text-green-800 block mb-2">📧 Email Address</label>
                  <p className="text-gray-900">{selectedRequest.email}</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <label className="text-sm font-semibold text-purple-800 block mb-2">📞 Phone Number</label>
                  <p className="text-gray-900">{selectedRequest.phone}</p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <label className="text-sm font-semibold text-orange-800 block mb-2">🏠 Property Type</label>
                  <p className="text-gray-900 capitalize">{selectedRequest.propertyType}</p>
                </div>
              </div>

              {/* Property Address */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label className="text-sm font-semibold text-gray-800 block mb-2">📍 Property Address</label>
                <p className="text-gray-900 text-lg">{selectedRequest.propertyAddress}</p>
              </div>

              {/* Date and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                  <label className="text-sm font-semibold text-indigo-800 block mb-2">📅 Preferred Date</label>
                  <p className="text-gray-900 text-lg">
                    {new Date(selectedRequest.preferredDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <label className="text-sm font-semibold text-yellow-800 block mb-2">📊 Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                    selectedRequest.status === 'pending' 
                      ? 'bg-yellow-200 text-yellow-800'
                      : selectedRequest.status === 'approved'
                      ? 'bg-green-200 text-green-800'
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>
              
              {/* Special Requests */}
              {selectedRequest.specialRequests && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <label className="text-sm font-semibold text-red-800 block mb-2">⚠️ Special Requests</label>
                  <p className="text-gray-900">{selectedRequest.specialRequests}</p>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                className="bg-gray-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300"
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