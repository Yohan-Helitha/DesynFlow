// LocationUpdater.jsx
import React, { useState } from "react";
import axios from "axios";

const LocationUpdater = () => {
  const [status, setStatus] = useState("available");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const updateLocation = () => {
    if (!navigator.geolocation) {
      setMessage("❌ Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const token = localStorage.getItem("authToken");
          const res = await axios.post(
            "http://localhost:5000/api/inspector-location/update",
            {
              inspectorId: localStorage.getItem("userId"), // store userId at login
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              status,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setMessage(`✅ ${res.data.message}`);
        } catch (err) {
          setMessage("❌ Failed to update location.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setMessage("❌ Failed to get your location.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Update My Location</h2>

      {message && (
        <div className="mb-4 p-3 rounded text-sm bg-blue-100 text-blue-700">
          {message}
        </div>
      )}

      <label className="block mb-2 text-gray-700 text-sm font-medium">
        Status
      </label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      >
        <option value="available">Available</option>
        <option value="busy">Busy</option>
        <option value="offline">Offline</option>
      </select>

      <button
        onClick={updateLocation}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Updating..." : "Update Location"}
      </button>
    </div>
  );
};

export default LocationUpdater;
