// // src/pages/AuditLogs.jsx
// import Navbar from "../component/navbar";
// import React, { useState, useEffect } from "react";
// import { fetchAuditLogs, deleteAuditLog } from "../services/FauditLogService.js";
// import { Trash2,Filter,Search, Download } from 'lucide-react';
// import { generatePDF } from "../utils/pdfGenerator.js";

// const AuditLogs = () => {
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterBy, setFilterBy] = useState("all");
//   const [showFilter, setShowFilter] = useState(false);

//   // Fetch audit logs
//   const getLogs = async () => {
//     try {
//       const data = await fetchAuditLogs();
//       setLogs(data);
//     } catch (err) {
//       console.error("Failed to fetch audit logs:", err);
//     } finally {
//       setLoading(false); 
//     }
//   };

//   useEffect(() => {
//     getLogs();
//   }, []);

//   // Delete handler
//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm("Are you sure you want to delete this log?");
//     if (!confirmDelete) return;

//     try {
//       await deleteAuditLog(id);
//       setLogs(logs.filter(log => log._id !== id));
//       alert("Audit log deleted successfully!");
//     } catch (err) {
//       console.error("Failed to delete log:", err);
//       alert("Failed to delete audit log.");
//     }
//   };

//   // Filtering logic
//     const filteredLogs = logs.filter((log) => {
//     const query = searchQuery.toLowerCase();

//     if (filterBy === "id") {
//       return log.materialId?.toLowerCase().includes(query);
//     }
//     if (filterBy === "entity") {
//       return log.entity?.toLowerCase().includes(query);
//     }
//     if (filterBy === "action") {
//       return log.action?.toLowerCase().includes(query);
//     }
//     if (filterBy === "createdBy") {
//       return log.createdBy?.toLowerCase().includes(query);
//     }
//     if (filterBy === "createdAt") {
//       return new Date(log.createdAt).toLocaleString().toLowerCase().includes(query);
//     }

//     // Default: search all
//     if (filterBy === "all") {
//     return (
//       log.materialId?.toLowerCase().includes(query) ||
//       log.entity?.toLowerCase().includes(query) ||
//       log.action?.toLowerCase().includes(query) ||
//       log.createdBy?.toLowerCase().includes(query) ||
//       new Date(log.createdAt).toLocaleString().toLowerCase().includes(query)
//     );
//   }
//   });

//   //pdf function
//     const handleDownloadPDF = () => {
//       console.log("Downloading PDF...");
  
//       const columns = [
//       "ID", "Entity", "Action", "Key Info", "Created By", "Created At"
//       ];
  
//       const rows = filteredLogs.map(log => [
//         log.logId,
//         log.entity,
//         log.action,
//         log.keyInfo,
//         log.createdBy,
//         new Date(log.createdAt).toLocaleString()
//       ]);
  
//       generatePDF(columns, rows, "Audit Log Report", {
//       columnStyles: {
//         3: { cellWidth: 200 },
//       },
//   });
  
//     };

//   return (
//     <div>
//       <Navbar />
//       <div className="m-6">
//         <h1 className="text-2xl font-bold mt-6 mb-10">Audit Logs</h1>

//         {/* 🔎 Search + Filter */}
//         <div className="mb-6 flex justify-end items-center gap-2">
//           <Search className="w-5 h-5 text-gray-700" />
//           <input
//             type="text"
//             placeholder="Search..."
//             className="border border-gray-400 px-4 py-2 bg-white rounded w-7xl focus:outline-none focus:ring-2 focus:ring-amber-500"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />

//           {/* Filter Icon + Dropdown Wrapper */}
//           <div className="relative">
//             <button
//               onClick={() => setShowFilter(!showFilter)}
//               className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500"
//             >
//               <Filter className="w-5 h-5 text-gray-700" />
//             </button>

//             {/* Dropdown */}
//             {showFilter && (
//               <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded shadow-md w-40 z-50">
//                 <ul className="text-sm">
//                   <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "all" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("all"); setSearchQuery(""); setShowFilter(false); }}
//                   >
//                     All
//                   </li>
//                   <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "id" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("id"); setSearchQuery(""); setShowFilter(false); }}
//                   >
//                     Log ID
//                   </li>
//                   <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "entity" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("entity"); setSearchQuery(""); setShowFilter(false); }}
//                   >
//                     Entity
//                   </li>
//                   <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "action" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("action"); setSearchQuery(""); setShowFilter(false); }}
//                   >
//                     Action
//                   </li>
//                   <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "createdBy" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("createdBy"); setSearchQuery(""); setShowFilter(false); }}
//                   >
//                     Created by
//                   </li>
//                   <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "createdAt" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("createdAt"); setSearchQuery(""); setShowFilter(false); }}
//                   >
//                     Created at
//                   </li>
//                 </ul>
//               </div>
//             )}
//           </div>

