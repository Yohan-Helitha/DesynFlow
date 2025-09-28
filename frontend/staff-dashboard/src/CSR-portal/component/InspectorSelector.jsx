// InspectorSelector.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const InspectorSelector = ({ onSelect }) => {
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInspectors = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(
        "http://localhost:4000/api/inspector-location/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInspectors(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch inspectors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspectors();
  }, []);

  if (loading) return <p className="text-center mt-4">Loading inspectors...</p>;

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow">
      <MapContainer
        center={[7.8731, 80.7718]} // Sri Lanka center
        zoom={7}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {inspectors.map((inspector) => (
          <Marker
            key={inspector._id}
            position={[inspector.inspector_latitude, inspector.inspector_longitude]}
            eventHandlers={{
              click: () => onSelect(inspector), // Call onSelect when marker is clicked
            }}
          >
            <Popup>
              <div>
                <p>
                  <strong>{inspector.inspector?.name || "Unknown"}</strong>
                </p>
                <p>Email: {inspector.inspector?.email}</p>
                <p>Phone: {inspector.inspector?.phone}</p>
                <p>Status: <span className="font-semibold">{inspector.status}</span></p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default InspectorSelector;
