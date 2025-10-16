import React, { useEffect, useState } from "react";
import ProgressBar from "../components/ui/ProgressBar";

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
        const res = await fetch("http://localhost:4000/api/inspection-request/client", {
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
    <div className="max-w-4xl mx-auto bg-cream-primary shadow-md p-6 rounded-lg border border-brown-primary-300">
      <h2 className="text-2xl font-bold mb-4 text-brown-primary">My Inspection Requests</h2>

      {loading && <p className="text-brown-secondary">Loading requests...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {requests.length === 0 && !loading && (
        <p className="text-brown-secondary">No inspection requests found.</p>
      )}

      <ul className="space-y-4">
        {requests.map((req) => (
          <li
            key={req._id}
            className="border border-brown-primary-200 p-4 rounded-lg bg-cream-light shadow-sm"
          >
            <p className="text-brown-primary"><strong>Property:</strong> {req.propertyLocation?.address}</p>
            <p className="text-brown-primary"><strong>City:</strong> {req.propertyLocation?.city}</p>
            <p className="text-brown-primary"><strong>Type:</strong> {req.propertyType}</p>
            <p className="text-brown-primary"><strong>Floors:</strong> {req.number_of_floor}</p>
            <p className="text-brown-primary"><strong>Rooms:</strong> {req.number_of_room}</p>
            
            
            <div className="mt-2">
              <ProgressBar status={req.status} />
            </div>

            <p className="text-brown-secondary">
              <strong>Requested At:</strong> {new Date(req.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InspectionRequestDashboard;