//           <button
//             onClick={handleDownloadPDF}
//             className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500"
//             title="Download PDF"
//           >
//             <Download className="w-5 h-5 text-gray-700" />
//           </button>
//         </div>  

//         <div className="overflow-x-auto text-xs align-middle">
//           <table className="min-w-max border-collapse border border-gray-300">
//             <thead>
//               <tr style={{ background: "#674636", color:"#FFFFFF" }}>
//                 <th className="border border-gray-300 px-4 py-2 w-32">Actions</th>
//                 <th className="border border-gray-300 px-4 py-2 w-32">Log ID</th>
//                 <th className="border border-gray-300 px-4 py-2 w-48">Entity</th>
//                 <th className="border border-gray-300 px-4 py-2 w-32">Action</th>
//                 <th className="border border-gray-300 px-4 py-2 w-96">Key Info</th>
//                 <th className="border border-gray-300 px-4 py-2 w-32">Created By</th>
//                 <th className="border border-gray-300 px-4 py-2 w-32">Created At</th>
//               </tr>
//             </thead>
            
//             <tbody className="align-middle text-center">
//               {loading ? (
//                 <tr>
//                   <td colSpan="7" className="text-center p-4 font-semibold">
//                     Loading...
//                   </td>
//                 </tr>
//               ) : filteredLogs.length > 0 ? (
//                 filteredLogs.map((log) => (
//                   <tr key={log._id}>
//                     <td className="border border-gray-300 px-4 py-2 w-32">
//                       <div className="flex items-center justify-center gap-4">
//                         <div className="group relative cursor-pointer" onClick={async () => handleDelete(log._id)}>
//                           <Trash2 className="w-5 h-5 text-[#674636] hover:text-[#A67C52]" />
                          
//                         </div>
//                       </div>
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2 w-32">{log.logId}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-48">{log.entity}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-32">{log.action}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-96 max-w-xs break-words">{log.keyInfo}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-32">{log.createdBy}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-32">{new Date(log.createdAt).toLocaleString()}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" className="text-center p-4">No audit logs found.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuditLogs;

// src/pages/AuditLogs.jsx
import Navbar from "../component/navbar";
import React, { useState, useEffect } from "react";
import { fetchAuditLogs, deleteAuditLog } from "../services/FauditLogService.js";
import { Trash2, Filter, Search, Download, Eye } from 'lucide-react';
import { generatePDF } from "../utils/pdfGenerator.js";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Format keyInfo for readable display (inline with line breaks)
  const formatKeyInfoInline = (keyInfoString) => {
    try {
      const data = JSON.parse(keyInfoString);
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n'); // Use newline for breaks
    } catch (e) {
      return keyInfoString; // Return as-is if not JSON
    }
  };

  // Format keyInfo for PDF (single line with commas)
  const formatKeyInfoForPDF = (keyInfoString) => {
    try {
      const data = JSON.parse(keyInfoString);
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    } catch (e) {
      return keyInfoString;
    }
  };

  // Get short preview of keyInfo
  const getKeyInfoPreview = (keyInfoString, maxLines = 2) => {
    try {
      const data = JSON.parse(keyInfoString);
      const entries = Object.entries(data);
      const preview = entries
        .slice(0, maxLines)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      
      return entries.length > maxLines ? preview + '\n...' : preview;
    } catch (e) {
      return keyInfoString;
    }
  };

  // Fetch audit logs
  const getLogs = async () => {
    try {
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
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

  // View details handler
  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  // Filtering logic
  const filteredLogs = logs.filter((log) => {
    const query = searchQuery.toLowerCase();

    if (filterBy === "id") {
      return log.logId?.toLowerCase().includes(query);
    }
    if (filterBy === "entity") {
      return log.entity?.toLowerCase().includes(query);
    }
    if (filterBy === "action") {
      return log.action?.toLowerCase().includes(query);
    }
    if (filterBy === "createdBy") {
      return log.createdBy?.toLowerCase().includes(query);
    }
    if (filterBy === "createdAt") {
      return new Date(log.createdAt).toLocaleString().toLowerCase().includes(query);
    }

    // Default: search all
    if (filterBy === "all") {
      return (
        log.logId?.toLowerCase().includes(query) ||
        log.entity?.toLowerCase().includes(query) ||
        log.action?.toLowerCase().includes(query) ||
        log.createdBy?.toLowerCase().includes(query) ||
        formatKeyInfoInline(log.keyInfo).toLowerCase().includes(query) ||
        new Date(log.createdAt).toLocaleString().toLowerCase().includes(query)
      );
    }
  });

  // PDF function
  const handleDownloadPDF = () => {
    const columns = [
      "ID", "Entity", "Action", "Key Info", "Created By", "Created At"
    ];

    const rows = filteredLogs.map(log => [
      log.logId,
      log.entity,
      log.action,
      formatKeyInfoForPDF(log.keyInfo),
      log.createdBy,
      new Date(log.createdAt).toLocaleString()
    ]);

    generatePDF(columns, rows, "Audit Log Report", {
      columnStyles: {
        3: { cellWidth: 200 },
      },
    });
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
            placeholder="Search..."
            className="border border-gray-400 px-4 py-2 rounded w-7xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Filter Icon + Dropdown Wrapper */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500"
            >
              <Filter className="w-5 h-5 text-gray-700" />
            </button>

            {/* Dropdown */}
            {showFilter && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded shadow-md w-40 z-50">
                <ul className="text-sm">
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "all" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("all"); setSearchQuery(""); setShowFilter(false); }}
                  >
                    All
                  </li>
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "id" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("id"); setSearchQuery(""); setShowFilter(false); }}
                  >
                    Log ID
                  </li>
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "entity" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("entity"); setSearchQuery(""); setShowFilter(false); }}
                  >
                    Entity
                  </li>
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "action" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("action"); setSearchQuery(""); setShowFilter(false); }}
                  >
                    Action
                  </li>
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "createdBy" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("createdBy"); setSearchQuery(""); setShowFilter(false); }}
                  >
                    Created by
                  </li>
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "createdAt" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("createdAt"); setSearchQuery(""); setShowFilter(false); }}
                  >
                    Created at
                  </li>
                </ul>
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

        <div className="overflow-x-auto text-xs">
          <table className="min-w-full border-collapse border border-gray-300">
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

            <tbody className="text-center">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center p-4 font-semibold">
                    Loading...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log._id}>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <div className="group relative cursor-pointer" onClick={() => handleViewDetails(log)}>
                          <Eye className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            View Details
                          </span>
                        </div>
                        <div className="group relative cursor-pointer" onClick={() => handleDelete(log._id)}>
                          <Trash2 className="w-5 h-5 text-red-500 hover:text-red-700" />
                          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Delete
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{log.logId}</td>
                    <td className="border border-gray-300 px-4 py-2">{log.entity}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        log.action === 'insert' ? 'bg-green-100 text-green-800' :
                        log.action === 'update' ? 'bg-blue-100 text-blue-800' :
                        log.action === 'delete' ? 'bg-red-100 text-red-800' :
                        log.action === 'transfer' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 max-w-xs text-left align-top">
                      <div className="whitespace-pre-line text-xs leading-relaxed">
                        {formatKeyInfoInline(log.keyInfo, 3)}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{log.createdBy}</td>
                    <td className="border border-gray-300 px-4 py-2">{new Date(log.createdAt).toLocaleString()}</td>
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

      {/* Modal for viewing full details */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Audit Log Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="font-semibold">Log ID:</span> {selectedLog.logId}
              </div>
              <div>
                <span className="font-semibold">Entity:</span> {selectedLog.entity}
              </div>
              <div>
                <span className="font-semibold">Action:</span>{' '}
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  selectedLog.action === 'insert' ? 'bg-green-100 text-green-800' :
                  selectedLog.action === 'update' ? 'bg-blue-100 text-blue-800' :
                  selectedLog.action === 'delete' ? 'bg-red-100 text-red-800' :
                  selectedLog.action === 'transfer' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedLog.action}
                </span>
              </div>
              <div>
                <span className="font-semibold">Created By:</span> {selectedLog.createdBy}
              </div>
              <div>
                <span className="font-semibold">Created At:</span> {new Date(selectedLog.createdAt).toLocaleString()}
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="font-semibold mb-2">Key Information:</div>
                <div className="bg-gray-50 p-4 rounded border">
                  {(() => {
                    try {
                      const data = JSON.parse(selectedLog.keyInfo);
                      return (
                        <div className="space-y-2">
                          {Object.entries(data).map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className="font-medium text-gray-700 w-40">{key}:</span>
                              <span className="text-gray-900">{value}</span>
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

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;