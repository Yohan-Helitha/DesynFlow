import React, { useEffect, useState } from "react";
import ProgressBar from "./ProgressBar"; // Import the reusable component

const InspectionRequestDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("http://localhost:5000/api/inspection-request/client", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setRequests(data.requests || []);
        } else {
          setError(data.message || "Failed to fetch inspection requests");
        }
      } catch (err) {
        setError("Server error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">My Inspection Requests</h2>

      {loading && <p>Loading requests...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {requests.length === 0 && !loading && (
        <p className="text-gray-600">No inspection requests found.</p>
      )}

      <ul className="space-y-4">
        {requests.map((req) => (
          <li key={req._id} className="border p-4 rounded-lg">
            <p><strong>Property:</strong> {req.propertyLocation?.address}</p>
            <p><strong>City:</strong> {req.propertyLocation?.city}</p>
            <p><strong>Type:</strong> {req.propertyType}</p>
            <p><strong>Floors:</strong> {req.number_of_floor}</p>
            <p><strong>Rooms:</strong> {req.number_of_room}</p>
            
            {/* Replaced status display with ProgressBar */}
            <div className="mt-2">
              <ProgressBar status={req.status} />
            </div>

            <p><strong>Requested At:</strong> {new Date(req.createdAt).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InspectionRequestDashboard;
