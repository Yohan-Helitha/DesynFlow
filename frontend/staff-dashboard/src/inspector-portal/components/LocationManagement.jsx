import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LocationHistory from './LocationHistory';
import AssignmentActions from './AssignmentActions';
import InspectionStatusUpdates from './InspectionStatusUpdates';

const LocationManagement = ({ inspector, setMessage }) => {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('available');
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [loadingAssignment, setLoadingAssignment] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handle assignment action completion (accept/decline)
  const handleAssignmentAction = (action, assignment, reason = null) => {
    console.log(`Assignment ${action}:`, assignment, reason ? `Reason: ${reason}` : '');
    // Trigger refresh of data
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle status updates
  const handleStatusUpdate = (newStatus) => {
    console.log('Status updated to:', newStatus);
    // Trigger refresh of data
    setRefreshTrigger(prev => prev + 1);
  };

  // Reverse geocoding: Convert coordinates to readable address
  const getAddressFromCoordinates = async (lat, lng) => {
    if (!lat || !lng) return 'Address not available';
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        // Extract key parts for a cleaner address
        const address = data.address || {};
        const parts = [];
        
        if (address.house_number) parts.push(address.house_number);
        if (address.road) parts.push(address.road);
        if (address.suburb || address.neighbourhood) parts.push(address.suburb || address.neighbourhood);
        if (address.city || address.town) parts.push(address.city || address.town);
        
        return parts.length > 0 ? parts.join(', ') : data.display_name;
      } else {
        return 'Address not found';
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Address lookup failed';
    }
  };

  // Fetch current assignment (property location where inspector needs to go)
  const fetchCurrentAssignment = async () => {
    if (!inspector || (!inspector._id && !inspector.id)) {
      return;
    }

    setLoadingAssignment(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token - skipping assignment fetch');
        return;
      }

      // Fetch assignments for this inspector
      const response = await axios.get(
        `http://localhost:4000/api/assignment/inspector/${inspector._id || inspector.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.length > 0) {
        // Get the most recent assignment that's not completed
        const activeAssignment = response.data.find(
          assignment => assignment.status === 'assigned' || assignment.status === 'in-progress'
        );
        
        if (activeAssignment && activeAssignment.InspectionRequest_ID) {
          setCurrentAssignment(activeAssignment);
        }
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      // Don't show error message for assignment fetch failures
    } finally {
      setLoadingAssignment(false);
    }
  };

  // Get current location data
  const fetchLocation = async () => {
    if (!inspector || (!inspector._id && !inspector.id)) {
      console.log('No inspector data available for location fetch');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setMessage('❌ Authentication required. Please login to view location data.');
        return;
      }
      
      const response = await axios.get(
        `http://localhost:4000/api/inspector-location/${inspector._id || inspector.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data) {
        setLocation(response.data);
        setStatus(response.data.status);
        
        // If location exists but no address, fetch address from coordinates
        if (response.data.inspector_latitude && response.data.inspector_longitude && !response.data.current_address) {
          console.log('Location found but no address - fetching address from coordinates');
          const address = await getAddressFromCoordinates(
            response.data.inspector_latitude, 
            response.data.inspector_longitude
          );
          
          // Update the location state with the fetched address
          setLocation(prev => ({
            ...prev,
            current_address: address
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      if (error.response?.status === 401) {
        setMessage('❌ Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        console.log('No location data found for inspector - this is normal for new inspectors');
        // This is normal for new inspectors
      } else {
        setMessage('❌ Failed to fetch location data. Please try again.');
      }
    }
  };

  useEffect(() => {
    if (inspector && (inspector._id || inspector.id)) {
      fetchLocation();
      fetchCurrentAssignment(); // Also fetch current assignment
    } else {
      console.log('Inspector data not ready yet, skipping location fetch');
    }
  }, [inspector, refreshTrigger]);

  // Update availability status
  const updateStatus = async (newStatus) => {
    if (!inspector || (!inspector._id && !inspector.id)) {
      setMessage('❌ Inspector profile not loaded. Please refresh the page.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setMessage('❌ Authentication required. Please login to update status.');
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
            address: location.current_address, // Include current address
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

      {/* My Current GPS Location */}
      <div className="bg-cream-light rounded-lg p-6 border border-brown-primary-300">
        <h3 className="text-lg font-semibold text-brown-primary mb-4">📍 My Current GPS Location</h3>
        
        {location ? (
          <div className="mb-4 space-y-3">
            {/* Address Display */}
            {location.current_address ? (
              <div className="bg-cream-primary rounded-lg p-3 border border-green-primary">
                <p className="text-brown-primary font-medium">
                  📮 <span className="font-semibold">Address:</span> {location.current_address}
                </p>
              </div>
            ) : (
              /* Old/Seed Location Data - Automatic Update Message */
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-300">
                <p className="text-blue-800 text-sm font-medium mb-1">
                  ℹ️ Location will update automatically
                </p>
                <p className="text-blue-600 text-xs mb-2">
                  Your location will be automatically updated when a Customer Service Representative assigns you to a new property
                </p>
              </div>
            )}
            
            {/* Coordinates Display */}
            <div className="text-sm text-brown-secondary space-y-1">
              <p>
                🎯 <span className="font-medium">Coordinates:</span> 
                <span className="font-mono ml-1">
                  ({location.inspector_latitude}, {location.inspector_longitude})
                </span>
              </p>
              {location.updateAt && (
                <p>
                  ⏰ <span className="font-medium">Last Updated:</span> 
                  <span className="ml-1">
                    {new Date(location.updateAt).toLocaleString()}
                  </span>
                </p>
              )}
            </div>
          </div>
        ) : (
          /* No Location Data */
          <div className="bg-cream-light rounded-lg p-4 border border-brown-primary">
            <p className="text-brown-primary font-medium mb-2">📍 No location data available</p>
            <p className="text-brown-secondary text-sm">
              Your location will be set automatically when a Customer Service Representative assigns you to a property
            </p>
          </div>
        )}

        <div className="bg-cream-light rounded-lg p-4 border border-brown-primary">
          <p className="text-brown-primary font-medium mb-2">ℹ️ Automatic Location Updates</p>
          <p className="text-brown-secondary text-sm">
            Your location is automatically updated when Customer Service Representatives assign you to properties. 
            This ensures you're always positioned at your current work assignment.
          </p>
        </div>
      </div>

      {/* Current Work Assignment */}
      <div className="bg-cream-light rounded-lg p-6 border border-brown-primary">
        <h3 className="text-lg font-semibold text-brown-primary mb-4">🎯 Current Work Assignment</h3>
        
        {loadingAssignment ? (
          <div className="text-center py-4">
            <p className="text-brown-secondary">⏳ Loading assignment...</p>
          </div>
        ) : currentAssignment && currentAssignment.InspectionRequest_ID ? (
          <div className="space-y-3">
            {/* Property Information */}
            <div className="bg-white rounded-lg p-4 border border-brown-primary">
              <h4 className="font-semibold text-brown-primary mb-2">📋 Property Details</h4>
              
              {currentAssignment.InspectionRequest_ID.property_full_address ? (
                <p className="text-brown-secondary mb-2">
                  📮 <span className="font-medium">Property Address:</span><br />
                  <span className="ml-4">{currentAssignment.InspectionRequest_ID.property_full_address}</span>
                </p>
              ) : (
                <p className="text-brown-secondary mb-2">
                  📮 <span className="font-medium">Property Address:</span><br />
                  <span className="ml-4">{currentAssignment.InspectionRequest_ID.propertyLocation_address}, {currentAssignment.InspectionRequest_ID.propertyLocation_city}</span>
                </p>
              )}
              
              <p className="text-brown-tertiary text-sm">
                🏢 <span className="font-medium">Type:</span> {currentAssignment.InspectionRequest_ID.propertyType}
              </p>
              <p className="text-brown-tertiary text-sm">
                👤 <span className="font-medium">Client:</span> {currentAssignment.InspectionRequest_ID.client_name}
              </p>
              
              {currentAssignment.InspectionRequest_ID.property_latitude && currentAssignment.InspectionRequest_ID.property_longitude && (
                <p className="text-brown-tertiary text-xs font-mono mt-2">
                  🎯 Coordinates: ({currentAssignment.InspectionRequest_ID.property_latitude}, {currentAssignment.InspectionRequest_ID.property_longitude})
                </p>
              )}
            </div>
            
            {/* Assignment Status */}
            <div className="bg-cream-primary rounded-lg p-3 border border-brown-primary">
              <p className="text-brown-primary text-sm">
                📌 <span className="font-medium">Assignment Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                  currentAssignment.status === 'assigned' 
                    ? 'bg-cream-secondary text-brown-primary'
                    : 'bg-soft-green text-green-primary'
                }`}>
                  {currentAssignment.status.charAt(0).toUpperCase() + currentAssignment.status.slice(1)}
                </span>
              </p>
              <p className="text-brown-tertiary text-xs mt-1">
                ⏰ Assigned: {new Date(currentAssignment.assignAt).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          /* No Assignment */
          <div className="text-center py-4">
            <p className="text-brown-primary font-medium mb-2">✅ No active assignments</p>
            <p className="text-brown-secondary text-sm">
              You're available for new inspection assignments
            </p>
          </div>
        )}
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

      {/* Assignment Actions (Accept/Decline) */}
      {currentAssignment && (
        <div className="mb-6">
          <AssignmentActions 
            assignment={currentAssignment}
            onActionComplete={handleAssignmentAction}
          />
        </div>
      )}

      {/* Inspection Status Updates */}
      {currentAssignment && (
        <div className="mb-6">
          <InspectionStatusUpdates 
            assignment={currentAssignment}
            inspector={inspector}
            onStatusUpdate={handleStatusUpdate}
          />
        </div>
      )}

      {/* Location History */}
      <div className="mb-6">
        <LocationHistory inspector={inspector} key={refreshTrigger} />
      </div>

      {/* Instructions */}
      <div className="bg-cream-primary rounded-lg p-4 border border-brown-primary-300">
        <h3 className="text-sm font-semibold text-brown-primary mb-2">💡 How Location Management Works:</h3>
        <ul className="text-sm text-brown-secondary space-y-1">
          <li>• Your location updates automatically when CSR assigns you to properties</li>
          <li>• Set your availability status (Available/Unavailable)</li>
          <li>• Status automatically becomes "Busy" when assigned to work</li>
          <li>• Distance calculations are handled by Finance team for cost tracking</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationManagement;
