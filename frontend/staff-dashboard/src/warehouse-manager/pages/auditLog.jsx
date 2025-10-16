// src/pages/AuditLogs.jsx
import Navbar from "../component/navbar";
import React, { useState, useEffect, useMemo } from "react";
import { fetchAuditLogs, deleteAuditLog } from "../services/FauditLogService.js";
import { Trash2, Filter, Search, Download, Eye } from "lucide-react";
import { generatePDF } from "../utils/pdfGenerator.js";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [selectedEntities, setSelectedEntities] = useState([]);
  const [selectedActions, setSelectedActions] = useState([]);
  const [createdByChecked, setCreatedByChecked] = useState(false);
  const [createdAtChecked, setCreatedAtChecked] = useState(false);

  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const getLogs = async () => {
      try {
        const data = await fetchAuditLogs();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    getLogs();
  }, []);

  const entityOptions = useMemo(() => {
    const setEnt = new Set();
    logs.forEach(l => { if (l.entity) setEnt.add(l.entity); });
    return Array.from(setEnt).sort();
  }, [logs]);

  const toggleEntity = (entity) => {
    setSelectedEntities(prev => prev.includes(entity) ? prev.filter(e => e !== entity) : [...prev, entity]);
  };

  const toggleAction = (action) => {
    setSelectedActions(prev => prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    try {
      await deleteAuditLog(id);
      setLogs(prev => prev.filter(log => log._id !== id));
      alert("Audit log deleted successfully!");
    } catch (err) {
      console.error("Failed to delete log:", err);
      alert("Failed to delete audit log.");
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const safeToLower = (s) => (s ? String(s).toLowerCase() : "");

  const filteredLogs = useMemo(() => {
    const q = safeToLower(searchQuery).trim();
    return logs.filter(log => {
      const logEntity = safeToLower(log.entity);
      const logAction = safeToLower(log.action);
      const logCreatedBy = safeToLower(log.createdBy);
      const logCreatedAt = safeToLower(new Date(log.createdAt).toLocaleDateString());

      const textMatch = q === "" ? true : (
        logEntity.includes(q) || logAction.includes(q) || logCreatedBy.includes(q) || logCreatedAt.includes(q)
      );

      const entityPass = selectedEntities.length === 0 ? true : selectedEntities.includes(log.entity);
      const actionPass = selectedActions.length === 0 ? true : selectedActions.includes(log.action);
      const createdByPass = !createdByChecked ? true : !!log.createdBy;
      const createdAtPass = !createdAtChecked ? true : !!log.createdAt;

      return textMatch && entityPass && actionPass && createdByPass && createdAtPass;
    });
  }, [logs, searchQuery, selectedEntities, selectedActions, createdByChecked, createdAtChecked]);

  const handleDownloadPDF = () => {
    const columns = ["ID", "Entity", "Action", "Created By", "Created At"];
    const rows = filteredLogs.map(log => [
      log.logId,
      log.entity,
      log.action,
      log.createdBy,
      new Date(log.createdAt).toLocaleString()
    ]);
    generatePDF(columns, rows, "Audit Log Report");
  };

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <h1 className="text-2xl font-bold mt-6 mb-10">Audit Logs</h1>

        {/* Search + Filter */}
        <div className="mb-6 flex justify-end items-center gap-2">
          <Search className="w-5 h-5 text-gray-700" />
          <input
            type="text"
            placeholder="Search (entity, action, createdBy, createdAt)..."
            className="border border-gray-400 px-4 py-2 rounded w-7xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Filter Icon + Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(s => !s)}
              className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500"
              title="Filters"
            >
              <Filter className="w-5 h-5 text-gray-700" />
            </button>

            {showFilter && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded shadow-md w-80 z-50 p-3">

                {/* ENTITY section */}
                <div className="mb-3">
                  <div className="font-semibold mb-1">Entity</div>
                  <div className="">
                    {entityOptions.length === 0 ? (
                      <div className="text-xs text-gray-500">No entities</div>
                    ) : (
                      entityOptions.map(entity => (
                        <label key={entity} className="flex items-center text-sm mb-1">
                          <input
                            type="checkbox"
                            checked={selectedEntities.includes(entity)}
                            onChange={() => toggleEntity(entity)}
                            className="mr-2"
                          />
                          <span className="truncate">{entity}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* ACTION */}
                <div className="mb-3">
                  <div className="font-semibold mb-1">Action</div>
                  {["insert", "update", "delete"].map(action => (
                    <label key={action} className="flex items-center text-sm mb-1">
                      <input
                        type="checkbox"
                        checked={selectedActions.includes(action)}
                        onChange={() => toggleAction(action)}
                        className="mr-2"
                      />
                      <span className="capitalize">{action}</span>
                    </label>
                  ))}
                </div>

                {/* CREATED BY */}
                <div className="mb-3">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={createdByChecked}
                      onChange={() => setCreatedByChecked(!createdByChecked)}
                      className="mr-2"
                    />
                    <span>Created By</span>
                  </label>
                </div>

                {/* CREATED AT */}
                <div className="mb-3">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={createdAtChecked}
                      onChange={() => setCreatedAtChecked(!createdAtChecked)}
                      className="mr-2"
                    />
                    <span>Created At</span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="mt-3 flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setSelectedEntities([]);
                      setSelectedActions([]);
                      setCreatedByChecked(false);
                      setCreatedAtChecked(false);
                    }}
                    className="text-xs px-2 py-1 border rounded"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowFilter(false)}
                    className="text-xs px-2 py-1 bg-amber-500 text-white rounded"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleDownloadPDF}
            className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500"
            title="Download PDF"
          >
            <Download className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto text-xs">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr style={{ background: "#674636", color:"#FFFFFF" }}>
                <th className="border border-gray-300 px-4 py-2 w-32">Actions</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Entity</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Action</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Created By</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Created At</th>
              </tr>
            </thead>

            <tbody className="text-center">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center p-4 font-semibold">Loading...</td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log._id}>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex items-center justify-center gap-8">
                        <div className="cursor-pointer" onClick={() => handleViewDetails(log)}>
                          <Eye className="w-5 h-5 text-[#674636] hover:text-[#A67C52]" />
                        </div>
                        <div className="cursor-pointer" onClick={() => handleDelete(log._id)}>
                          <Trash2 className="w-5 h-5 text-[#674636] hover:text-[#A67C52]" />
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{log.entity}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        log.action === 'insert' ? 'bg-green-100 text-green-800' :
                        log.action === 'update' ? 'bg-blue-100 text-blue-800' :
                        log.action === 'delete' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{log.action}</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{log.createdBy}</td>
                    <td className="border border-gray-300 px-4 py-2">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4">No audit logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal for viewing full details */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">Audit Log Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-amber-500 hover:text-amber-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 text-sm text-gray-800">
              <div className="flex">
                <span className="font-semibold w-32">Log ID:</span> {selectedLog.logId}
              </div>
              <div className="flex">
                <span className="font-semibold w-32">Entity:</span> {selectedLog.entity}
              </div>
              <div className="flex">
                <span className="font-semibold w-32">Action:</span>
                <span className={`ml-1 px-2 py-0.5 rounded text-xs font-semibold ${
                  selectedLog.action === 'insert' ? 'bg-green-100 text-green-800' :
                  selectedLog.action === 'update' ? 'bg-blue-100 text-blue-800' :
                  selectedLog.action === 'delete' ? 'bg-red-100 text-red-800' :
                  selectedLog.action === 'transfer' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedLog.action}
                </span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32">Created By:</span> {selectedLog.createdBy}
              </div>
              <div className="flex">
                <span className="font-semibold w-32">Created At:</span>
                <span>
                  {new Date(selectedLog.createdAt).toISOString().replace('T', ' ').slice(0, 19)}
                </span>
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="font-semibold mb-2 text-sm">Key Information:</div>
                <div className="bg-gray-50 p-3 rounded border text-xs">
                  {(() => {
                    try {
                      const data = JSON.parse(selectedLog.keyInfo);
                      return (
                        <div className="space-y-1">
                          {Object.entries(data).map(([key, value]) => (
                            <div key={key} className="flex flex-wrap">
                              <span className="font-medium text-gray-700 w-44">{key}:</span>
                              <span className="text-gray-900 break-all">{value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    } catch (e) {
                      return <div className="text-gray-700">{selectedLog.keyInfo}</div>;
                    }
                  })()}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 bg-amber-500 text-white rounded hover:bg-amber-600 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default AuditLogs;
