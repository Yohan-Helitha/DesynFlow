import React, { useEffect, useState } from "react";
import "./Sample_order_list.css";

function Sample_order_list() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all sample orders (could filter by supplier/user if needed)
    fetch("http://localhost:3000/api/samples/all")
      .then(res => res.json())
      .then(data => {
        setSamples(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setSamples([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="sample-order-list-page">
      <h2>📦 Sample Order Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : samples.length === 0 ? (
        <p>No sample requests found.</p>
      ) : (
        <table className="sample-order-list-table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Material</th>
              <th>Requested By</th>
              <th>Status</th>
              <th>Note</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((s, idx) => (
                <tr key={s._id || idx}>
                  <td>{s.supplierId?.companyName || s.supplierId || "Unknown"}</td>
                  <td>{s.materialId?.name || s.materialId || "Unknown"}</td>
                  <td>{s.requestedBy?.name || s.requestedBy || "Unknown"}</td>
                  <td>{s.status}</td>
                  <td>{s.reviewNote || "-"}</td>
                  <td>{new Date(s.createdAt).toLocaleString()}</td>
                  <td>
                    <a href={`/Sample_order_details/${s._id}`} className="details-link">View Details</a>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Sample_order_list;
