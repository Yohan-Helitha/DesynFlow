import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InspectorAssignmentWithDistance = ({ inspectionRequestId, onAssignmentComplete }) => {
  const [availableInspectors, setAvailableInspectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState('');
  const [propertyInfo, setPropertyInfo] = useState(null);

  // Fetch available inspectors with distances
  const fetchAvailableInspectors = async () => {
    if (!inspectionRequestId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:4000/api/assignment/available-inspectors/${inspectionRequestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAvailableInspectors(response.data.availableInspectors);
      setPropertyInfo(response.data.property);
      setMessage(`Found ${response.data.totalInspectors} available inspectors (${response.data.inspectorsWithinLimit} within 35km limit)`);
    } catch (error) {
      console.error('Error fetching available inspectors:', error);
      setMessage('❌ Failed to fetch available inspectors');
    } finally {
      setLoading(false);
    }
  };

  // Assign inspector to the inspection request
  const handleAssignInspector = async (inspectorId) => {
    setAssigning(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:4000/api/assignment/assign',
        {
          inspectionRequestId: inspectionRequestId,
          inspectorId: inspectorId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage(`✅ Inspector assigned successfully! Distance: ${response.data.distanceInfo?.calculated}km`);
      
      if (onAssignmentComplete) {
        onAssignmentComplete(response.data);
      }
      
      // Refresh the list
      fetchAvailableInspectors();
    } catch (error) {
      console.error('Error assigning inspector:', error);
      if (error.response?.data?.message) {
        setMessage(`❌ ${error.response.data.message}`);
      } else {
        setMessage('❌ Failed to assign inspector');
      }
    } finally {
      setAssigning(false);
    }
  };

  useEffect(() => {
    fetchAvailableInspectors();
  }, [inspectionRequestId]);

  if (!inspectionRequestId) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">Select an inspection request to see available inspectors</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Assign Inspector with Distance Validation</h3>
      
      {/* Property Information */}
      {propertyInfo && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">🏠 Property Location</h4>
          <p className="text-blue-700">{propertyInfo.address}</p>
          {propertyInfo.coordinates.latitude && propertyInfo.coordinates.longitude && (
            <p className="text-sm text-blue-600 mt-1">
              📍 {propertyInfo.coordinates.latitude}, {propertyInfo.coordinates.longitude}
            </p>
          )}
        </div>
      )}

      {/* Status Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 
          message.includes('❌') ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message}
        </div>
      )}

      {/* Refresh Button */}
      <div className="mb-4">
        <button
          onClick={fetchAvailableInspectors}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : '🔄 Refresh Available Inspectors'}
        </button>
      </div>

      {/* Available Inspectors List */}
      {loading ? (
        <div className="text-center py-8">Loading available inspectors...</div>
      ) : availableInspectors.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No available inspectors found</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800">Available Inspectors (sorted by distance):</h4>
          {availableInspectors.map((item, index) => (
            <InspectorCard
              key={item.inspector._id}
              inspector={item.inspector}
              location={item.location}
              distance={item.distance}
              rank={index + 1}
              onAssign={() => handleAssignInspector(item.inspector._id)}
              isAssigning={assigning}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const InspectorCard = ({ inspector, location, distance, rank, onAssign, isAssigning }) => {
  const isWithinLimit = distance.withinLimit;
  const distanceValue = distance.calculated;

  return (
    <div className={`border rounded-lg p-4 ${
      isWithinLimit ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
    }`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Inspector Info */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              {rank}
            </span>
            <h5 className="font-semibold text-gray-800">{inspector.username}</h5>
          </div>
          <p className="text-sm text-gray-600">{inspector.email}</p>
          <p className="text-sm text-gray-600">{inspector.phone}</p>
        </div>

        {/* Location Info */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">📍 Current Location:</p>
          <p className="text-sm text-gray-600">{location.address || 'Address not available'}</p>
          <p className="text-xs text-gray-500">Region: {location.region}</p>
        </div>

        {/* Distance Info */}
        <div className="text-center">
          <div className={`inline-block px-3 py-2 rounded-lg ${
            isWithinLimit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <p className="font-bold text-lg">{distanceValue} km</p>
            <p className="text-xs">
              {isWithinLimit ? '✅ Within Limit' : '❌ Too Far'}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1">Max: {distance.maxAllowed}km</p>
        </div>

        {/* Action Button */}
        <div className="text-center">
          {isWithinLimit ? (
            <button
              onClick={onAssign}
              disabled={isAssigning}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAssigning ? 'Assigning...' : '✅ Assign Inspector'}
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-400 text-gray-700 px-4 py-2 rounded-lg cursor-not-allowed"
            >
              ❌ Beyond 35km Limit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectorAssignmentWithDistance;