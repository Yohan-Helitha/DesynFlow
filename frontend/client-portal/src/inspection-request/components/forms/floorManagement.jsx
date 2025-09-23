import React, { useState } from 'react';

const FloorManagement = ({ formData, setFormData, errors }) => {
  const [selectedFloor, setSelectedFloor] = useState(0);

  // Initialize floors based on numberOfFloors
  React.useEffect(() => {
    const currentFloors = formData.floors || [];
    const neededFloors = formData.numberOfFloors;
    
    if (currentFloors.length !== neededFloors) {
      const newFloors = [];
      for (let i = 0; i < neededFloors; i++) {
        newFloors[i] = currentFloors[i] || {
          floorNumber: i + 1,
          floorName: `Floor ${i + 1}`,
          rooms: [],
          totalRooms: 0
        };
      }
      setFormData(prev => ({ ...prev, floors: newFloors }));
    }
  }, [formData.numberOfFloors]);

  const addRoom = (floorIndex) => {
    const floor = formData.floors[floorIndex];
    const roomNumber = floor.rooms.length + 1;
    
    const newRoom = {
      roomId: `floor_${floorIndex}_room_${Date.now()}`,
      roomName: `Room ${roomNumber}`,
      roomNumber: `${floor.floorNumber}.${roomNumber}`,
      roomSize: { length: '', width: '', unit: 'ft' },
      dimensions: '',
      photos: [],
      designPreferences: {
        style: '',
        colors: [],
        materials: [],
        specialRequirements: ''
      }
    };

    const updatedFloors = [...formData.floors];
    updatedFloors[floorIndex].rooms.push(newRoom);
    updatedFloors[floorIndex].totalRooms = updatedFloors[floorIndex].rooms.length;
    
    setFormData(prev => ({ ...prev, floors: updatedFloors }));
  };

  const removeRoom = (floorIndex, roomIndex) => {
    const updatedFloors = [...formData.floors];
    updatedFloors[floorIndex].rooms.splice(roomIndex, 1);
    updatedFloors[floorIndex].totalRooms = updatedFloors[floorIndex].rooms.length;
    
    setFormData(prev => ({ ...prev, floors: updatedFloors }));
  };

  const updateRoom = (floorIndex, roomIndex, field, value) => {
    const updatedFloors = [...formData.floors];
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedFloors[floorIndex].rooms[roomIndex][parent][child] = value;
    } else {
      updatedFloors[floorIndex].rooms[roomIndex][field] = value;
    }
    
    setFormData(prev => ({ ...prev, floors: updatedFloors }));
  };

  const copyRoomPreferences = (sourceFloorIndex, sourceRoomIndex, targetFloorIndex, targetRoomIndex) => {
    const sourceRoom = formData.floors[sourceFloorIndex].rooms[sourceRoomIndex];
    const updatedFloors = [...formData.floors];
    
    updatedFloors[targetFloorIndex].rooms[targetRoomIndex].designPreferences = {
      ...sourceRoom.designPreferences
    };
    
    setFormData(prev => ({ ...prev, floors: updatedFloors }));
  };

  if (!formData.floors || formData.floors.length === 0) {
    return <div>Loading floors...</div>;
  }

  return (
    <div className="floor-management">
      <h2>Floor & Room Layout</h2>
      
      {/* Floor Navigation */}
      <div className="floor-tabs">
        {formData.floors.map((floor, index) => (
          <button
            key={index}
            className={`floor-tab ${selectedFloor === index ? 'active' : ''}`}
            onClick={() => setSelectedFloor(index)}
            type="button"
          >
            {floor.floorName} ({floor.rooms.length} rooms)
          </button>
        ))}
      </div>

      {/* Selected Floor Content */}
      {formData.floors[selectedFloor] && (
        <div className="floor-content">
          <div className="floor-header">
            <h3>{formData.floors[selectedFloor].floorName}</h3>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => addRoom(selectedFloor)}
            >
              + Add Room
            </button>
          </div>

          {/* Rooms List */}
          <div className="rooms-list">
            {formData.floors[selectedFloor].rooms.length === 0 ? (
              <div className="no-rooms">
                <p>No rooms added yet. Click "Add Room" to get started.</p>
              </div>
            ) : (
              formData.floors[selectedFloor].rooms.map((room, roomIndex) => (
                <div key={room.roomId} className="room-card">
                  <div className="room-header">
                    <h4>Room {roomIndex + 1}</h4>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeRoom(selectedFloor, roomIndex)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="room-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Room Name</label>
                        <input
                          type="text"
                          value={room.roomName}
                          onChange={(e) => updateRoom(selectedFloor, roomIndex, 'roomName', e.target.value)}
                          placeholder="Living Room, Bedroom, etc."
                        />
                      </div>

                      <div className="form-group">
                        <label>Room Number</label>
                        <input
                          type="text"
                          value={room.roomNumber}
                          onChange={(e) => updateRoom(selectedFloor, roomIndex, 'roomNumber', e.target.value)}
                          placeholder="1.1, 1.2, etc."
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Length (ft)</label>
                        <input
                          type="number"
                          value={room.roomSize.length}
                          onChange={(e) => updateRoom(selectedFloor, roomIndex, 'roomSize.length', e.target.value)}
                          placeholder="12"
                        />
                      </div>

                      <div className="form-group">
                        <label>Width (ft)</label>
                        <input
                          type="number"
                          value={room.roomSize.width}
                          onChange={(e) => updateRoom(selectedFloor, roomIndex, 'roomSize.width', e.target.value)}
                          placeholder="10"
                        />
                      </div>

                      <div className="form-group">
                        <label>Unit</label>
                        <select
                          value={room.roomSize.unit}
                          onChange={(e) => updateRoom(selectedFloor, roomIndex, 'roomSize.unit', e.target.value)}
                        >
                          <option value="ft">Feet</option>
                          <option value="m">Meters</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Design Preferences</label>
                      <textarea
                        value={room.designPreferences.specialRequirements}
                        onChange={(e) => updateRoom(selectedFloor, roomIndex, 'designPreferences.specialRequirements', e.target.value)}
                        placeholder="Describe design preferences, materials, colors, etc."
                        rows="2"
                      />
                    </div>

                    {/* Copy Preferences */}
                    {formData.floors.some((f, fi) => f.rooms.some((r, ri) => fi !== selectedFloor || ri !== roomIndex)) && (
                      <div className="copy-preferences">
                        <label>Copy preferences from another room:</label>
                        <select onChange={(e) => {
                          const [sourceFloor, sourceRoom] = e.target.value.split('-').map(Number);
                          if (!isNaN(sourceFloor) && !isNaN(sourceRoom)) {
                            copyRoomPreferences(sourceFloor, sourceRoom, selectedFloor, roomIndex);
                          }
                        }}>
                          <option value="">Select a room to copy from...</option>
                          {formData.floors.map((floor, fi) =>
                            floor.rooms.map((r, ri) => {
                              if (fi === selectedFloor && ri === roomIndex) return null;
                              return (
                                <option key={`${fi}-${ri}`} value={`${fi}-${ri}`}>
                                  {floor.floorName} - {r.roomName}
                                </option>
                              );
                            })
                          )}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {errors.floors && <div className="error-message">{errors.floors}</div>}
      {errors.rooms && <div className="error-message">{errors.rooms}</div>}

      <style jsx>{`
        .floor-management {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .floor-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .floor-tab {
          padding: 10px 20px;
          border: 1px solid #ddd;
          background: #f8f9fa;
          cursor: pointer;
          border-radius: 4px;
          font-size: 14px;
        }

        .floor-tab.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .floor-content {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
        }

        .floor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #007bff;
        }

        .rooms-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .room-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .room-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .room-header h4 {
          margin: 0;
          color: #333;
        }

        .form-row {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }

        .form-group {
          flex: 1;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #555;
        }

        input, select, textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        .no-rooms {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .copy-preferences {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }

        .error-message {
          color: #dc3545;
          margin-top: 10px;
          padding: 10px;
          background: #f8d7da;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default FloorManagement;
