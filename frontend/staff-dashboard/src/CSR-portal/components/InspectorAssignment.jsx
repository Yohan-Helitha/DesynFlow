import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const InspectorAssignment = () => {
  const [inspectionRequests, setInspectionRequests] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedInspector, setSelectedInspector] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch pending inspection requests
      const requestsRes = await axios.get(
        'http://localhost:4000/api/inspection-request/list?status=pending',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Fetch available inspectors
      const inspectorsRes = await axios.get(
        'http://localhost:4000/api/inspector-location/all',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Fetch existing assignments
      const assignmentsRes = await axios.get(
        'http://localhost:4000/api/assignment/list',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setInspectionRequests(requestsRes.data);
      setInspectors(inspectorsRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async () => {
    if (!selectedRequest || !selectedInspector) {
      alert('❌ Please select both request and inspector');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        'http://localhost:4000/api/assignment/assign',
        {
          inspectionRequestId: selectedRequest._id,
          inspectorId: selectedInspector._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('✅ Inspector assigned successfully!');
      setSelectedRequest(null);
      setSelectedInspector(null);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error assigning inspector:', error);
      alert('❌ Failed to assign inspector');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!confirm('⚠️ Are you sure you want to delete this assignment?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(
        `http://localhost:4000/api/assignment/${assignmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('✅ Assignment deleted successfully!');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('❌ Failed to delete assignment');
    }
  };

  const handleEditAssignment = (assignment) => {
    // For now, show a simple alert. You can implement a modal for editing later
    alert(`📝 Edit Assignment:\n\nClient: ${assignment.inspectionRequest?.clientName}\nInspector: ${assignment.inspector?.name}\n\n(Edit functionality can be implemented with a modal)`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section Description */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Assign Inspector</h2>
        <p className="text-gray-600">View inspector locations on map, select nearest available inspector. Assignment cards show client name, property location, and inspector name.</p>
      </div>
      
      {/* Assignment Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <h3 className="text-xl font-semibold text-gray-900">Create New Assignment</h3>
        </div>
        
        {/* Select Request */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            📋 Select Inspection Request
          </label>
          <select
            value={selectedRequest?._id || ''}
            onChange={(e) => setSelectedRequest(
              inspectionRequests.find(req => req._id === e.target.value)
            )}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 text-gray-900"
          >
            <option value="">-- Choose Inspection Request --</option>
            {inspectionRequests.map((request) => (
              <option key={request._id} value={request._id}>
                🏠 {request.clientName} - {request.propertyAddress}
              </option>
            ))}
          </select>
        </div>

        {/* Inspector Map */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            🗺️ Select Inspector from Map (View nearest available inspectors)
          </label>
          <div className="h-80 rounded-xl overflow-hidden border-2 border-gray-300 shadow-inner">
            <MapContainer
              center={[7.8731, 80.7718]}
              zoom={7}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {inspectors.map((inspector) => (
                <Marker
                  key={inspector._id}
                  position={[inspector.inspector_latitude, inspector.inspector_longitude]}
                  eventHandlers={{
                    click: () => setSelectedInspector(inspector),
                  }}
                >
                  <Popup>
                    <div className="text-center p-2">
                      <p className="font-semibold text-gray-900 mb-1">
                        👨‍🔧 {inspector.inspector?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600">📞 {inspector.inspector?.phone}</p>
                      <p className="text-sm">
                        Status: <span className={`font-semibold ${
                          inspector.status === 'available' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {inspector.status}
                        </span>
                      </p>
                      <button 
                        onClick={() => setSelectedInspector(inspector)}
                        className="mt-2 bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700"
                      >
                        Select
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          
          {selectedInspector && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-semibold text-purple-800 mb-1">✅ Selected Inspector:</p>
              <p className="text-purple-700">
                👨‍🔧 <strong>{selectedInspector.inspector?.name}</strong> ({selectedInspector.status})
              </p>
              <p className="text-purple-600 text-sm">📞 {selectedInspector.inspector?.phone}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleAssign}
          disabled={!selectedRequest || !selectedInspector}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            !selectedRequest || !selectedInspector
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-purple-300'
          }`}
        >
          {!selectedRequest || !selectedInspector ? '⚠️ Select Both Request & Inspector' : '✅ Assign Inspector'}
        </button>
      </div>

      {/* Current Assignments */}
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <h3 className="text-xl font-semibold text-gray-900">Current Assignments</h3>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
            {assignments.length} Active
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <div 
              key={assignment._id} 
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Assignment</span>
                </div>
                <div className="text-xs text-gray-500">
                  ID: {assignment._id.slice(-6)}
                </div>
              </div>

              {/* Assignment Details - As specified: client name, property location, inspector name */}
              <div className="space-y-4 mb-6">
                {/* Client Name */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <label className="text-xs font-semibold text-blue-800 uppercase tracking-wide block mb-1">
                    👤 Client Name
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {assignment.inspectionRequest?.clientName || 'N/A'}
                  </p>
                </div>
                
                {/* Property Location */}
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <label className="text-xs font-semibold text-green-800 uppercase tracking-wide block mb-1">
                    📍 Property Location
                  </label>
                  <p className="text-gray-800 text-sm">
                    {assignment.inspectionRequest?.propertyAddress || 'N/A'}
                  </p>
                </div>
                
                {/* Inspector Name */}
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <label className="text-xs font-semibold text-purple-800 uppercase tracking-wide block mb-1">
                    👨‍🔧 Inspector Name
                  </label>
                  <p className="text-gray-800 font-semibold">
                    {assignment.inspector?.name || 'N/A'}
                  </p>
                </div>
              </div>
              
              {/* Edit and Delete Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleEditAssignment(assignment)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteAssignment(assignment._id)}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-red-300"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty State for Assignments */}
        {assignments.length === 0 && (
          <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-dashed border-purple-300">
            <div className="text-6xl mb-4">👨‍🔧</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Assignments Found</h3>
            <p className="text-gray-500 mb-4">Create your first assignment using the form above</p>
            <div className="bg-white rounded-lg p-4 max-w-md mx-auto border border-purple-200">
              <p className="text-sm text-purple-700">
                <strong>Tip:</strong> Select a request and click an inspector on the map to create an assignment.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-800 mb-3">💡 How Inspector Assignment Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="text-blue-600 font-semibold mb-1">1. Select Request</div>
            <div className="text-gray-700">Choose pending inspection request from dropdown</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="text-green-600 font-semibold mb-1">2. Choose Inspector</div>
            <div className="text-gray-700">Click inspector marker on map to select nearest available</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="text-purple-600 font-semibold mb-1">3. Manage Assignment</div>
            <div className="text-gray-700">Assignment cards show client, location, inspector with edit/delete</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectorAssignment;