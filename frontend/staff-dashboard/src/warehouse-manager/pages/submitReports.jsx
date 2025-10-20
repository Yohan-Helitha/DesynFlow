// import React, { useState, useEffect } from "react";
// import Navbar from "../component/navbar.jsx";
// import { useNavigate } from "react-router-dom";
// import { Eye, Search, Filter } from "lucide-react";
// import { fetchReports } from "../services/FsubmitReportsService.js"; // your API service

// const SubmitReports = () => {
//   const navigate = useNavigate();
//   const [reports, setReports] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterBy, setFilterBy] = useState("all");
//   const [showFilter, setShowFilter] = useState(false);

//   // Helper function to get full file URL
//   const getFileUrl = (relativePath) => {
//     if (!relativePath) return "#";
//     // If it's already a full URL, return as is
//     if (relativePath.startsWith("http")) return relativePath;
//     // Otherwise, construct the full URL
//     return `http://localhost:4000/${relativePath}`;
//   };

//   // Fetch reports
//   const getReports = async () => {
//     try {
//       console.log("Getting reports...");
//       const data = await fetchReports();
//       console.log("Fetched reports data:", data);
//       setReports(data);
//       console.log("Set reports state:", data);
//     } catch (err) {
//       console.error("Failed to fetch reports:", err);
//     }
//   };

//   useEffect(() => {
//     getReports();
//   }, []);

//   // Filtered reports
//   const filteredReports = reports.filter(r => {
//     const query = searchQuery.toLowerCase();
//     if (filterBy === "title") return r.reportTitle?.toLowerCase().includes(query);
//     if (filterBy === "submittedBy") return r.submittedBy?.toLowerCase().includes(query);
//     if (filterBy === "date") return new Date(r.createdAt).toLocaleDateString().includes(query);
//     if (filterBy === "all")
//       return (
//         r.reportTitle?.toLowerCase().includes(query) ||
//         r.submittedBy?.toLowerCase().includes(query) ||
//         new Date(r.createdAt).toLocaleDateString().includes(query)
//       );
//     return false;
//   });

//   return (
//     <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
//       <Navbar />
//       <div className="m-6">
//         <div className="flex justify-between items-center">
//           <h1 className="text-2xl font-bold mt-6 mb-10">Submitted Reports</h1>
//           <button
//             className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10"
//             onClick={() => navigate("/warehouse-manager/submit-reports/add")}
//           >
//             + Submit Report
//           </button>
//         </div>

//         {/* Search + Filter */}
//         <div className="mb-6 flex justify-end items-center gap-2">
//           <Search className="w-5 h-5 text-gray-700" />
//           <input
//             type="text"
//             placeholder="Search..."
//             className="border border-gray-400 px-4 py-2 bg-white rounded w-6xl focus:outline-none focus:ring-2 focus:ring-amber-500"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//           <div className="relative">
//             <button
//               onClick={() => setShowFilter(!showFilter)}
//               className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500"
//             >
//               <Filter className="w-5 h-5 text-gray-700" />
//             </button>
//             {showFilter && (
//               <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded shadow-md w-40 z-50">
//                 <ul className="text-sm">
//                   <li className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy==="all"?"bg-gray-200":""}`} onClick={() => { setFilterBy("all"); setShowFilter(false); }}>All</li>
//                   <li className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy==="title"?"bg-gray-200":""}`} onClick={() => { setFilterBy("title"); setShowFilter(false); }}>Report Title</li>
//                   <li className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy==="submittedBy"?"bg-gray-200":""}`} onClick={() => { setFilterBy("submittedBy"); setShowFilter(false); }}>Submitted By</li>
//                   <li className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy==="date"?"bg-gray-200":""}`} onClick={() => { setFilterBy("date"); setShowFilter(false); }}>Date</li>
//                 </ul>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Reports Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredReports.length > 0 ? filteredReports.map(r => (
//             <div key={r._id} className="bg-[#FFF8E8] border border-gray-300 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
//               {/* Report Title */}
//               <h3 className="text-lg font-semibold text-[#674636] mb-3 break-words">
//                 {r.reportTitle}
//               </h3>
              
//               {/* Report Details */}
//               <div className="space-y-2 text-sm text-gray-700 mb-4">
//                 <div className="flex justify-between">
//                   <span className="font-medium">Submitted By:</span>
//                   <span>{r.submittedBy}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="font-medium">Created At:</span>
//                   <span>{new Date(r.createdAt).toLocaleDateString()}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="font-medium">Time:</span>
//                   <span>{new Date(r.createdAt).toLocaleTimeString()}</span>
//                 </div>
//               </div>
              
//               {/* File Action */}
//               <div className="flex justify-center">
//                 <a 
//                   href={getFileUrl(r.reportFileUrl)} 
//                   target="_blank" 
//                   rel="noreferrer" 
//                   className="inline-flex items-center gap-2 bg-[#674636] hover:bg-[#A67C52] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
//                 >
//                   <Eye className="w-4 h-4" />
//                   View Report
//                 </a>
//               </div>
//             </div>
//           )) : (
//             <div className="col-span-full text-center p-8 text-gray-500">
//               <div className="bg-[#FFF8E8] border border-gray-300 rounded-lg p-8">
//                 <h3 className="text-lg font-medium text-gray-700 mb-2">No reports found</h3>
//                 <p className="text-sm">No reports match your current search criteria.</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SubmitReports;

import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar.jsx";
import { useNavigate } from "react-router-dom";
import { Eye, Search, Filter, Calendar, User, FileText } from "lucide-react";
import { fetchReports } from "../services/FsubmitReportsService.js";

const SubmitReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilter, setShowFilter] = useState(false);

  // Helper function to get full file URL
  const getFileUrl = (relativePath) => {
    if (!relativePath) return "#";
    // If it's already a full URL, return as is
    if (relativePath.startsWith("http")) return relativePath;

    // Normalize Windows backslashes to forward slashes and ensure leading slash
    const normalized = relativePath.replace(/\\/g, '/');
    const path = normalized.startsWith('/') ? normalized : `/${normalized}`;

    // Return a site-relative path (browser will use current origin). This avoids hard-coding localhost:4000
    // and prevents ERR_CONNECTION_REFUSED when the backend isn't running at that address.
    return path;
  };

  // Fetch reports
  const getReports = async () => {
    try {
      console.log("Getting reports...");
      const data = await fetchReports();
      console.log("Fetched reports data:", data);
      setReports(data);
      console.log("Set reports state:", data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  };

  useEffect(() => {
    getReports();
  }, []);

  // Filtered reports
  const filteredReports = reports.filter(r => {
    const query = searchQuery.toLowerCase();
    if (filterBy === "title") return r.reportTitle?.toLowerCase().includes(query);
    if (filterBy === "submittedBy") return r.submittedBy?.toLowerCase().includes(query);
    if (filterBy === "date") return new Date(r.createdAt).toLocaleDateString().includes(query);
    if (filterBy === "all")
      return (
        r.reportTitle?.toLowerCase().includes(query) ||
        r.submittedBy?.toLowerCase().includes(query) ||
        new Date(r.createdAt).toLocaleDateString().includes(query)
      );
    return false;
  });

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navbar />
      <div className="m-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mt-6 mb-10">Submitted Reports</h1>
          <button
            className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10"
            onClick={() => navigate("/warehouse-manager/submit-reports/add")}
          >
            + Submit Report
          </button>
        </div>

        {/* Search + Filter - Unchanged */}
        <div className="mb-6 flex justify-end items-center gap-2">
          <Search className="w-5 h-5 text-gray-700" />
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-400 px-4 py-2 bg-white rounded w-6xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500"
            >
              <Filter className="w-5 h-5 text-gray-700" />
            </button>
            {showFilter && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded shadow-md w-40 z-50">
                <ul className="text-sm">
                  <li className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy==="all"?"bg-gray-200":""}`} onClick={() => { setFilterBy("all"); setShowFilter(false); }}>All</li>
                  <li className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy==="title"?"bg-gray-200":""}`} onClick={() => { setFilterBy("title"); setShowFilter(false); }}>Report Title</li>
                  <li className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy==="submittedBy"?"bg-gray-200":""}`} onClick={() => { setFilterBy("submittedBy"); setShowFilter(false); }}>Submitted By</li>
                  <li className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy==="date"?"bg-gray-200":""}`} onClick={() => { setFilterBy("date"); setShowFilter(false); }}>Date</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Updated Reports Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.length > 0 ? filteredReports.map(r => (
            <div key={r._id} className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-amber-200 overflow-hidden">
              
              {/* Card Header */}
              <div className="bg-amber-800 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white line-clamp-2 flex-1">
                    {r.reportTitle}
                  </h3>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-5">
                {/* Report Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <User className="w-4 h-4 text-amber-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Submitted By</p>
                      <p className="text-sm font-semibold text-gray-800">{r.submittedBy}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Calendar className="w-4 h-4 text-amber-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Created On</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(r.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(r.createdAt).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Action Button */}
                <div className="flex justify-center">
                  <a
                    href={getFileUrl(r.reportFileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      // open via window.open as a reliable fallback. Build full URL using current origin.
                      const path = getFileUrl(r.reportFileUrl);
                      const fullUrl = `${window.location.origin}${path}`;
                      try {
                        window.open(fullUrl, '_blank');
                      } catch (err) {
                        console.error('window.open failed', err);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-amber-900 hover:bg-amber-800 text-white px-4 py-3 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    <Eye className="w-4 h-4" />
                    View Report
                  </a>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center p-8 text-gray-500">
              <div className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No reports found</h3>
                <p className="text-sm">No reports match your current search criteria.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitReports;