import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LocationManagement = ({ inspector, setMessage }) => {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('available');
  const [updating, setUpdating] = useState(false);

  // Get current location data
  const fetchLocation = async () => {
    if (!inspector) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:4000/api/inspector-location/inspector/${inspector._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data) {
        setLocation(response.data);
        setStatus(response.data.status);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, [inspector]);

  // Update location with GPS
  const updateLocation = async () => {
    if (!navigator.geolocation) {
      setMessage('❌ GPS not supported by browser.');
      return;
    }

    setUpdating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const token = localStorage.getItem('authToken');
          await axios.post(
            'http://localhost:4000/api/inspector-location/update',
            {
              inspectorId: inspector._id,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              status: status
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          setMessage('✅ Location updated successfully!');
          fetchLocation();
        } catch (error) {
          setMessage('❌ Failed to update location.');
        }
        setUpdating(false);
      },
      () => {
        setMessage('❌ Failed to get GPS location.');
        setUpdating(false);
      }
    );
  };

  // Update availability status
  const updateStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      setStatus(newStatus);
      
      if (location) {
        await axios.patch(
          `http://localhost:4000/api/inspector-location/${location._id}`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setMessage(`✅ Status updated to ${newStatus}`);
        fetchLocation();
      }
    } catch (error) {
      setMessage('❌ Failed to update status.');
    }
  };

  if (!inspector) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📍 Location Management</h2>
        <p className="text-gray-600">Update your location and availability status</p>
      </div>

      {/* Current Location */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Current Location</h3>
        
        {location ? (
          <div className="mb-4">
            <p className="text-gray-700">
              📍 Latitude: <span className="font-mono">{location.inspector_latitude}</span>
            </p>
            <p className="text-gray-700">
              📍 Longitude: <span className="font-mono">{location.inspector_longitude}</span>
            </p>
          </div>
        ) : (
          <p className="text-gray-500 mb-4">No location data available</p>
        )}

        <button
          onClick={updateLocation}
          disabled={updating}
          className={`w-full py-3 px-4 rounded-lg font-semibold ${
            updating
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {updating ? 'Updating Location...' : '📍 Update My Location'}
        </button>
      </div>

      {/* Availability Status */}
      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-4">Availability Status</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => updateStatus('available')}
            className={`p-4 rounded-lg border-2 text-center ${
              status === 'available'
                ? 'border-green-500 bg-green-100 text-green-800'
                : 'border-gray-300 bg-white text-gray-600 hover:border-green-300'
            }`}
          >
            <div className="text-2xl mb-1">✅</div>
            <div className="font-semibold">Available</div>
          </button>

          <button
            onClick={() => updateStatus('unavailable')}
            className={`p-4 rounded-lg border-2 text-center ${
              status === 'unavailable'
                ? 'border-red-500 bg-red-100 text-red-800'
                : 'border-gray-300 bg-white text-gray-600 hover:border-red-300'
            }`}
          >
            <div className="text-2xl mb-1">❌</div>
            <div className="font-semibold">Unavailable</div>
          </button>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <span className="text-sm font-semibold text-gray-700">Current Status: </span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            status === 'available' 
              ? 'bg-green-200 text-green-800'
              : status === 'busy'
              ? 'bg-yellow-200 text-yellow-800'
              : 'bg-red-200 text-red-800'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">💡 Instructions:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Click "Update My Location" to share your GPS coordinates</li>
          <li>• Set your availability status (Available/Unavailable)</li>
          <li>• Status automatically becomes "Busy" when assigned to work</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationManagement;