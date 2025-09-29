import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LocationManagement = ({ inspector, setMessage }) => {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('available');
  const [updating, setUpdating] = useState(false);

  // Get current location data
  const fetchLocation = async () => {
    if (!inspector || (!inspector._id && !inspector.id)) {
      console.log('No inspector data available for location fetch');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token available - using fallback mode');
        // Don't show error message in fallback mode
        return;
      }
      
      const response = await axios.get(
        `http://localhost:4000/api/inspector-location/${inspector._id || inspector.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data) {
        setLocation(response.data);
        setStatus(response.data.status);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      if (error.response?.status === 401) {
        console.log('Authentication failed - using fallback mode');
        // Don't show error message in development fallback mode
      } else if (error.response?.status === 404) {
        console.log('No location data found for inspector - this is normal for new inspectors');
        // Don't show error message for 404 - it's normal for new inspectors
      } else {
        console.error('Failed to fetch location:', error.message);
        // Don't show error message for location fetch failures in development
      }
    }
  };

  useEffect(() => {
    if (inspector && (inspector._id || inspector.id)) {
      fetchLocation();
    } else {
      console.log('Inspector data not ready yet, skipping location fetch');
    }
  }, [inspector]);

  // Update location with GPS
  const updateLocation = async () => {
    if (!inspector || (!inspector._id && !inspector.id)) {
      setMessage('❌ Inspector profile not loaded. Please refresh the page.');
      return;
    }
    
    if (!navigator.geolocation) {
      setMessage('❌ GPS not supported by your browser.');
      return;
    }

    setUpdating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const token = localStorage.getItem('authToken');
          if (!token) {
            setMessage('ℹ️ In demo mode - location update simulated.');
            setUpdating(false);
            return;
          }
          
          await axios.post(
            'http://localhost:4000/api/inspector-location/update',
            {
              inspectorId: inspector._id || inspector.id,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              status: status
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          setMessage('✅ Location updated successfully!');
          fetchLocation();
        } catch (error) {
          console.error('Error updating location:', error);
          if (error.response?.status === 401) {
            setMessage('❌ Authentication failed. Please login again.');
          } else if (error.response?.status === 400) {
            setMessage('❌ Invalid location data. Please try again.');
          } else {
            setMessage('❌ Failed to update location.');
          }
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
    if (!inspector || (!inspector._id && !inspector.id)) {
      setMessage('❌ Inspector profile not loaded. Please refresh the page.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setStatus(newStatus);
        setMessage(`ℹ️ Demo mode - status changed to ${newStatus}`);
        return;
      }

      setStatus(newStatus);
      
      if (location) {
        // Use the existing update endpoint with current location data
        await axios.post(
          'http://localhost:4000/api/inspector-location/update',
          {
            inspectorId: inspector._id || inspector.id,
            lat: location.inspector_latitude,
            lng: location.inspector_longitude,
            status: newStatus
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setMessage(`✅ Status updated to ${newStatus}`);
        fetchLocation();
      } else {
        setMessage('❌ Please update your location first before changing status.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      if (error.response?.status === 401) {
        setMessage('❌ Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        setMessage('❌ Location not found. Please update your location first.');
      } else {
        setMessage('❌ Failed to update status. Please try again.');
      }
    }
  };

  if (!inspector) {
    return (
      <div className="p-6 bg-cream-light rounded-lg border border-brown-primary-300">
        <div className="text-center">
          <div className="text-brown-primary mb-2">⏳ Loading inspector data...</div>
          <div className="text-sm text-brown-secondary">Please wait while we fetch your profile information.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-brown-primary mb-2">📍 Location Management</h2>
        <p className="text-brown-secondary">Update your location and availability status</p>
      </div>

      {/* Current Location */}
      <div className="bg-cream-light rounded-lg p-6 border border-brown-primary-300">
        <h3 className="text-lg font-semibold text-brown-primary mb-4">Current Location</h3>
        
        {location ? (
          <div className="mb-4">
            <p className="text-brown-secondary">
              📍 Latitude: <span className="font-mono">{location.inspector_latitude}</span>
            </p>
            <p className="text-brown-secondary">
              📍 Longitude: <span className="font-mono">{location.inspector_longitude}</span>
            </p>
          </div>
        ) : (
          <p className="text-brown-secondary mb-4">No location data available</p>
        )}

        <button
          onClick={updateLocation}
          disabled={updating}
          className={`w-full py-3 px-4 rounded-lg font-semibold ${
            updating
              ? 'bg-brown-primary-300 text-cream-primary cursor-not-allowed'
              : 'bg-green-primary text-cream-primary hover:bg-soft-green'
          }`}
        >
          {updating ? 'Updating Location...' : '📍 Update My Location'}
        </button>
      </div>

      {/* Availability Status */}
      <div className="bg-cream-light rounded-lg p-6 border border-green-primary">
        <h3 className="text-lg font-semibold text-green-primary mb-4">Availability Status</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => updateStatus('available')}
            className={`p-4 rounded-lg border-2 text-center ${
              status === 'available'
                ? 'border-green-primary bg-soft-green text-brown-primary'
                : 'border-brown-primary-300 bg-cream-primary text-brown-secondary hover:border-green-primary'
            }`}
          >
            <div className="text-2xl mb-1">✅</div>
            <div className="font-semibold">Available</div>
          </button>

          <button
            onClick={() => updateStatus('unavailable')}
            className={`p-4 rounded-lg border-2 text-center ${
              status === 'unavailable'
                ? 'border-red-primary bg-red-light text-red-primary'
                : 'border-brown-primary-300 bg-cream-primary text-brown-secondary hover:border-red-primary'
            }`}
          >
            <div className="text-2xl mb-1">❌</div>
            <div className="font-semibold">Unavailable</div>
          </button>
        </div>

        {/* Current Status */}
        <div className="bg-cream-primary rounded-lg p-3 border border-green-primary">
          <span className="text-sm font-semibold text-brown-primary">Current Status: </span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            status === 'available' 
              ? 'bg-soft-green text-green-primary'
              : status === 'busy'
              ? 'bg-yellow-light text-yellow-primary'
              : 'bg-red-light text-red-primary'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-cream-primary rounded-lg p-4 border border-brown-primary-300">
        <h3 className="text-sm font-semibold text-brown-primary mb-2">💡 Instructions:</h3>
        <ul className="text-sm text-brown-secondary space-y-1">
          <li>• Click "Update My Location" to share your GPS coordinates</li>
          <li>• Set your availability status (Available/Unavailable)</li>
          <li>• Status automatically becomes "Busy" when assigned to work</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationManagement;
