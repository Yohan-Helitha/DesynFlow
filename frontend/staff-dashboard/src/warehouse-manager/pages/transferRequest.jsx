// import React, { useState, useEffect } from "react";
// import Navbar from "../component/navbar.jsx";
// import { fetchTransferRequests, deleteTransferRequest } from "../services/FtransferRequestService.js";
// import { Edit2, Trash2,Filter,Search, Download } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { generatePDF } from "../utils/pdfGenerator.js";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";


// const TransferRequest = () => {
//   const [requests, setRequests] = useState([]);
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterBy, setFilterBy] = useState("all");
//   const [showFilter, setShowFilter] = useState(false);
//   const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

//   // Fetch transfer requests
//   const getRequests = async () => {
//     try {
//       const data = await fetchTransferRequests();
//       setRequests(data);
//     } catch (err) {
//       console.error("Failed to fetch transfer requests:", err);
//     }
//   };

//   useEffect(() => {
//     getRequests();
//   }, []);

//   // Delete handler
//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm("Are you sure you want to delete this transfer request?");
//     if (!confirmDelete) return;

//     try {
//       await deleteTransferRequest(id);
//       await getRequests();
//       alert("Transfer request deleted successfully!");
//     } catch (err) {
//       console.error("Failed to delete transfer request:", err);
//       alert("Failed to delete transfer request.");
//     }
//   };

//   // Filtering logic
//     const filteredRequests = requests.filter((request) => {
//     const query = searchQuery.toLowerCase();

//     if (filterBy === "id") {
//       return request.transferRequestId?.toLowerCase().includes(query);
//     }
//     if (filterBy === "materialId") {
//       return request.materialId?.toLowerCase().includes(query);
//     }
//     if (filterBy === "fromLocation") {
//       return request.fromLocation?.toLowerCase().includes(query);
//     }
//     if (filterBy === "toLocation") {
//       return request.toLocation?.toLowerCase().includes(query);
//     }
//     if(filterBy === "requestedBy") {
//       return request.requestedBy?.toLowerCase().includes(query);
//     }
//     if(filterBy === "approvedBy") {
//       return request.approvedBy?.toLowerCase().includes(query);
//     }
//     if(filterBy === "status") {
//       return request.status?.toLowerCase().includes(query);
//     }
//     if (filterBy === "requiredBy") {
//       return new Date(request.requiredBy).toLocaleString().toLowerCase().includes(query);
//     }
//     if(filterBy === "createdAt") {
//       return new Date(request.createdAt).toLocaleString().toLowerCase().includes(query);
//     }

//     // Default: search all
//     if (filterBy === "all") {
//     return (
//       request.transferRequestId?.toLowerCase().includes(query) ||
//       request.materialId?.toLowerCase().includes(query) ||
//       request.fromLocation?.toLowerCase().includes(query) ||
//       request.toLocation?.toLowerCase().includes(query) ||
//       request.requestedBy?.toLowerCase().includes(query) ||
//       request.approvedBy?.toLowerCase().includes(query) ||
//       request.status?.toLowerCase().includes(query) ||
//       request.requiredBy?.toLowerCase().includes(query) ||
//       new Date(request.createdAt).toLocaleString().toLowerCase().includes(query)
//     );
//     }
//   });

//   //pdf function
//     const handleDownloadPDF = (timeFilter = 'all') => {
//       console.log("Downloading PDF for:", timeFilter);

//       let dataToDownload = filteredRequests;
      
//       // Filter data based on time selection
//       if (timeFilter !== 'all') {
//         const now = new Date();
//         const currentYear = now.getFullYear();
//         const currentMonth = now.getMonth() + 1;
        
//         dataToDownload = filteredRequests.filter(request => {
//           const requestDate = new Date(request.createdAt);
//           const requestYear = requestDate.getFullYear();
//           const requestMonth = requestDate.getMonth() + 1;
          
//           switch (timeFilter) {
//             case 'thisMonth':
//               return requestYear === currentYear && requestMonth === currentMonth;
//             case 'previousMonth':
//               const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
//               const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
//               return requestYear === prevYear && requestMonth === prevMonth;
//             case 'thisYear':
//               return requestYear === currentYear;
//             default:
//               if (typeof timeFilter === 'number' && timeFilter >= 1 && timeFilter <= 12) {
//                 return requestYear === currentYear && requestMonth === timeFilter;
//               }
//               return true;
//           }
//         });
//       }
  
