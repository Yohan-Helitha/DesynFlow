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

const InspectorAssignment = ({ selectedProperty, selectedInspector, csr, onAuthError }) => {
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
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Inspector management
  const [inspectorActions, setInspectorActions] = useState({}); // Track inspector actions {inspectorId: {action: 'accepted/declined', reason: ''}}
  const [pendingAssignments, setPendingAssignments] = useState([]); // Track assignments waiting for inspector response

  // Utility function to validate coordinates
  const isValidCoordinate = (lat, lng) => {
    return lat !== undefined && 
           lng !== undefined &&
           lat !== null && 
           lng !== null &&
           !isNaN(lat) && 
           !isNaN(lng) &&
           lat >= -90 && lat <= 90 &&
           lng >= -180 && lng <= 180;
  };

  // Get address suggestions from available inspection requests
  const getAddressSuggestions = (inputValue) => {
    if (!inputValue || inputValue.length < 2) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const suggestions = inspectionRequests
      .filter(req => 
        req.propertyLocation_address?.toLowerCase().includes(inputValue.toLowerCase()) ||
        req.property_full_address?.toLowerCase().includes(inputValue.toLowerCase())
      )
      .map(req => ({
        address: req.propertyLocation_address,
        fullAddress: req.property_full_address,
        city: req.propertyLocation_city,
        latitude: req.property_latitude,
        longitude: req.property_longitude
      }))
      .slice(0, 5); // Limit to 5 suggestions

    setAddressSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  };

  // Handle address input change
  const handleAddressInputChange = (e) => {
    const value = e.target.value;
    setSearchAddress(value);
    getAddressSuggestions(value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchAddress(suggestion.address);
    setShowSuggestions(false);
    setMessage('🔍 Click the Search button to find this property on the map.');
  };

  // Fetch data
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('No auth token found in InspectorAssignment');
        if (onAuthError) onAuthError();
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
      
      console.log('📋 Fetched inspection requests:', requestsRes.data.length);
      console.log('👨‍🔧 Fetched inspectors:', inspectorsRes.data.length);
      console.log('📊 Fetched assignments:', assignmentsRes.data.length);
      
      setInspectionRequests(requestsRes.data);
      setInspectors(inspectorsRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        console.error('Authentication failed in InspectorAssignment');
        if (onAuthError) onAuthError();
        return;
      }
      
      setInspectionRequests([]);
      setInspectors([]);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Search for address in local database first, then fallback to external geocoding
  const searchPropertyLocation = async (address) => {
    try {
      // First, search in local database for existing inspection requests
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log(`🔍 Searching for address: "${address}"`);
      
      // Search in database for matching addresses (case-insensitive partial match)
      const response = await axios.get('/api/inspection-request/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const requests = response.data;
      console.log(`🔍 [DEBUG] Searching in ${requests.length} inspection requests for: "${address}"`);
      
      // Try multiple matching strategies
      const searchTerm = address.toLowerCase().trim();
      
      let matchingRequest = requests.find(req => {
        const addr1 = req.propertyLocation_address?.toLowerCase() || '';
        const addr2 = req.property_full_address?.toLowerCase() || '';
        const city = req.propertyLocation_city?.toLowerCase() || '';
        
        // Strategy 1: Exact match
        if (addr1.includes(searchTerm) || addr2.includes(searchTerm)) {
          console.log(`✅ [DEBUG] Found exact match in addresses:`, {
            address: address,
            matched_address: req.propertyLocation_address,
            matched_full_address: req.property_full_address
          });
          return true;
        }
        
        // Strategy 2: Match by combining address and city
        const combinedAddress = `${addr1} ${city}`.trim();
        const combinedFullAddress = `${addr2} ${city}`.trim();
        
        if (combinedAddress.includes(searchTerm) || combinedFullAddress.includes(searchTerm)) {
          console.log(`✅ [DEBUG] Found combined address match:`, {
            address: address,
            combined: combinedAddress,
            combinedFull: combinedFullAddress
          });
          return true;
        }
        
        // Strategy 3: Flexible Colombo district matching (01, 02, 03 etc.)
        if (searchTerm.includes('business district') && addr1.includes('business district')) {
          console.log(`✅ [DEBUG] Found business district match:`, {
            address: address,
            matched_address: req.propertyLocation_address
          });
          return true;
        }
        
        // Strategy 4: Partial word matching for major landmarks
        const searchWords = searchTerm.replace(/[,]/g, ' ').split(/\s+/).filter(w => w.length > 2);
        const addressWords = (addr1 + ' ' + addr2 + ' ' + city).toLowerCase().replace(/[,]/g, ' ').split(/\s+/);
        
        const matchedWords = searchWords.filter(word => 
          addressWords.some(addressWord => 
            addressWord.includes(word) || word.includes(addressWord) ||
            (word.length > 3 && addressWord.length > 3 && 
             (word.startsWith(addressWord.slice(0, 3)) || addressWord.startsWith(word.slice(0, 3))))
          )
        );
        
        if (matchedWords.length >= Math.min(2, searchWords.length)) {
          console.log(`✅ [DEBUG] Found partial word match:`, {
            address: address,
            searchWords: searchWords,
            matchedWords: matchedWords,
            matched_address: req.propertyLocation_address
          });
          return true;
        }
        
        return false;
      });
      
      console.log(`🔍 [DEBUG] Search result:`, {
        searchTerm: searchTerm,
        matchingRequest: matchingRequest ? {
          address: matchingRequest.propertyLocation_address,
          full_address: matchingRequest.property_full_address,
          latitude: matchingRequest.property_latitude,
          longitude: matchingRequest.property_longitude,
          hasValidCoordinates: isValidCoordinate(matchingRequest.property_latitude, matchingRequest.property_longitude)
        } : null
      });
      
      if (matchingRequest) {
        console.log('🔍 [DEBUG] Found matching request details:', {
          address: matchingRequest.propertyLocation_address,
          full_address: matchingRequest.property_full_address,
          latitude: matchingRequest.property_latitude,
          longitude: matchingRequest.property_longitude,
          latitude_type: typeof matchingRequest.property_latitude,
          longitude_type: typeof matchingRequest.property_longitude,
          hasValidCoordinates: isValidCoordinate(matchingRequest.property_latitude, matchingRequest.property_longitude)
        });
        
        if (isValidCoordinate(matchingRequest.property_latitude, matchingRequest.property_longitude)) {
          console.log('✅ [DEBUG] Found matching address in database with valid coordinates:', matchingRequest.propertyLocation_address);
          return {
            latitude: matchingRequest.property_latitude,
            longitude: matchingRequest.property_longitude,
            display_name: matchingRequest.property_full_address || matchingRequest.propertyLocation_address,
            address: {
              city: matchingRequest.propertyLocation_city,
              country: 'Sri Lanka'
            },
            source: 'database'
          };
        } else {
          console.log('⚠️ [DEBUG] Found matching address but coordinates are invalid, trying external geocoding for:', matchingRequest.propertyLocation_address);
          // Fall back to geocoding the found address (more accurate than the search term)
          const addressToGeocode = matchingRequest.property_full_address || 
                                   `${matchingRequest.propertyLocation_address}, ${matchingRequest.propertyLocation_city}` ||
                                   address;
          return await geocodeAddress(addressToGeocode);
        }
      } else {
        console.log('❌ [DEBUG] No matching request found in database');
      }
      
      // If not found in database, fallback to external geocoding
      console.log('📡 [DEBUG] Address not found in database, trying external geocoding for original search term...');
      return await geocodeAddress(address);
      
    } catch (error) {
      console.error('Property search error:', error);
      throw error;
    }
  };

  // Geocode address to coordinates using Nominatim (OpenStreetMap)
  const geocodeAddress = async (address) => {
    try {
      console.log(`🌐 [DEBUG] Attempting external geocoding for: "${address}"`);
      
      // Try multiple address formats for better success rate
      const addressVariations = [
        `${address}, Sri Lanka`,
        `${address}, Colombo, Sri Lanka`,
        address.replace(/business district/i, 'Fort'), // Business District is often in Fort area
        address.replace(/colombo 02/i, 'Fort, Colombo'), // Colombo 02 is Fort
        `Colombo 02, Sri Lanka`, // Just the area
        `Fort, Colombo, Sri Lanka` // Alternative name for Colombo 02
      ];
      
      for (let i = 0; i < addressVariations.length; i++) {
        const testAddress = addressVariations[i];
        console.log(`🔍 [DEBUG] Trying variation ${i + 1}: "${testAddress}"`);
        
        try {
          const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(testAddress)}&limit=1&addressdetails=1`;
          console.log(`🔗 [DEBUG] Geocoding URL: ${geocodeUrl}`);
          
          const response = await fetch(geocodeUrl);
          
          if (!response.ok) {
            console.log(`❌ [DEBUG] HTTP error: ${response.status} ${response.statusText}`);
            continue;
          }
          
          const data = await response.json();
          console.log(`📡 [DEBUG] Geocoding response for "${testAddress}":`, data);
          
          if (data && data.length > 0) {
            const location = data[0];
            const lat = parseFloat(location.lat);
            const lon = parseFloat(location.lon);
            
            // Validate coordinates are in Sri Lanka bounds
            if (lat >= 5.9 && lat <= 9.9 && lon >= 79.4 && lon <= 81.9) {
              console.log(`✅ [DEBUG] Geocoding successful with variation "${testAddress}":`, {
                original_address: address,
                used_variation: testAddress,
                latitude: lat,
                longitude: lon,
                display_name: location.display_name
              });
              
              return {
                latitude: lat,
                longitude: lon,
                display_name: location.display_name,
                address: location.address,
                source: 'external'
              };
            } else {
              console.log(`❌ [DEBUG] Coordinates outside Sri Lanka bounds: ${lat}, ${lon}`);
            }
          }
        } catch (fetchError) {
          console.log(`❌ [DEBUG] Fetch error for "${testAddress}":`, fetchError.message);
          continue;
        }
      }
      
      console.log(`❌ [DEBUG] All geocoding attempts failed for: "${address}"`);
      throw new Error('Address not found in any geocoding service');
      
    } catch (error) {
      console.error('❌ [DEBUG] Geocoding error:', error);
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
      const location = await searchPropertyLocation(searchAddress.trim());
      
      setSearchedProperty({
        address: searchAddress.trim(),
        display_name: location.display_name,
        latitude: location.latitude,
        longitude: location.longitude,
        addressDetails: location.address
      });

      // Calculate distances to all inspectors
      const inspectorsWithDist = inspectors.map(inspector => {
        // Only calculate distance if inspector has valid coordinates
        if (!isValidCoordinate(inspector.inspector_latitude, inspector.inspector_longitude)) {
          return {
            ...inspector,
            distanceToProperty: Infinity,
            withinLimit: false
          };
        }

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
      const sourceText = location.source === 'database' ? ' (from database)' : ' (from external geocoding)';
      setMessage(`✅ Found property${sourceText}! ${nearestInspectors.length} inspectors within 35km radius`);

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
      const errorMessage = error.response?.data?.message || error.message;
      alert(`❌ ${errorMessage}`);
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
    if (searchedProperty && isValidCoordinate(searchedProperty.latitude, searchedProperty.longitude)) {
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
          <div className="relative flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchAddress}
                onChange={handleAddressInputChange}
                placeholder="Enter address (e.g., 123 Main Street, Colombo 03)"
                className="w-full border-2 border-brown-light rounded-lg px-4 py-3 focus:outline-none focus:ring-4 focus:ring-soft-green/30 focus:border-soft-green text-dark-brown"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePropertySearch();
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (addressSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding suggestions to allow clicking
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
              />
              
              {/* Address Suggestions Dropdown */}
              {showSuggestions && addressSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border-2 border-brown-light rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                  {addressSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-3 hover:bg-soft-green/10 hover:border-l-4 hover:border-l-soft-green cursor-pointer border-b border-brown-light/30 last:border-b-0 transition-all duration-200"
                    >
                      <div className="font-semibold text-dark-brown">{suggestion.address}</div>
                      <div className="text-sm text-brown-primary/70">{suggestion.city}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

          {/* Available Addresses Quick Reference */}
          {inspectionRequests.length > 0 && (
            <div className="bg-cream-light rounded-lg p-4 border-2 border-brown-light/30">
              <h4 className="text-sm font-semibold text-brown-primary mb-3">📋 Available Addresses (click to search): ({inspectionRequests.length} total)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {inspectionRequests
                  .filter(request => request.propertyLocation_address) // Show all addresses that have an address
                  .slice(0, 8).map((request, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchAddress(request.propertyLocation_address);
                      setMessage('🔍 Click the Search button to find this property on the map.');
                    }}
                    className="text-left p-3 bg-white rounded-lg hover:bg-soft-green/10 hover:border-soft-green transition-all duration-200 border-2 border-brown-light/20 hover:scale-[1.02] hover:shadow-md"
                  >
                    <div className="font-semibold text-dark-brown">
                      {request.propertyLocation_address}
                    </div>
                    <div className="text-xs text-brown-primary/70 mt-1">{request.propertyLocation_city}</div>
                    {request.client_name && (
                      <div className="text-xs text-gray-500">Client: {request.client_name}</div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Show count information */}
              {inspectionRequests.length > 8 && (
                <div className="mt-2 text-xs text-brown-primary/70">
                  Showing 8 of {inspectionRequests.length} total addresses
                </div>
              )}
            </div>
          )}

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
                {inspector.inspector_ID?.username ? 
                  inspector.inspector_ID.username.replace('_inspector', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' Inspector'
                  : 'Inspector Name Missing'} - {inspector.current_address} ({inspector.status})
              </option>
            ))}
          </select>
          
          {selectedInspectorFromMap && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                🟢 <strong>Selected from Map:</strong> {selectedInspectorFromMap.inspector_ID?.username ? 
                  selectedInspectorFromMap.inspector_ID.username.replace('_inspector', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' Inspector'
                  : 'Inspector Name Missing'}
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
          {/* Map Error Boundary */}
          {(() => {
            try {
              const center = getMapCenter();
              const zoom = getMapZoom();
              
              return (
                <MapContainer
                  center={center}
                  zoom={zoom}
                  style={{ height: '100%', width: '100%' }}
                  key={searchedProperty ? `${searchedProperty.latitude}-${searchedProperty.longitude}` : 'default'}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Searched Property Marker */}
                  {searchedProperty && isValidCoordinate(searchedProperty.latitude, searchedProperty.longitude) && (
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
                  {(inspectorsWithDistances.length > 0 ? inspectorsWithDistances : inspectors)
                    .filter(inspector => isValidCoordinate(inspector.inspector_latitude, inspector.inspector_longitude))
                    .map((inspector) => {
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
                              {inspector.status === 'available' ? '🔵' : '🟡'} {inspector.inspector_ID?.username ? 
                                inspector.inspector_ID.username.replace('_inspector', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' Inspector'
                                : 'Inspector Name Missing'}
                            </h4>
                            <div className="text-sm space-y-1">
                              <p><strong>Status:</strong> <span className={`font-semibold ${
                                inspector.status === 'available' ? 'text-green-600' : 'text-orange-600'
                              }`}>{inspector.status}</span></p>
                              <p><strong>Location:</strong> {inspector.current_address}</p>
                              <p><strong>Region:</strong> {inspector.region}</p>
                              {inspector.distanceToProperty && inspector.distanceToProperty !== Infinity && (
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
              );
            } catch (error) {
              console.error('Map rendering error:', error);
              return (
                <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                  <div className="text-center p-8">
                    <div className="text-4xl mb-4">🗺️</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Loading Error</h3>
                    <p className="text-sm text-gray-600 mb-4">Unable to load map. Please try refreshing the page.</p>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="px-4 py-2 bg-soft-green text-white rounded-lg hover:bg-green-600"
                    >
                      Refresh Page
                    </button>
                  </div>
                </div>
              );
            }
          })()}
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
                          {inspector.inspector_ID?.username ? 
                            inspector.inspector_ID.username.replace('_inspector', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' Inspector'
                            : 'Inspector Name Missing'}
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
                  <div className="flex ml-4">
                    <button
                      onClick={() => handleDeleteAssignment(assignment._id)}
                      className="px-3 py-1 bg-red-800 text-white rounded text-sm hover:bg-red-900 transition-all duration-200 shadow-md hover:shadow-lg"
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
