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

// Create custom colored markers
const createColoredIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Color-coded marker icons
const markerIcons = {
  availableInspector: createColoredIcon('blue'),    // 🔵 Blue for available inspectors
  busyInspector: createColoredIcon('yellow'),       // 🟡 Yellow for busy inspectors
  searchedProperty: createColoredIcon('red'),       // 🔴 Red for searched property
  selectedInspector: createColoredIcon('green')     // 🟢 Green for selected inspector
};

const InspectorAssignment = ({ selectedProperty, selectedInspector }) => {
  const [inspectionRequests, setInspectionRequests] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedInspectorFromMap, setSelectedInspectorFromMap] = useState(selectedInspector || null);
  const [selectedInspectorFromDropdown, setSelectedInspectorFromDropdown] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Property search functionality
  const [searchAddress, setSearchAddress] = useState('');
  const [searchedProperty, setSearchedProperty] = useState(selectedProperty || null);
  const [inspectorsWithDistances, setInspectorsWithDistances] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Inspector management
  const [inspectorActions, setInspectorActions] = useState({}); // Track inspector actions {inspectorId: {action: 'accepted/declined', reason: ''}}
  const [pendingAssignments, setPendingAssignments] = useState([]); // Track assignments waiting for inspector response

  // Fetch data
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setInspectionRequests([]);
        setInspectors([]);
        setAssignments([]);
        setLoading(false);
        return;
      }
      
      const requestsRes = await axios.get(
        '/api/inspection-request/all',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const inspectorsRes = await axios.get(
        '/api/inspector-location/all',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const assignmentsRes = await axios.get(
        '/api/assignment/list',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setInspectionRequests(requestsRes.data);
      setInspectors(inspectorsRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setInspectionRequests([]);
      setInspectors([]);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Geocode address to coordinates using Nominatim (OpenStreetMap)
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Sri Lanka')}&limit=1&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const location = data[0];
        return {
          latitude: parseFloat(location.lat),
          longitude: parseFloat(location.lon),
          display_name: location.display_name,
          address: location.address
        };
      } else {
        throw new Error('Address not found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  // Search for property location
  const handlePropertySearch = async () => {
    if (!searchAddress.trim()) {
      setMessage('❌ Please enter a property address');
      return;
    }

    setSearchLoading(true);
    setMessage('🔍 Searching for property location...');

    try {
      const location = await geocodeAddress(searchAddress.trim());
      
      setSearchedProperty({
        address: searchAddress.trim(),
        display_name: location.display_name,
        latitude: location.latitude,
        longitude: location.longitude,
        addressDetails: location.address
      });

      // Calculate distances to all inspectors
      const inspectorsWithDist = inspectors.map(inspector => {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          inspector.inspector_latitude,
          inspector.inspector_longitude
        );

        return {
          ...inspector,
          distanceToProperty: distance,
          withinLimit: distance <= 35 // 35km limit
        };
      });

      // Sort by distance (nearest first)
      inspectorsWithDist.sort((a, b) => a.distanceToProperty - b.distanceToProperty);
      setInspectorsWithDistances(inspectorsWithDist);

      const nearestInspectors = inspectorsWithDist.filter(i => i.withinLimit);
      setMessage(`✅ Found property! ${nearestInspectors.length} inspectors within 35km radius`);

    } catch (error) {
      console.error('Property search error:', error);
      setMessage('❌ Property location not found. Please try a more specific address.');
      setSearchedProperty(null);
      setInspectorsWithDistances([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle inspector selection from map
  const handleInspectorClick = (inspector) => {
    setSelectedInspectorFromMap(inspector);
    setSelectedInspectorFromDropdown(inspector._id); // Sync with dropdown
  };

  // Clear search
  const clearSearch = () => {
    setSearchAddress('');
    setSearchedProperty(null);
    setInspectorsWithDistances([]);
    setSelectedInspectorFromMap(null);
    setMessage('');
  };

  // ✅ PHASE 1: Simulate inspector responses (for testing)
  const simulateInspectorAccept = (inspectorId) => {
    setInspectorActions(prev => ({
      ...prev,
      [inspectorId]: {
        action: 'accepted',
        reason: '',
        timestamp: new Date()
      }
    }));
    
    // ✅ PHASE 1: Update inspector location (simple simulation)
    // In real implementation, this would come from inspector portal
    setMessage('✅ Inspector accepted the assignment! Location will be updated.');
  };

  const simulateInspectorDecline = (inspectorId, reason = 'Schedule conflict') => {
    setInspectorActions(prev => ({
      ...prev,
      [inspectorId]: {
        action: 'declined',
        reason: reason,
        timestamp: new Date()
      }
    }));
    
    setMessage('❌ Inspector declined the assignment.');
  };

  const handleAssign = async () => {
    const finalInspector = selectedInspectorFromMap || inspectors.find(i => i._id === selectedInspectorFromDropdown);
    
    if (!selectedRequest || !finalInspector) {
      alert('❌ Please select both request and inspector');
      return;
    }

    // ✅ PHASE 1: Availability validation
    if (finalInspector.status === 'busy') {
      alert('❌ Cannot assign to busy inspector. Please select an available inspector.');
      return;
    }

    // Check if inspector is within 35km limit for searched property
    if (searchedProperty && selectedInspectorFromMap && !selectedInspectorFromMap.withinLimit) {
      if (!confirm('⚠️ Selected inspector is outside 35km limit. Continue anyway?')) {
        return;
      }
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        '/api/assignment/assign',
        {
          inspectionRequestId: selectedRequest._id,
          inspectorId: finalInspector._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // ✅ PHASE 1: Track pending assignment
      const newPendingAssignment = {
        inspectorId: finalInspector._id,
        requestId: selectedRequest._id,
        assignedAt: new Date(),
        status: 'pending'
      };
      
      setPendingAssignments(prev => [...prev, newPendingAssignment]);
      
      // Update inspector action status to "Assigned (Waiting)"
      setInspectorActions(prev => ({
        ...prev,
        [finalInspector._id]: {
          action: 'assigned',
          reason: 'Waiting for response',
          timestamp: new Date()
        }
      }));
      
      alert('✅ Inspector assigned successfully! Waiting for inspector response...');
      setSelectedRequest(null);
      setSelectedInspectorFromMap(null);
      setSelectedInspectorFromDropdown(null);
      clearSearch();
      fetchData();
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
        `/api/assignment/${assignmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('✅ Assignment deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('❌ Failed to delete assignment');
    }
  };

  const handleEditAssignment = (assignment) => {
    alert(`📝 Edit Assignment:\n\nClient: ${assignment.inspectionRequest?.clientName}\nInspector: ${assignment.inspector?.name}\n\n(Edit functionality can be implemented with a modal)`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Set initial selected property and inspector if passed as props
  useEffect(() => {
    if (selectedProperty) {
      setSearchedProperty(selectedProperty);
      setSearchAddress(selectedProperty.address || '');
    }
    if (selectedInspector) {
      setSelectedInspectorFromMap(selectedInspector);
      setSelectedInspectorFromDropdown(selectedInspector._id);
    }
  }, [selectedProperty, selectedInspector]);

  // Get map center based on search results
  const getMapCenter = () => {
    if (searchedProperty) {
      return [searchedProperty.latitude, searchedProperty.longitude];
    }
    return [7.8731, 80.7718]; // Default to Sri Lanka center
  };

  // Get map zoom level
  const getMapZoom = () => {
    return searchedProperty ? 10 : 7;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soft-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Property Search Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-brown-light">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-soft-green rounded-full"></div>
          <h3 className="text-xl font-semibold text-dark-brown">🔍 Property Location Search</h3>
        </div>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex space-x-3">
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Enter real address (e.g., Galle Road Colombo, Kandy City Center, etc.)"
              className="flex-1 border-2 border-brown-light rounded-lg px-4 py-3 focus:outline-none focus:ring-4 focus:ring-soft-green/30 focus:border-soft-green text-dark-brown"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handlePropertySearch();
                }
              }}
            />
            <button
              onClick={handlePropertySearch}
              disabled={searchLoading || !searchAddress.trim()}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                searchLoading || !searchAddress.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-soft-green text-white hover:bg-green-600 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-soft-green/40'
              }`}
            >
              {searchLoading ? '🔍 Searching...' : '🔍 Search'}
            </button>
            {searchedProperty && (
              <button
                onClick={clearSearch}
                className="px-4 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* Legend */}
          <div className="bg-cream-light rounded-lg p-4">
            <h4 className="text-sm font-semibold text-brown-primary mb-3">🗺️ Map Legend:</h4>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-dark-brown">🔵 Available Inspectors</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-dark-brown">🟡 Busy Inspectors</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-dark-brown">🔴 Searched Property</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-dark-brown">🟢 Selected Inspector</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 
          message.includes('❌') ? 'bg-red-50 text-red-800 border border-red-200' :
          message.includes('🔍') ? 'bg-blue-50 text-blue-800 border border-blue-200' :
          'bg-cream-light text-brown-primary border border-brown-light'
        }`}>
          {message}
        </div>
      )}

      {/* Assignment Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-brown-light">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-soft-green rounded-full"></div>
          <h3 className="text-xl font-semibold text-dark-brown">📋 Create New Assignment</h3>
        </div>
        
        {/* Select Request */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-dark-brown mb-3">
            📋 Select Inspection Request
          </label>
          <select
            value={selectedRequest?._id || ''}
            onChange={(e) => setSelectedRequest(
              inspectionRequests.find(req => req._id === e.target.value)
            )}
            className="w-full border-2 border-brown-light rounded-lg px-4 py-3 focus:outline-none focus:ring-4 focus:ring-soft-green/30 focus:border-soft-green text-dark-brown"
          >
            <option value="">-- Choose Inspection Request --</option>
            {inspectionRequests.map(request => (
              <option key={request._id} value={request._id}>
                {request.client_name} - {request.propertyLocation_address} ({request.propertyType})
              </option>
            ))}
          </select>
        </div>

        {/* Select Inspector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-dark-brown mb-3">
            👨‍🔧 Select Inspector {selectedInspectorFromMap && "(Selected from Map)"}
          </label>
          <select
            value={selectedInspectorFromDropdown || ''}
            onChange={(e) => {
              setSelectedInspectorFromDropdown(e.target.value);
              setSelectedInspectorFromMap(null); // Clear map selection if dropdown used
            }}
            className="w-full border-2 border-brown-light rounded-lg px-4 py-3 focus:outline-none focus:ring-4 focus:ring-soft-green/30 focus:border-soft-green text-dark-brown"
          >
            <option value="">-- Choose Inspector --</option>
            {inspectors.map(inspector => (
              <option key={inspector._id} value={inspector._id}>
                {inspector.inspector_ID?.username || 'Inspector'} - {inspector.current_address} ({inspector.status})
              </option>
            ))}
          </select>
          
          {selectedInspectorFromMap && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                🟢 <strong>Selected from Map:</strong> {selectedInspectorFromMap.inspector_ID?.username || 'Inspector'} 
                {selectedInspectorFromMap.distanceToProperty && 
                  ` (${selectedInspectorFromMap.distanceToProperty.toFixed(1)}km away)`
                }
              </p>
            </div>
          )}
        </div>

        {/* Assign Button */}
        <button
          onClick={handleAssign}
          disabled={!selectedRequest || (!selectedInspectorFromMap && !selectedInspectorFromDropdown)}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            !selectedRequest || (!selectedInspectorFromMap && !selectedInspectorFromDropdown)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-soft-green text-white hover:bg-green-600 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-soft-green/40'
          }`}
        >
          ✅ Assign Inspector
        </button>
      </div>

      {/* Enhanced Interactive Map */}
      <div className="bg-white rounded-xl shadow-lg border border-brown-light overflow-hidden">
        <div className="p-4 bg-cream-light border-b border-brown-light">
          <h3 className="text-lg font-semibold text-dark-brown">🗺️ Inspector Locations & Property Search</h3>
          <p className="text-sm text-brown-primary">Click on markers to select inspectors or view property details</p>
        </div>
        <div className="h-96">
          <MapContainer
            center={getMapCenter()}
            zoom={getMapZoom()}
            style={{ height: '100%', width: '100%' }}
            key={searchedProperty ? `${searchedProperty.latitude}-${searchedProperty.longitude}` : 'default'}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Searched Property Marker */}
            {searchedProperty && (
              <Marker
                position={[searchedProperty.latitude, searchedProperty.longitude]}
                icon={markerIcons.searchedProperty}
              >
                <Popup>
                  <div className="text-center p-2 max-w-xs">
                    <h4 className="font-bold text-red-800 mb-2">🔴 Searched Property</h4>
                    <p className="text-sm text-gray-700 mb-2">{searchedProperty.address}</p>
                    <p className="text-xs text-gray-600">{searchedProperty.display_name}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Inspector Markers */}
            {(inspectorsWithDistances.length > 0 ? inspectorsWithDistances : inspectors).map((inspector) => {
              const isSelected = selectedInspectorFromMap?._id === inspector._id;
              const icon = isSelected ? markerIcons.selectedInspector :
                          inspector.status === 'available' ? markerIcons.availableInspector :
                          markerIcons.busyInspector;

              return (
                <Marker
                  key={inspector._id}
                  position={[inspector.inspector_latitude, inspector.inspector_longitude]}
                  icon={icon}
                  eventHandlers={{
                    click: () => handleInspectorClick(inspector),
                  }}
                >
                  <Popup>
                    <div className="text-center p-2 max-w-xs">
                      <h4 className={`font-bold mb-2 ${
                        inspector.status === 'available' ? 'text-blue-800' : 'text-yellow-800'
                      }`}>
                        {inspector.status === 'available' ? '🔵' : '🟡'} {inspector.inspector_ID?.username || 'Inspector'}
                      </h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Status:</strong> <span className={`font-semibold ${
                          inspector.status === 'available' ? 'text-green-600' : 'text-orange-600'
                        }`}>{inspector.status}</span></p>
                        <p><strong>Location:</strong> {inspector.current_address}</p>
                        <p><strong>Region:</strong> {inspector.region}</p>
                        {inspector.distanceToProperty && (
                          <p><strong>Distance:</strong> <span className={`font-semibold ${
                            inspector.withinLimit ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {inspector.distanceToProperty.toFixed(1)}km
                            {!inspector.withinLimit && ' (Outside 35km limit)'}
                          </span></p>
                        )}
                      </div>
                      <button 
                        onClick={() => handleInspectorClick(inspector)}
                        className={`mt-3 w-full py-2 px-3 rounded text-sm font-semibold transition-colors ${
                          isSelected 
                            ? 'bg-green-600 text-white' 
                            : inspector.status === 'available'
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-yellow-600 text-white hover:bg-yellow-700'
                        }`}
                      >
                        {isSelected ? '✅ Selected' : '📍 Select Inspector'}
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Nearest Inspectors List */}
      {inspectorsWithDistances.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-brown-light">
          <h3 className="text-xl font-semibold text-dark-brown mb-4">📏 Nearest Inspectors</h3>
          <div className="space-y-3">
            {inspectorsWithDistances.slice(0, 5).map((inspector, index) => (
              <div 
                key={inspector._id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedInspectorFromMap?._id === inspector._id 
                    ? 'border-green-500 bg-green-50' 
                    : inspector.withinLimit 
                      ? 'border-soft-green bg-cream-light hover:border-green-400' 
                      : 'border-red-300 bg-red-50'
                }`}
                onClick={() => handleInspectorClick(inspector)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-dark-brown">
                      #{index + 1} {inspector.inspector_ID?.username || 'Inspector'}
                    </h4>
                    <p className="text-sm text-gray-600">{inspector.current_address}</p>
                    <p className="text-xs text-gray-500">Status: <span className={`font-semibold ${
                      inspector.status === 'available' ? 'text-green-600' : 'text-orange-600'
                    }`}>{inspector.status}</span></p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      inspector.withinLimit ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {inspector.distanceToProperty.toFixed(1)}km
                    </p>
                    {!inspector.withinLimit && (
                      <p className="text-xs text-red-600">Outside limit</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspector Management Table */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-brown-light">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-soft-green rounded-full"></div>
          <h3 className="text-xl font-semibold text-dark-brown">👨‍🔧 Inspector Management</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-cream-light border-b-2 border-brown-light">
                <th className="text-left p-4 font-semibold text-dark-brown">Inspector Name</th>
                <th className="text-left p-4 font-semibold text-dark-brown">Current Location</th>
                <th className="text-left p-4 font-semibold text-dark-brown">Action</th>
                <th className="text-left p-4 font-semibold text-dark-brown">Availability</th>
              </tr>
            </thead>
            <tbody>
              {inspectors.length > 0 ? (
                inspectors.map((inspector, index) => (
                  <tr key={inspector._id} className={`border-b border-brown-light hover:bg-cream-light/50 ${
                    selectedInspectorFromMap?._id === inspector._id ? 'bg-green-50 border-green-200' : ''
                  }`}>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          inspector.status === 'available' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className="font-semibold text-dark-brown">
                          {inspector.inspector_ID?.username || `Inspector ${index + 1}`}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">
                      <div>
                        <p className="font-medium">{inspector.current_address}</p>
                        <p className="text-sm text-gray-500">{inspector.region}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {inspectorActions[inspector._id] ? (
                        <div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            inspectorActions[inspector._id].action === 'accepted' ? 'bg-green-100 text-green-700' :
                            inspectorActions[inspector._id].action === 'declined' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {inspectorActions[inspector._id].action === 'accepted' ? '✅ Accepted' :
                             inspectorActions[inspector._id].action === 'declined' ? '❌ Declined' :
                             '⏳ Assigned (Waiting)'}
                          </span>
                          {inspectorActions[inspector._id].reason && inspectorActions[inspector._id].action === 'declined' && (
                            <p className="text-xs text-red-600 mt-1">
                              Reason: {inspectorActions[inspector._id].reason}
                            </p>
                          )}
                        </div>
                      ) : pendingAssignments.includes(inspector._id) ? (
                        <div>
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
                            📨 Waiting Response
                          </span>
                          {/* ✅ PHASE 1: Testing buttons for simulation */}
                          <div className="mt-2 space-x-1">
                            <button
                              onClick={() => simulateInspectorAccept(inspector._id)}
                              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                              title="Simulate Accept"
                            >
                              ✅ Accept
                            </button>
                            <button
                              onClick={() => simulateInspectorDecline(inspector._id)}
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                              title="Simulate Decline"
                            >
                              ❌ Decline
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                          Ready
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        inspector.status === 'available' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {inspector.status === 'available' ? '✅ Available' : '🟡 Busy'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    <div className="text-4xl mb-2">👨‍🔧</div>
                    <p>No inspectors found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current Assignments */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-brown-light">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-soft-green rounded-full"></div>
          <h3 className="text-xl font-semibold text-dark-brown">📊 Current Assignments</h3>
        </div>
        
        {assignments.length > 0 && (
          <div className="grid gap-4">
            {assignments.map(assignment => (
              <div key={assignment._id} className="border border-brown-light rounded-lg p-4 bg-cream-light">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-dark-brown mb-2">
                      📋 Assignment #{assignment._id.slice(-6)}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Client:</strong> {assignment.InspectionRequest_ID?.client_name || 'N/A'}</p>
                        <p><strong>Property:</strong> {assignment.InspectionRequest_ID?.propertyLocation_address || 'N/A'}</p>
                      </div>
                      <div>
                        <p><strong>Inspector:</strong> {assignment.inspector_ID?.username || 'N/A'}</p>
                        <p><strong>Status:</strong> <span className={`font-semibold ${
                          assignment.status === 'assigned' ? 'text-green-600' : 'text-orange-600'
                        }`}>{assignment.status}</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEditAssignment(assignment)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {assignments.length === 0 && (
          <div className="text-center py-16 bg-gradient-to-br from-cream-light to-brown-light rounded-xl border-2 border-dashed border-brown-primary">
            <div className="text-6xl mb-4">👨‍🔧</div>
            <h3 className="text-lg font-semibold text-dark-brown mb-2">No Assignments Found</h3>
            <p className="text-brown-primary mb-4">Create your first assignment using the form above</p>
            <div className="bg-white rounded-lg p-4 max-w-md mx-auto border border-brown-light">
              <p className="text-sm text-brown-primary">
                <strong>Tip:</strong> Search for a property, select an inspector from the map, and create an assignment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectorAssignment;