//       const columns = [
//       "ID", "Material ID", "From Location", "To Location", "Quantity", "Reason", "Requested By", 
//       "Approved By", "Status", "Required By", "Created At", "Updated At"
//       ];
  
//       const rows = dataToDownload.map(request => [
//         request.transferRequestId,
//         request.materialId,
//         request.fromLocation,
//         request.toLocation,
//         request.quantity,
//         request.reason,
//         request.requestedBy,
//         request.approvedBy,
//         request.status,
//         request.requiredBy,
//         new Date(request.createdAt).toLocaleString(),
//         new Date(request.updatedAt).toLocaleString()
//       ]);

//       const timeFilterName = timeFilter === 'all' ? 'All Records' : 
//                             timeFilter === 'thisMonth' ? 'This Month' :
//                             timeFilter === 'previousMonth' ? 'Previous Month' :
//                             timeFilter === 'thisYear' ? 'This Year' :
//                             typeof timeFilter === 'number' ? new Date(2024, timeFilter - 1).toLocaleString('default', { month: 'long' }) :
//                             'Filtered';
  
//       generatePDF(columns, rows, `Transfer Request Report - ${timeFilterName}`);
//       setShowDownloadDropdown(false);
//     };

//     // Chart data based on all requests, NOT filteredRequests
//     const chartData = requests.reduce((acc, req) => {
//       const fromKey = req.fromLocation?.trim();
//       const toKey = req.toLocation?.trim();

//       // Count Sent
//       if (fromKey) {
//         if (!acc[fromKey]) {
//           acc[fromKey] = { warehouse: fromKey, sent: 0, received: 0 };
//         }
//         acc[fromKey].sent += 1;
//       }

//       // Count Received
//       if (toKey) {
//         if (!acc[toKey]) {
//           acc[toKey] = { warehouse: toKey, sent: 0, received: 0 };
//         }
//         acc[toKey].received += 1;
//       }

//       return acc;
//     }, {});

//     const chartArray = Object.values(chartData);

//   return (
//     <div>
//       <Navbar />
//       <div className="m-6">
//         <div className="flex justify-between items-center">
//           <h1 className="text-2xl font-bold mt-6 mb-10">Transfer Requests</h1>
//           <button
//             className="bg-amber-900 hover:bg-bamber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10"
//             onClick={() => navigate("/warehouse-manager/transfer-request/add")}
//           >
//             + Add Transfer Request
//           </button>
//         </div>

//         <ResponsiveContainer width="100%" height={400}>
//           <BarChart data={chartArray} barCategoryGap="20%">
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis 
//               dataKey="warehouse" 
//               angle={-30} 
//               textAnchor="end" 
//               interval={0} 
//               height={80} 
//               tick={{ fontSize: 12 }}
//             />
//             <YAxis tick={{ fontSize: 12 }} domain={[0, 'dataMax + 2']}/>
//             <Tooltip />
//             <Legend />
//             <Bar dataKey="sent" fill="#AAB396" name="Sent" barSize={30} />
//             <Bar dataKey="received" fill="#674636" name="Received" barSize={30} />
//           </BarChart>
//         </ResponsiveContainer>

//         {/* 🔎 Search + Filter */}
//         <div className="mt-10 mb-6 flex justify-end items-center gap-2">
//           <Search className="w-5 h-5 text-gray-700" />
//           <input
//             type="text"
//             placeholder="Search..."
//             className="border border-gray-400 px-4 py-2 bg-white rounded w-6xl focus:outline-none focus:ring-2 focus:ring-amber-500"
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
//                     Stock ID
//                   </li>
//                   <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "materialId" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("materialId"); setSearchQuery(""); setShowFilter(false); }}
//                   >
//                     Material ID
//                   </li>
//                   <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "fromLocation" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("fromLocation"); setSearchQuery(""); setShowFilter(false); }}
//                   >
//                     From Location
//                   </li>
//                   <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "toLocation" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("toLocation"); setSearchQuery(""); setShowFilter(false); }}
//                   >
//                     To Location
//                   </li>
//                   <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "requestedBy" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("requestedBy"); setSearchQuery(""); setShowFilter(false); }}
//                   >
//                     Requested By
//                   </li>
//                   <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "approvedBy" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("approvedBy"); setSearchQuery(""); setShowFilter(false); }}
//                   >
//                     Approved By
//                   </li>
//                   <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "status" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("status"); setSearchQuery(""); setShowFilter(false); }}
//                   >
//                     Status
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

