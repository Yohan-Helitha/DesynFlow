// src/pages/AuditLogs.jsx
import Navbar from "../component/navbar";
import React, { useState, useEffect } from "react";
import { fetchAuditLogs, deleteAuditLog } from "../services/FauditLogService.js";
import { Trash2 } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch audit logs
  const getLogs = async () => {
    try {
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false); // <-- stop loading after fetch
    }
  };

  useEffect(() => {
    getLogs();
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this log?");
    if (!confirmDelete) return;

    try {
      await deleteAuditLog(id);
      setLogs(logs.filter(log => log._id !== id));
      alert("Audit log deleted successfully!");
    } catch (err) {
      console.error("Failed to delete log:", err);
      alert("Failed to delete audit log.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <h1 className="text-2xl font-bold mt-6 mb-10">Audit Logs</h1>

        <div className="overflow-x-auto text-xs align-middle">
          <table className="min-w-max border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 w-32">Actions</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Log ID</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Entity</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Action</th>
                <th className="border border-gray-300 px-4 py-2 w-96">Key Info</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Created By</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Created At</th>
              </tr>
            </thead>
            
            <tbody className="align-middle text-center">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center p-4 font-semibold">
                    Loading...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td className="border border-gray-300 px-4 py-2 w-32">
                      <div className="flex items-center justify-center gap-4">
                        <div className="group relative cursor-pointer" onClick={async () => handleDelete(log._id)}>
                          <Trash2 className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            Delete
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{log.logId}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{log.entity}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{log.action}</td>
                    <td className="border border-gray-300 px-4 py-2 w-96 max-w-xs break-words">{log.keyInfo}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{log.createdBy}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-4">No audit logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
