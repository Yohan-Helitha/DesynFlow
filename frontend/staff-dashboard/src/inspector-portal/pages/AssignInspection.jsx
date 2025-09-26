// AssignInspection.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import InspectorSelector from "./InspectorSelector";

const AssignInspection = () => {
  const [inspectionRequests, setInspectionRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedInspector, setSelectedInspector] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch pending inspection requests
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(
        "http://localhost:5000/api/inspection-request/list?status=pending",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInspectionRequests(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch requests:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAssign = async () => {
    if (!selectedRequest || !selectedInspector) {
      setMessage("❌ Please select both request and inspector.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        "http://localhost:5000/api/assignment/assign",
        {
          inspectionRequestId: selectedRequest._id,
          inspectorId: selectedInspector._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`✅ ${res.data.message}`);
      // Reset selections
      setSelectedRequest(null);
      setSelectedInspector(null);
      fetchRequests(); // Refresh requests
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to assign inspector.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Assign Inspector</h2>

      {message && (
        <div className="p-3 rounded bg-blue-100 text-blue-700">{message}</div>
      )}

      {/* Select Inspection Request */}
      <div>
        <label className="block mb-2 font-medium text-gray-700">Inspection Request</label>
        <select
          value={selectedRequest?._id || ""}
          onChange={(e) =>
            setSelectedRequest(
              inspectionRequests.find((r) => r._id === e.target.value)
            )
          }
          className="w-full border p-2 rounded"
        >
          <option value="">-- Select Request --</option>
          {inspectionRequests.map((req) => (
            <option key={req._id} value={req._id}>
              {req.title || `Request ${req._id}`} - {req.status}
            </option>
          ))}
        </select>
      </div>

      {/* Select Inspector */}
      <div>
        <label className="block mb-2 font-medium text-gray-700">Select Inspector on Map</label>
        <InspectorSelector onSelect={setSelectedInspector} />
        {selectedInspector && (
          <p className="mt-2 text-sm text-gray-600">
            Selected Inspector: <strong>{selectedInspector.inspector?.name}</strong> ({selectedInspector.status})
          </p>
        )}
      </div>

      <button
        onClick={handleAssign}
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? "Assigning..." : "Assign Inspector"}
      </button>
    </div>
  );
};

export default AssignInspection;