//             <div className="relative">
//               <button
//                 onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
//                 className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500"
//                 title="Download PDF"
//               >
//                 <Download className="w-5 h-5 text-gray-700" />
//               </button>

//               {/* Download Dropdown */}
//               {showDownloadDropdown && (
//                 <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded shadow-md w-48 z-50">
//                   <ul className="text-sm">
//                     <li
//                       className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
//                       onClick={() => handleDownloadPDF('thisMonth')}
//                     >
//                       This Month
//                     </li>
//                     <li
//                       className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
//                       onClick={() => handleDownloadPDF('previousMonth')}
//                     >
//                       Previous Month
//                     </li>
//                     <li
//                       className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
//                       onClick={() => handleDownloadPDF('thisYear')}
//                     >
//                       This Year
//                     </li>
//                     <li className="px-4 py-2 text-gray-500 font-medium border-b border-gray-200">
//                       Select Month:
//                     </li>
//                     {[
//                       'January', 'February', 'March', 'April', 'May', 'June',
//                       'July', 'August', 'September', 'October', 'November', 'December'
//                     ].map((month, index) => (
//                       <li
//                         key={month}
//                         className="px-4 py-2 cursor-pointer hover:bg-gray-100"
//                         onClick={() => handleDownloadPDF(index + 1)}
//                       >
//                         {month}
//                       </li>
//                     ))}
//                     <li
//                       className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-t border-gray-200 font-medium"
//                       onClick={() => handleDownloadPDF('all')}
//                     >
//                       All Records
//                     </li>
//                   </ul>
//                 </div>
//               )}
//             </div>
// </div>        

//         <div className="overflow-x-auto text-xs">
//           <table className="min-w-max border-collapse border border-gray-300">
//             <thead>
//               <tr style={{ background: "#674636", color:"#FFFFFF" }}>
//                 <th className="border border-gray-300 px-4 py-2 sticky left-0 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#674636" }}>Actions</th>
//                 <th className="border border-gray-300 px-4 py-2 sticky left-32 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#674636" }}>Transfer Request ID</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16">Material ID</th>
//                 <th className="border border-gray-300 px-4 py-2 w-48">From Location</th>
//                 <th className="border border-gray-300 px-4 py-2 w-48">To Location</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16">Quantity</th>
//                 <th className="border border-gray-300 px-4 py-2 w-56">Reason</th>
//                 <th className="border border-gray-300 px-4 py-2 w-32">Requested By</th>
//                 <th className="border border-gray-300 px-4 py-2 w-32">Approved By</th>
//                 <th className="border border-gray-300 px-4 py-2 w-32">Status</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16">Required By</th>
//                 <th className="border border-gray-300 px-4 py-2 w-32">Created At</th>
//                 <th className="border border-gray-300 px-4 py-2 w-32">Updated At</th>
//               </tr>
//             </thead>
//             <tbody className="align-middle text-center text-xs bg-[#FFF8E8]">
//               {filteredRequests.length > 0 ? (
//                 filteredRequests.map((request) => (
//                   <tr key={request._id} className="bg-[#FFF8E8]">
//                     {/* Actions */}
//                     <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#FFF8E8" }}>
//                       <div className="flex items-center justify-center gap-6">
//                         <div
//                           className="group relative cursor-pointer"
//                           onClick={() => navigate(`/warehouse-manager/transfer-request/update/${request._id}`)}
//                         >
//                           <Edit2 className="w-5 h-5  text-[#674636] hover:text-[#A67C52]" />
                          
//                         </div>
//                         <div
//                           className="group relative cursor-pointer"
//                           onClick={() => handleDelete(request._id)}
//                         >
//                           <Trash2 className="w-5 h-5  text-[#674636] hover:text-[#A67C52]" />
                          
