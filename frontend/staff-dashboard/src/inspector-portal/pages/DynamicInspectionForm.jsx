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

  const API_BASE = "http://localhost:4000/api/inspectorForms";

  // Initialize form when assignment is selected
  useEffect(() => {
    if (selectedAssignment && selectedAssignment.inspectionRequest) {
      const request = selectedAssignment.inspectionRequest;
      setInspectionRequestId(selectedAssignment.InspectionRequest_ID);
      
      // Pre-populate floors based on inspection request
      const numberOfFloors = request.numberOfFloors || 1;
      const suggestedRooms = request.roomNames || ['Room 1'];
      
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
    }
    
    // Fetch saved forms when assignment is selected
    if (selectedAssignment) {
      fetchSavedForms();
    }
  }, [selectedAssignment]);

  // Fetch saved forms for this assignment
  const fetchSavedForms = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get(`${API_BASE}/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Filter forms for current assignment
      const assignmentForms = response.data.forms?.filter(
        form => form.InspectionRequest_ID === inspectionRequestId
      ) || [];
      
      setSavedForms(assignmentForms);
    } catch (err) {
      console.error('Error fetching saved forms:', err);
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
    
    // Re-initialize with assignment data
    if (selectedAssignment && selectedAssignment.inspectionRequest) {
      const request = selectedAssignment.inspectionRequest;
      const numberOfFloors = request.numberOfFloors || 1;
      const suggestedRooms = request.roomNames || ['Room 1'];
      
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
      setError('Failed to delete form. Please try again.');
      console.error('Error deleting form:', err);
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
    // Only numbers allowed (including decimals)
    return /^\d*\.?\d*$/.test(value) && value !== '';
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

        if (!validateDimension(room.dimensions.length) || 
            !validateDimension(room.dimensions.width) || 
            !validateDimension(room.dimensions.height)) {
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
        InspectionRequest_ID: inspectionRequestId,
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

      let response;
      if (isEditMode && editingFormId) {
        // Update existing form
        response = await axios.patch(`${API_BASE}/${editingFormId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Inspection form updated successfully!');
      } else {
        // Create new form
        response = await axios.post(`${API_BASE}/create`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Inspection form saved successfully!');
      }

      console.log('Form saved:', response.data);
      
      // Refresh saved forms and reset form
      await fetchSavedForms();
      resetForm();
      
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

  if (!selectedAssignment) {
    return (
      <div className="bg-cream-light rounded-lg p-8 text-center border border-brown-primary-300">
        <h3 className="text-lg font-medium text-brown-primary mb-2">No Assignment Selected</h3>
        <p className="text-brown-secondary">Please select an assignment from "My Assignments" to start inspection.</p>
      </div>
    );
  }

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
              <div 
                className="bg-gray-50 p-4 cursor-pointer flex justify-between items-center rounded-t-lg"
                onClick={() => toggleFloor(floor.id)}
              >
                <h3 className="text-lg font-medium">
                  🏠 Floor {floor.floor_number} ({floor.rooms.length} rooms)
                </h3>
                <span className="text-gray-500">
                  {floor.isExpanded ? '📂' : '📁'}
                </span>
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
                          <input
                            type="text"
                            value={room.room_name}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || validateRoomName(value)) {
                                updateRoom(floor.id, room.id, 'room_name', value);
                              }
                            }}
                            className="w-full border border-gray-300 p-2 rounded"
                            placeholder="e.g. Living Room, Kitchen"
                            required
                          />
                        </div>

                        {/* Dimensions */}
                        <div>
                          <label className="block text-sm font-medium text-brown-primary mb-1">
                            Dimensions (Length × Width × Height)
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={room.dimensions.length}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || validateDimension(value)) {
                                  updateRoomDimension(floor.id, room.id, 'length', value);
                                }
                              }}
                              className="flex-1 border border-gray-300 p-2 rounded"
                              placeholder="Length"
                              required
                            />
                            <span className="self-center">×</span>
                            <input
                              type="text"
                              value={room.dimensions.width}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || validateDimension(value)) {
                                  updateRoomDimension(floor.id, room.id, 'width', value);
                                }
                              }}
                              className="flex-1 border border-gray-300 p-2 rounded"
                              placeholder="Width"
                              required
                            />
                            <span className="self-center">×</span>
                            <input
                              type="text"
                              value={room.dimensions.height}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || validateDimension(value)) {
                                  updateRoomDimension(floor.id, room.id, 'height', value);
                                }
                              }}
                              className="flex-1 border border-gray-300 p-2 rounded"
                              placeholder="Height"
                              required
                            />
                            <select
                              value={room.dimensions.unit}
                              onChange={(e) => updateRoomDimension(floor.id, room.id, 'unit', e.target.value)}
                              className="border border-gray-300 p-2 rounded"
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
                    👁️ View Details
                  </button>
                  <button
                    onClick={() => deleteSavedForm(form._id)}
                    className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                  <button
                    onClick={() => {/* Submit functionality - frontend only */}}
                    className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    ✅ Submit
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