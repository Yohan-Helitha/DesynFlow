import React, { useEffect, useState } from "react";
import axios from "axios";
import ProgressBar from "./ProgressBar"; 

const RequestStatusView = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get("/api/inspection-request/client", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(res.data || []);
      } catch (err) {
        setError("Failed to fetch request status.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) return <p className="text-center py-6">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (requests.length === 0)
    return <p className="text-center text-gray-600">No inspection requests found.</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        My Inspection Request Status
      </h2>

      <div className="space-y-6">
        {requests.map((req) => (
          <div
            key={req._id}
            className="border p-4 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {req.propertyLocation?.address}, {req.propertyLocation?.city}
            </h3>
            <p className="text-sm text-gray-600">
              <strong>Property Type:</strong> {req.propertyType}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Requested Date:</strong>{" "}
              {new Date(req.inspection_date).toLocaleDateString()}
            </p>

            {/* Replaced inline progress bar with reusable component */}
            <div className="mt-4">
              <ProgressBar status={req.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestStatusView;