//                         </div>
//                       </div>
//                     </td>
//                     {/* Table Data */}
//                     <td className="border border-gray-300 px-4 py-2 sticky left-32 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#FFF8E8" }}>{request.transferRequestId}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-16">{request.materialId}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-48">{request.fromLocation}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-48">{request.toLocation}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-16">{request.quantity}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-56">{request.reason}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-32">{request.requestedBy}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-32">{request.approvedBy}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-16">{request.status}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-16">{request.requiredBy ? new Date(request.requiredBy).toLocaleDateString() : "-"}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-32">{request.createdAt ? new Date(request.createdAt).toLocaleString() : "-"}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-32">{request.updatedAt ? new Date(request.updatedAt).toLocaleString() : "-"}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="13" className="text-center p-4">No transfer requests found.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TransferRequest;

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../component/navbar.jsx";
import { fetchTransferRequests, deleteTransferRequest } from "../services/FtransferRequestService.js";
import { Edit2, Trash2, Filter, Search, Download, Eye, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generatePDF } from "../utils/pdfGenerator.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const TransferRequest = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch transfer requests
  const getRequests = async () => {
    try {
      const data = await fetchTransferRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch transfer requests:", err);
    }
  };

  useEffect(() => {
    getRequests();
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this transfer request?");
    if (!confirmDelete) return;

    try {
      await deleteTransferRequest(id);
      await getRequests();
      alert("Transfer request deleted successfully!");
    } catch (err) {
      console.error("Failed to delete transfer request:", err);
      alert("Failed to delete transfer request.");
    }
  };

  // Modal handlers
  const openModal = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  // Filtering logic
  const filteredRequests = requests.filter((request) => {
    const query = searchQuery.toLowerCase();

    if (filterBy === "id") {
      return request.transferRequestId?.toLowerCase().includes(query);
    }
    if (filterBy === "materialId") {
      return request.materialId?.toLowerCase().includes(query);
    }
    if (filterBy === "fromLocation") {
      return request.fromLocation?.toLowerCase().includes(query);
    }
    if (filterBy === "toLocation") {
      return request.toLocation?.toLowerCase().includes(query);
    }
    if(filterBy === "requestedBy") {
      return request.requestedBy?.toLowerCase().includes(query);
    }
    if(filterBy === "approvedBy") {
      return request.approvedBy?.toLowerCase().includes(query);
    }
    if(filterBy === "status") {
      return request.status?.toLowerCase().includes(query);
    }
    if (filterBy === "requiredBy") {
      return new Date(request.requiredBy).toLocaleString().toLowerCase().includes(query);
    }

    // Default: search all
    if (filterBy === "all") {
    return (
      request.transferRequestId?.toLowerCase().includes(query) ||
      request.materialId?.toLowerCase().includes(query) ||
      request.fromLocation?.toLowerCase().includes(query) ||
      request.toLocation?.toLowerCase().includes(query) ||
      request.requestedBy?.toLowerCase().includes(query) ||
      request.approvedBy?.toLowerCase().includes(query) ||
      request.status?.toLowerCase().includes(query) ||
      request.requiredBy?.toLowerCase().includes(query)
    );
    }
  });

  //pdf function
  const handleDownloadPDF = (timeFilter = 'all') => {
    console.log("Downloading PDF for:", timeFilter);

    let dataToDownload = filteredRequests;
    
    // Filter data based on time selection
    if (timeFilter !== 'all') {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      
      dataToDownload = filteredRequests.filter(request => {
        const requestDate = new Date(request.createdAt);
        const requestYear = requestDate.getFullYear();
        const requestMonth = requestDate.getMonth() + 1;
        
        switch (timeFilter) {
          case 'thisMonth':
            return requestYear === currentYear && requestMonth === currentMonth;
          case 'previousMonth':
            const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
            const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
            return requestYear === prevYear && requestMonth === prevMonth;
          case 'thisYear':
            return requestYear === currentYear;
          default:
            if (typeof timeFilter === 'number' && timeFilter >= 1 && timeFilter <= 12) {
              return requestYear === currentYear && requestMonth === timeFilter;
            }
            return true;
        }
      });
    }

    const columns = [
      "ID", "Material ID", "From Location", "To Location", "Quantity", "Reason", "Requested By", 
      "Approved By", "Status", "Required By", "Created At", "Updated At"
    ];

    const rows = dataToDownload.map(request => [
      request.transferRequestId,
      request.materialId,
      request.fromLocation,
      request.toLocation,
      request.quantity,
      request.reason,
      request.requestedBy,
      request.approvedBy,
      request.status,
      request.requiredBy,
      new Date(request.createdAt).toLocaleString(),
      new Date(request.updatedAt).toLocaleString()
    ]);

    const timeFilterName = timeFilter === 'all' ? 'All Records' : 
                          timeFilter === 'thisMonth' ? 'This Month' :
                          timeFilter === 'previousMonth' ? 'Previous Month' :
                          timeFilter === 'thisYear' ? 'This Year' :
                          typeof timeFilter === 'number' ? new Date(2024, timeFilter - 1).toLocaleString('default', { month: 'long' }) :
                          'Filtered';

    generatePDF(columns, rows, `Transfer Request Report - ${timeFilterName}`);
    setShowDownloadDropdown(false);
  };

  // Chart data based on all requests
  const chartData = useMemo(() => {
    const acc = {};
    requests.forEach(req => {
      const fromKey = req.fromLocation?.trim();
      const toKey = req.toLocation?.trim();

      // Count Sent
      if (fromKey) {
        if (!acc[fromKey]) {
          acc[fromKey] = { warehouse: fromKey, sent: 0, received: 0 };
        }
        acc[fromKey].sent += 1;
      }

      // Count Received
      if (toKey) {
        if (!acc[toKey]) {
          acc[toKey] = { warehouse: toKey, sent: 0, received: 0 };
        }
        acc[toKey].received += 1;
      }

      return acc;
    }, {});

    return Object.values(acc);
  }, [requests]);

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navbar />
      <div className="m-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mt-6 mb-10">Transfer Requests</h1>
          <button
            className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10"
            onClick={() => navigate("/warehouse-manager/transfer-request/add")}
          >
            + Add Transfer Request
          </button>
        </div>

        {/* Bar Chart Section - Enhanced Styling */}
        <div className="w-full mb-10 bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-lg p-6 border border-amber-100">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-[#674636] mb-1">Transfer Requests Overview</h2>
            <p className="text-sm text-gray-600">Sent vs Received per Warehouse</p>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer>
              <BarChart 
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#AAB396" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#8B9A7A" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="receivedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5A3C" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#674636" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis 
                  dataKey="warehouse" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#D1D5DB' }}
                  tickLine={{ stroke: '#D1D5DB' }}
                />
                <YAxis 
                  domain={[0, 'dataMax + 2']}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#D1D5DB' }}
                  tickLine={{ stroke: '#D1D5DB' }}
                  label={{ value: 'Request Count', angle: -90, position: 'insideLeft', style: { fill: '#6B7280', fontSize: 12 } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                  labelStyle={{ color: '#674636', fontWeight: 'bold', marginBottom: '4px' }}
                  itemStyle={{ color: '#8B5A3C' }}
                  cursor={{ fill: 'rgba(139, 90, 60, 0.1)' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar 
                  dataKey="sent" 
                  fill="url(#sentGradient)"
                  name="Sent"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                  animationDuration={1000}
                />
                <Bar 
                  dataKey="received" 
                  fill="url(#receivedGradient)"
                  name="Received"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🔎 Search + Filter */}
        <div className="mb-6 flex justify-end items-center gap-2">
          <Search className="w-5 h-5 text-gray-700" />
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-400 px-4 py-2 bg-white rounded w-6xl focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    Request ID
                  </li>
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "materialId" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("materialId"); setSearchQuery(""); setShowFilter(false); }}
                  >
                    Material ID
                  </li>
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "fromLocation" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("fromLocation"); setSearchQuery(""); setShowFilter(false); }}
                  >
                    From Location
                  </li>
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "toLocation" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("toLocation"); setSearchQuery(""); setShowFilter(false); }}
                  >
                    To Location
                  </li>
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "status" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("status"); setSearchQuery(""); setShowFilter(false); }}
                  >
                    Status
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
              className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500"
              title="Download PDF"
            >
              <Download className="w-5 h-5 text-gray-700" />
            </button>

            {/* Download Dropdown */}
            {showDownloadDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded shadow-md w-48 z-50">
                <ul className="text-sm">
                  <li
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                    onClick={() => handleDownloadPDF('thisMonth')}
                  >
                    This Month
                  </li>
                  <li
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                    onClick={() => handleDownloadPDF('previousMonth')}
                  >
                    Previous Month
                  </li>
                  <li
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                    onClick={() => handleDownloadPDF('thisYear')}
                  >
                    This Year
                  </li>
                  <li className="px-4 py-2 text-gray-500 font-medium border-b border-gray-200">
                    Select Month:
                  </li>
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((month, index) => (
                    <li
                      key={month}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleDownloadPDF(index + 1)}
                    >
                      {month}
                    </li>
                  ))}
                  <li
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-t border-gray-200 font-medium"
                    onClick={() => handleDownloadPDF('all')}
                  >
                    All Records
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Simplified Table */}
        <div className="overflow-x-auto text-xs">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr style={{ background: "#674636", color:"#FFFFFF" }}>
                <th className="border border-gray-300 px-4 py-2 w-24">Actions</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Transfer Request ID</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Material ID</th>
                <th className="border border-gray-300 px-4 py-2 w-48">From Location</th>
                <th className="border border-gray-300 px-4 py-2 w-48">To Location</th>
                <th className="border border-gray-300 px-4 py-2 w-24">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 w-56">Reason</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Status</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Required By</th>
              </tr>
            </thead>
            <tbody className="align-middle text-center text-xs">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr 
                    key={request._id}
                    className="bg-[#FFF8E8] hover:bg-[#F4E1C9]"
                  >
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex items-center justify-center gap-3">
                        <Eye 
                          className="w-5 h-5 cursor-pointer text-[#674636] hover:text-[#A67C52]" 
                          onClick={() => openModal(request)}
                          title="View Details"
                        />
                        
                        <Trash2 
                          className="w-5 h-5 cursor-pointer text-[#674636] hover:text-[#A67C52]" 
                          onClick={() => handleDelete(request._id)}
                          title="Delete"
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{request.transferRequestId}</td>
                    <td className="border border-gray-300 px-4 py-2">{request.materialId}</td>
                    <td className="border border-gray-300 px-4 py-2">{request.fromLocation}</td>
                    <td className="border border-gray-300 px-4 py-2">{request.toLocation}</td>
                    <td className="border border-gray-300 px-4 py-2">{request.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2">{request.reason}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {request.requiredBy ? new Date(request.requiredBy).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center p-4">No transfer requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

{/* Modal */}
{showModal && selectedRequest && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative max-h-[95vh] overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Transfer Request Details</h2>
              <p className="text-gray-500 text-sm">ID: {selectedRequest.transferRequestId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              selectedRequest.status === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' :
              selectedRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
              selectedRequest.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
              'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              {selectedRequest.status?.charAt(0).toUpperCase() + selectedRequest.status?.slice(1)}
            </div>
            <button
              onClick={closeModal}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">{selectedRequest.quantity}</p>
              <p className="text-gray-600 text-sm font-medium">Quantity</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {selectedRequest.requiredBy ? new Date(selectedRequest.requiredBy).toLocaleDateString() : "Not Set"}
              </p>
              <p className="text-gray-600 text-sm font-medium">Required By</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-900">Standard</p>
              <p className="text-gray-600 text-sm font-medium">Priority</p>
            </div>
          </div>

          {/* Transfer Details */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Material Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Material ID</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedRequest.materialId}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Locations
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">From</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedRequest.fromLocation}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">To</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedRequest.toLocation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Timeline
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium text-gray-900">
                      {new Date(selectedRequest.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated</span>
                    <span className="font-medium text-gray-900">
                      {new Date(selectedRequest.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reason Section */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Reason for Transfer
            </h3>
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-gray-700 leading-relaxed">
                {selectedRequest.reason || "No reason provided for this transfer request."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-end gap-3">
          <button
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            onClick={closeModal}
          >
            Close
          </button>
          <button
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            onClick={() => {
              closeModal();
              navigate(`/warehouse-manager/transfer-request/update/${selectedRequest._id}`);
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Request
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default TransferRequest;