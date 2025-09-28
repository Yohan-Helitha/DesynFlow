// src/pages/ReportList.jsx
import React, { useEffect, useState } from "react";

const ReportList = ({ managerId }) => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:4000/api/reports/manager/${managerId}`)
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(err => console.error(err));
  }, [managerId]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Inspection Reports</h2>
      {reports.length === 0 ? (
        <p>No reports available</p>
      ) : (
        <ul className="space-y-4">
          {reports.map(r => (
            <li key={r._id} className="border p-4 rounded shadow">
              <h3 className="font-semibold">Report ID: {r._id}</h3>
              <p><strong>Inspector:</strong> {r.inspectorId?.username}</p>
              <p><strong>Content:</strong> {r.content}</p>
              <p className="text-sm text-gray-500">
                Created: {new Date(r.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReportList;
