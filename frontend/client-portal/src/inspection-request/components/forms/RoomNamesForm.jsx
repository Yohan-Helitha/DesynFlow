import React from 'react';

const RoomNamesForm = ({ formData, setFormData, errors }) => {
  
  const handleRoomNameChange = (index, value) => {
    const updatedRoomNames = [...formData.room_name];
    updatedRoomNames[index] = value;
    setFormData(prev => ({
      ...prev,
      room_name: updatedRoomNames
    }));
  };

  const addRoom = () => {
    if (formData.room_name.length < formData.number_of_room) {
      setFormData(prev => ({
        ...prev,
        room_name: [...prev.room_name, '']
      }));
    }
  };

  const removeRoom = (index) => {
    const updatedRoomNames = formData.room_name.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      room_name: updatedRoomNames
    }));
  };

  // Ensure room_name array matches number_of_room
  React.useEffect(() => {
    if (formData.room_name.length !== formData.number_of_room) {
      const newRoomNames = Array(formData.number_of_room).fill('').map((_, index) => 
        formData.room_name[index] || ''
      );
      setFormData(prev => ({
        ...prev,
        room_name: newRoomNames
      }));
    }
  }, [formData.number_of_room]);

  return (
    <div className="room-names-form">
      <h2>Room Names</h2>
      <p className="form-description">
        Please provide names for each room in your property. This helps the inspector understand the layout better.
      </p>
      
      <div className="rooms-container">
        {Array.from({ length: formData.number_of_room }, (_, index) => (
          <div key={index} className="room-input-group">
            <label>Room {index + 1} *</label>
            <input
              type="text"
              value={formData.room_name[index] || ''}
              onChange={(e) => handleRoomNameChange(index, e.target.value)}
              placeholder={`e.g., Living Room, Kitchen, Bedroom ${index + 1}`}
            />
            {errors.room_name && errors.room_name[index] && (
              <span className="error">{errors.room_name[index]}</span>
            )}
          </div>
        ))}
      </div>

      <div className="room-suggestions">
        <h4>Common Room Names:</h4>
        <div className="suggestion-chips">
          {[
            'Living Room', 'Kitchen', 'Master Bedroom', 'Bedroom', 'Bathroom', 
            'Dining Room', 'Office', 'Guest Room', 'Laundry Room', 'Storage'
          ].map(suggestion => (
            <button
              key={suggestion}
              type="button"
              className="suggestion-chip"
              onClick={() => {
                const emptyIndex = formData.room_name.findIndex(name => !name.trim());
                if (emptyIndex !== -1) {
                  handleRoomNameChange(emptyIndex, suggestion);
                }
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .room-names-form {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .form-description {
          color: #666;
          margin-bottom: 30px;
          line-height: 1.5;
        }

        .rooms-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .room-input-group {
          display: flex;
          flex-direction: column;
        }

        .room-input-group label {
          font-weight: 600;
          margin-bottom: 5px;
          color: #333;
        }

        .room-input-group input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          transition: border-color 0.3s ease;
        }

        .room-input-group input:focus {
          outline: none;
          border-color: #007bff;
        }

        .error {
          color: #dc3545;
          font-size: 14px;
          margin-top: 5px;
        }

        .room-suggestions {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }

        .room-suggestions h4 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #333;
        }

        .suggestion-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .suggestion-chip {
          background: #e9ecef;
          border: none;
          padding: 8px 12px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s ease;
        }

        .suggestion-chip:hover {
          background: #007bff;
          color: white;
        }

        @media (max-width: 768px) {
          .rooms-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default RoomNamesForm;