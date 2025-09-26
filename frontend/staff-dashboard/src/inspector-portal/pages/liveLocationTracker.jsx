// LiveLocationTracker.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default marker issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LiveLocationTracker = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch inspector locations
  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:5000/api/inspector-location/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocations(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch locations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <p className="text-center mt-4">Loading map...</p>;
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow">
      <MapContainer
        center={[7.8731, 80.7718]} // Default: Sri Lanka center
        zoom={7}
        style={{ height: "100%", width: "100%" }}
      >
        {/* OSM Base Map */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Inspectors Markers */}
        {locations.map((loc) => (
          <Marker
            key={loc._id}
            position={[loc.inspector_latitude, loc.inspector_longitude]}
          >
            <Popup>
              <div>
                <p><strong>{loc.inspector?.name || "Unknown"}</strong></p>
                <p>Email: {loc.inspector?.email}</p>
                <p>Phone: {loc.inspector?.phone}</p>
                <p>Status: <span className="font-semibold">{loc.status}</span></p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveLocationTracker;
