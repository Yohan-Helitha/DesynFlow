import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DynamicInspectionForm = ({ selectedAssignment }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dynamic form state
  const [floors, setFloors] = useState([]);
  const [recommendations, setRecommendations] = useState('');
  const [inspectionRequestId, setInspectionRequestId] = useState('');
  
  // Saved forms management
  const [savedForms, setSavedForms] = useState([]);
  const [editingFormId, setEditingFormId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const API_BASE = "/api/inspectorForms";

  // Initialize form when assignment is selected
  useEffect(() => {
    if (selectedAssignment && selectedAssignment.inspectionRequest) {
      const request = selectedAssignment.inspectionRequest;
      console.log('Setting up form for assignment:', selectedAssignment);
      console.log('InspectionRequest_ID:', selectedAssignment.InspectionRequest_ID);
      
      // Extract the actual ID string from the populated object
      const requestId = selectedAssignment.InspectionRequest_ID?._id || selectedAssignment.InspectionRequest_ID;
      console.log('Extracted requestId:', requestId);
      setInspectionRequestId(requestId);
      
      // Pre-populate floors - Always start with 1 floor and 1 room for simplicity
      // Inspector can add more floors/rooms as needed using the add buttons
      const numberOfFloors = 1; // Fixed to 1 floor by default
      const suggestedRooms = ['Room 1']; // Fixed to 1 room by default
      
      const initialFloors = [];
      for (let floorNum = 1; floorNum <= numberOfFloors; floorNum++) {
        const floorRooms = suggestedRooms.map(roomName => ({
          id: Date.now() + Math.random(),
          room_name: roomName,
          dimensions: {
            length: '',
            width: '',
            height: '',
            unit: 'feet'
          }
        }));
        
        initialFloors.push({
          id: Date.now() + floorNum,
          floor_number: floorNum,
          rooms: floorRooms,
          isExpanded: true
        });
      }
      
      setFloors(initialFloors);
      // Fetch saved forms for this assignment
      fetchSavedForms(requestId);
    } else {
      // Standalone mode - initialize with default floor and fetch all forms
      setInspectionRequestId(''); // Allow manual input in standalone mode
      const defaultFloor = {
        id: Date.now(),
        floor_number: 1,
        rooms: [{
          id: Date.now() + Math.random(),
          room_name: 'Room 1',
          dimensions: {
            length: '',
            width: '',
            height: '',
            unit: 'feet'
          }
        }],
        isExpanded: true
      };
      setFloors([defaultFloor]);
      // Fetch all forms in standalone mode
      fetchSavedForms(null);
    }
  }, [selectedAssignment]);

  // Fetch saved forms for this assignment
  const fetchSavedForms = async (requestId = null) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token - skipping saved forms fetch in development mode');
        setSavedForms([]);
        return;
      }

      console.log('Fetching saved forms...');
      const response = await axios.get(`${API_BASE}/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('API Response:', response.data);
      console.log('All forms from API:', response.data.forms);
      
      // Use passed requestId or fall back to state value
      const currentRequestId = requestId || inspectionRequestId;
      console.log('Current requestId for filtering:', currentRequestId);

      // Filter forms for current assignment only if we have a requestId
      let assignmentForms = response.data.forms || [];
      
      if (currentRequestId) {
        // Debug: Log each form's InspectionRequest_ID to see the format
        assignmentForms.forEach((form, index) => {
          console.log(`Form ${index + 1} InspectionRequest_ID:`, form.InspectionRequest_ID);
          console.log(`Type:`, typeof form.InspectionRequest_ID);
        });
        
        assignmentForms = assignmentForms.filter(form => {
          // Handle both populated objects and string IDs
          const formRequestId = form.InspectionRequest_ID?._id || form.InspectionRequest_ID;
          return formRequestId === currentRequestId;
        });
        console.log('Filtered forms for assignment:', assignmentForms);
      } else {
        console.log('No requestId - showing all forms:', assignmentForms);
      }
      
      setSavedForms(assignmentForms);
      console.log('Updated savedForms state:', assignmentForms);
    } catch (err) {
      console.error('Error fetching saved forms:', err);
      if (err.response?.status === 401) {
        console.log('Authentication failed - skipping saved forms in development mode');
        setSavedForms([]);
      }
    }
  };

  // Load form for editing
  const loadFormForEdit = (form) => {
    setEditingFormId(form._id);
    setIsEditMode(true);
    setFloors(form.floors.map(floor => ({
      ...floor,
      id: Date.now() + floor.floor_number,
      isExpanded: true,
      rooms: floor.rooms.map(room => ({
        ...room,
        id: Date.now() + Math.random()
      }))
    })));
    setRecommendations(form.recommendations || '');
    setError('');
    setSuccess('');
  };

  // Reset form
  const resetForm = () => {
    setEditingFormId(null);
    setIsEditMode(false);
    setError('');
    setSuccess('');
    
    // Re-initialize with consistent 1 floor + 1 room default (same as initial load)
    if (selectedAssignment && selectedAssignment.inspectionRequest) {
      // Always use 1 floor and 1 room for consistency
      const numberOfFloors = 1; // Fixed to 1 floor by default
      const suggestedRooms = ['Room 1']; // Fixed to 1 room by default
      
      const initialFloors = [];
      for (let floorNum = 1; floorNum <= numberOfFloors; floorNum++) {
        const floorRooms = suggestedRooms.map(roomName => ({
          id: Date.now() + Math.random(),
          room_name: roomName,
          dimensions: {
            length: '',
            width: '',
            height: '',
            unit: 'feet'
          }
        }));
        
        initialFloors.push({
          id: Date.now() + floorNum,
          floor_number: floorNum,
          rooms: floorRooms,
          isExpanded: true
        });
      }
      
      setFloors(initialFloors);
      setRecommendations('');
    }
  };

  // Delete saved form
  const deleteSavedForm = async (formId) => {
    if (!window.confirm('Are you sure you want to delete this saved form?')) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required to delete forms.');
        return;
      }

      await axios.delete(`${API_BASE}/${formId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSavedForms(savedForms.filter(form => form._id !== formId));
      setSuccess('Form deleted successfully!');
      
      // If we're editing this form, reset
      if (editingFormId === formId) {
        resetForm();
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError('Failed to delete form. Please try again.');
      }
      console.error('Error deleting form:', err);
    }
  };

  // Submit form for final processing and generate report
  const submitForm = async (form) => {
    if (!window.confirm('Are you sure you want to submit this form and generate a report? This action cannot be undone.')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required to submit forms.');
        return;
      }

      // Call the submit-and-generate endpoint to both submit form and generate report
      const response = await axios.post(`${API_BASE}/submit-and-generate/${form._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh saved forms to show updated status
      fetchSavedForms();
      setSuccess(`Form submitted and report generated successfully! Report ID: ${response.data.report._id}`);
      
      // Optional: Show additional success information
      setTimeout(() => {
        setSuccess('Form submitted successfully! Report has been generated and project managers have been notified.');
      }, 3000);
      
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (err.response?.status === 400 && err.response?.data?.message?.includes('already generated')) {
        setError('Report has already been generated for this form.');
      } else {
        setError('Failed to submit form and generate report. Please try again.');
      }
      console.error('Error submitting form and generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new floor
  const addFloor = () => {
    const newFloorNumber = floors.length + 1;
    const newFloor = {
      id: Date.now(),
      floor_number: newFloorNumber,
      rooms: [{
        id: Date.now() + Math.random(),
        room_name: 'New Room',
        dimensions: {
          length: '',
          width: '',
          height: '',
          unit: 'feet'
        }
      }],
      isExpanded: true
    };
    setFloors([...floors, newFloor]);
  };

  // Add room to specific floor
  const addRoom = (floorId) => {
    const newRoom = {
      id: Date.now() + Math.random(),
      room_name: 'New Room',
      dimensions: {
        length: '',
        width: '',
        height: '',
        unit: 'feet'
      }
    };
    
    setFloors(floors.map(floor => 
      floor.id === floorId 
        ? { ...floor, rooms: [...floor.rooms, newRoom] }
        : floor
    ));
  };

  // Remove room from floor
  const removeRoom = (floorId, roomId) => {
    setFloors(floors.map(floor => 
      floor.id === floorId 
        ? { ...floor, rooms: floor.rooms.filter(room => room.id !== roomId) }
        : floor
    ));
  };

  // Remove floor (only if more than 1 floor exists)
  const removeFloor = (floorId) => {
    if (floors.length <= 1) {
      setError('Cannot remove the last floor. At least one floor is required.');
      return;
    }
    
    if (window.confirm('Are you sure you want to remove this entire floor and all its rooms?')) {
      const updatedFloors = floors.filter(floor => floor.id !== floorId);
      
      // Renumber remaining floors to maintain sequential order
      const renumberedFloors = updatedFloors.map((floor, index) => ({
        ...floor,
        floor_number: index + 1
      }));
      
      setFloors(renumberedFloors);
      setSuccess('Floor removed successfully!');
    }
  };

  // Update room data
  const updateRoom = (floorId, roomId, field, value) => {
    setFloors(floors.map(floor => 
      floor.id === floorId 
        ? {
            ...floor, 
            rooms: floor.rooms.map(room => 
              room.id === roomId 
                ? { ...room, [field]: value }
                : room
            )
          }
        : floor
    ));
  };

  // Update room dimensions
  const updateRoomDimension = (floorId, roomId, dimensionField, value) => {
    setFloors(floors.map(floor => 
      floor.id === floorId 
        ? {
            ...floor, 
            rooms: floor.rooms.map(room => 
              room.id === roomId 
                ? { 
                    ...room, 
                    dimensions: { 
                      ...room.dimensions, 
                      [dimensionField]: value 
                    }
                  }
                : room
            )
          }
        : floor
    ));
  };

  // Toggle floor expansion
  const toggleFloor = (floorId) => {
    setFloors(floors.map(floor => 
      floor.id === floorId 
        ? { ...floor, isExpanded: !floor.isExpanded }
        : floor
    ));
  };

  // Validation functions
  const validateRoomName = (name) => {
    // No numbers allowed in room names
    return !/\d/.test(name);
  };

  const validateDimension = (value) => {
    // Allow empty values during input, only allow numbers and decimals
    return value === '' || /^\d*\.?\d*$/.test(value);
  };

  // Form validation
  const validateForm = () => {
    if (floors.length === 0) {
      setError('At least one floor is required.');
      return false;
    }

    for (const floor of floors) {
      if (floor.rooms.length === 0) {
        setError(`Floor ${floor.floor_number} must have at least one room.`);
        return false;
      }

      for (const room of floor.rooms) {
        if (!room.room_name.trim()) {
          setError(`Room name is required for all rooms on floor ${floor.floor_number}.`);
          return false;
        }

        if (!validateRoomName(room.room_name)) {
          setError(`Room names cannot contain numbers. Please fix: "${room.room_name}"`);
          return false;
        }

        if (!room.dimensions.length || !room.dimensions.width || !room.dimensions.height) {
          setError(`Complete dimensions required for "${room.room_name}" on floor ${floor.floor_number}.`);
          return false;
        }

        // Check if dimensions are valid numbers
        if (isNaN(parseFloat(room.dimensions.length)) || 
            isNaN(parseFloat(room.dimensions.width)) || 
            isNaN(parseFloat(room.dimensions.height))) {
          setError(`Dimensions must be valid numbers for "${room.room_name}" on floor ${floor.floor_number}.`);
          return false;
        }
      }
    }

    return true;
  };

  // Save form
  const saveForm = async () => {
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication required. Please login.');
        return;
      }

      // Prepare data for submission
      const formData = {
        InspectionRequest_ID: inspectionRequestId || null, // Allow null for standalone forms
        floors: floors.map(floor => ({
          floor_number: floor.floor_number,
          rooms: floor.rooms.map(room => ({
            room_name: room.room_name.trim(),
            dimensions: {
              length: parseFloat(room.dimensions.length),
              width: parseFloat(room.dimensions.width),
              height: parseFloat(room.dimensions.height),
              unit: room.dimensions.unit
            }
          }))
        })),
        recommendations: recommendations.trim()
      };

      console.log('Saving form with data:', formData);
      console.log('Current inspectionRequestId:', inspectionRequestId);

      let response;
      if (isEditMode && editingFormId) {
        // Update existing form
        response = await axios.patch(`${API_BASE}/${editingFormId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Inspection form updated successfully!');
      } else {
        // Create new form
        response = await axios.post(`${API_BASE}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Inspection form saved successfully!');
      }

      console.log('Form saved:', response.data);

      
      // Refresh saved forms to show the newly saved form
      console.log('Calling fetchSavedForms after save...');
      await fetchSavedForms(inspectionRequestId);
      // Don't reset form - keep user data for easy modification
      
    } catch (err) {
      console.error('Error saving form:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to save form. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Assignment Context Banner */}
      {selectedAssignment && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 Assignment Context</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p><span className="font-medium">Client:</span> {selectedAssignment.inspectionRequest?.clientName}</p>
            <p><span className="font-medium">Location:</span> {selectedAssignment.inspectionRequest?.propertyAddress}</p>
            <p><span className="font-medium">Phone:</span> {selectedAssignment.inspectionRequest?.clientPhone}</p>
            <p><span className="font-medium">Date:</span> {selectedAssignment.inspectionRequest?.preferredDate 
              ? new Date(selectedAssignment.inspectionRequest.preferredDate).toLocaleDateString()
              : 'Not specified'}</p>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Dynamic Floors Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Dynamic Inspection Form</h2>
          <button
            onClick={addFloor}
            className="bg-brown-primary text-cream-primary px-4 py-2 rounded hover:bg-brown-secondary transition-colors"
          >
            + Add Extra Floor
          </button>
        </div>

        {/* Floors */}
        <div className="space-y-4">
          {floors.map((floor) => (
            <div key={floor.id} className="border border-gray-300 rounded-lg">
              {/* Floor Header */}
              <div className="bg-gray-50 p-4 flex justify-between items-center rounded-t-lg">
                <div 
                  className="cursor-pointer flex-1 flex justify-between items-center"
                  onClick={() => toggleFloor(floor.id)}
                >
                  <h3 className="text-lg font-medium">
                    🏠 Floor {floor.floor_number} ({floor.rooms.length} rooms)
                  </h3>
                  <span className="text-gray-500">
                    {floor.isExpanded ? '📂' : '📁'}
                  </span>
                </div>
                
                {/* Remove Floor Button - only show if more than 1 floor */}
                {floors.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent floor toggle when clicking remove
                      removeFloor(floor.id);
                    }}
                    className="ml-3 text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    title="Remove this floor"
                  >
                    ✕ Remove Floor
                  </button>
                )}
              </div>

              {/* Floor Content */}
              {floor.isExpanded && (
                <div className="p-4 space-y-4">
                  {/* Rooms */}
                  {floor.rooms.map((room) => (
                    <div key={room.id} className="bg-cream-light p-4 rounded border border-brown-primary-200">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-brown-primary">Room Details</h4>
                        {floor.rooms.length > 1 && (
                          <button
                            onClick={() => removeRoom(floor.id, room.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ✕ Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Room Name */}
                        <div>
                          <label className="block text-sm font-medium text-brown-primary mb-1">
                            Room Name (no numbers allowed)
                          </label>
                          <select
                            value={room.room_name}
                            onChange={(e) => {
                              const value = e.target.value;
                              updateRoom(floor.id, room.id, 'room_name', value);
                            }}
                            className="w-full border border-gray-300 p-2 rounded bg-white"
                            required
                          >
                            <option value="">Select Room Type</option>
                            <option value="Living Room">Living Room</option>
                            <option value="Bedroom">Bedroom</option>
                            <option value="Master Bedroom">Master Bedroom</option>
                            <option value="Guest Bedroom">Guest Bedroom</option>
                            <option value="Kitchen">Kitchen</option>
                            <option value="Dining Room">Dining Room</option>
                          </select>
                        </div>

                        {/* Dimensions */}
                        <div>
                          <label className="block text-sm font-medium text-brown-primary mb-1">
                            Dimensions (Length × Width × Height)
                          </label>
                          <div className="flex space-x-2 items-center">
                            <input
                              type="text"
                              value={room.dimensions.length}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow only numbers and decimal point
                                if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                                  updateRoomDimension(floor.id, room.id, 'length', value);
                                }
                              }}
                              className="w-20 border border-gray-300 p-2 rounded text-center"
                              placeholder="L"
                              required
                            />
                            <span className="text-gray-500">×</span>
                            <input
                              type="text"
                              value={room.dimensions.width}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow only numbers and decimal point
                                if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                                  updateRoomDimension(floor.id, room.id, 'width', value);
                                }
                              }}
                              className="w-20 border border-gray-300 p-2 rounded text-center"
                              placeholder="W"
                              required
                            />
                            <span className="text-gray-500">×</span>
                            <input
                              type="text"
                              value={room.dimensions.height}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow only numbers and decimal point
                                if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                                  updateRoomDimension(floor.id, room.id, 'height', value);
                                }
                              }}
                              className="w-20 border border-gray-300 p-2 rounded text-center"
                              placeholder="H"
                              required
                            />
                            <select
                              value={room.dimensions.unit}
                              onChange={(e) => updateRoomDimension(floor.id, room.id, 'unit', e.target.value)}
                              className="border border-gray-300 p-2 rounded bg-white"
                            >
                              <option value="feet">feet</option>
                              <option value="meters">meters</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Room Button */}
                  <button
                    onClick={() => addRoom(floor.id)}
                    className="w-full bg-green-100 text-green-700 py-2 px-4 rounded border border-green-300 hover:bg-green-200 transition-colors"
                  >
                    + Add Room to Floor {floor.floor_number}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">📝 Inspector Recommendations</h3>
        <textarea
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded h-32"
          placeholder="Enter your overall recommendations and observations about the property..."
        />
      </div>

      {/* Save/Update Buttons */}
      <div className="flex justify-end space-x-4">
        {isEditMode && (
          <button
            onClick={resetForm}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Cancel Edit
          </button>
        )}
        <button
          onClick={saveForm}
          disabled={loading}
          className="bg-green-primary text-cream-primary px-8 py-3 rounded-lg font-semibold hover:bg-soft-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : isEditMode ? '💾 Update Form' : '💾 Save Form'}
        </button>
      </div>

      {/* Saved Forms Section */}
      {savedForms.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">📋 Saved Inspection Forms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedForms.map((form) => (
              <div key={form._id} className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow">
                {/* Form Header */}
                <div className="mb-3">
                  <h4 className="font-medium text-brown-primary">
                    Inspection Form #{form._id.slice(-6)}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Created: {new Date(form.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: <span className={`px-2 py-1 rounded text-xs ${
                      form.status === 'completed' ? 'bg-green-100 text-green-800' :
                      form.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      form.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {form.status}
                    </span>
                  </p>
                </div>

                {/* Form Summary */}
                <div className="mb-4 text-sm">
                  <p><span className="font-medium">Floors:</span> {form.floors?.length || 0}</p>
                  <p><span className="font-medium">Total Rooms:</span> {
                    form.floors?.reduce((total, floor) => total + (floor.rooms?.length || 0), 0) || 0
                  }</p>
                  {form.recommendations && (
                    <p className="mt-2">
                      <span className="font-medium">Recommendations:</span>
                      <span className="block text-gray-600 truncate">
                        {form.recommendations.length > 50 ? 
                          `${form.recommendations.substring(0, 50)}...` : 
                          form.recommendations
                        }
                      </span>
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => loadFormForEdit(form)}
                    className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => deleteSavedForm(form._id)}
                    className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => submitForm(form)}
                    className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded text-sm font-medium hover:bg-green-200 transition-colors"
                    disabled={form.status === 'completed' || form.report_generated}
                  >
                    {form.status === 'completed' || form.report_generated ? '✅ Submitted' : '📄 Submit & Generate Report'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicInspectionForm;
