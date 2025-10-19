// import React, { useState, useEffect } from "react";
// import Navbar from "../component/navbar.jsx";
// import { fetchSReorderRequests, deleteSReorderRequest } from "../services/FsReorderRequestService.js";
// import { Edit2, Trash2,Filter, Search,Download } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { generatePDF } from "../utils/pdfGenerator.js";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";


// const SReorderRequest = () => {
//   const [requests, setRequests] = useState([]);
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterBy, setFilterBy] = useState("all");
//   const [showFilter, setShowFilter] = useState(false);
//   const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

//   // Fetch stock reorder requests
//   const getRequests = async () => {
//     try {
//       const data = await fetchSReorderRequests();
//       setRequests(data);
//     } catch (err) {
//       console.error("Failed to fetch stock reorder requests:", err);
//     }
//   };

//   useEffect(() => {
//     getRequests();
//   }, []);

//   // Delete handler
//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm("Are you sure you want to delete this request?");
//     if (!confirmDelete) return;

//     try {
//       await deleteSReorderRequest(id);
//       await getRequests();
//       alert("Stock Reorder Request deleted successfully!");
//     } catch (err) {
//       console.error("Failed to delete request:", err);
//       alert("Failed to delete request.");
//     }
//   };

//   // Filtering logic
//     const filteredRequests = requests.filter((request) => {
//     const query = searchQuery.toLowerCase();

//     if (filterBy === "id") {
//       return request.stockReorderRequestId?.toLowerCase().includes(query);
//     }
//     if (filterBy === "inventoryId") {
//       return request.inventoryId?.toLowerCase().includes(query);
//     }
//     if(filterBy === "inventoryName") {
//       return request.inventoryName?.toLowerCase().includes(query);
//     }
//     if (filterBy === "inventoryAddress") {
//       return request.inventoryAddress?.toLowerCase().includes(query);
//     }
//     if (filterBy === "materialId") {
//       return request.materialId?.toLowerCase().includes(query);
//     }
//     if(filterBy === "materialName") {
//       return request.materialName?.toLowerCase().includes(query);
//     }
//     if (filterBy === "type") {
//       return request.type?.toLowerCase().includes(query);
//     }
//     if (filterBy === "expectedDate") {
//       return request.expectedDate?.toLowerCase().includes(query);
//     }
//     if(filterBy === "status") {
//       return request.status?.toLowerCase().includes(query);
//     }
    

//     // Default: search all
//     if (filterBy === "all") {
//     return (
//       request.stockReorderRequestId?.toLowerCase().includes(query) ||
//       request.inventoryId?.toLowerCase().includes(query) ||
//       request.inventoryAddress?.toLowerCase().includes(query) ||
//       request.materialId?.toLowerCase().includes(query) ||
//       request.materialName?.toLowerCase().includes(query) ||
//       request.type?.toLowerCase().includes(query) ||
//       request.expectedDate?.toLowerCase().includes(query) ||
//       request.status?.toLowerCase().includes(query)
//     );
//   }
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
//       "ID", "Inventory ID", "Inventory Name", "Inventory Address", "Inventory Contact", "Material ID", 
//       "Material Name", "Quantity", "Type", 
//       "Unit", "Expected By", "Warehouse Manager Name", "Created At", "Status"
//       ];
  
//       const rows = dataToDownload.map(request => [
//         request.stockReorderRequestId,
//         request.inventoryId,
//         request.inventoryName,
//         request.inventoryAddress,
//         request.inventoryContact,
//         request.materialId,
//         request.materialName,
//         request.quantity,
//         request.type,
//         request.unit,
//         request.expectedDate,
//         request.warehouseManagerName,
//         new Date(request.createdAt).toLocaleString(),
//         request.status
//       ]);

//       const timeFilterName = timeFilter === 'all' ? 'All Records' : 
//                             timeFilter === 'thisMonth' ? 'This Month' :
//                             timeFilter === 'previousMonth' ? 'Previous Month' :
//                             timeFilter === 'thisYear' ? 'This Year' :
//                             typeof timeFilter === 'number' ? new Date(2024, timeFilter - 1).toLocaleString('default', { month: 'long' }) :
//                             'Filtered';
  
//       generatePDF(columns, rows, `Stock Reorder Request Report - ${timeFilterName}`);
//       setShowDownloadDropdown(false);
//     };

//     // Chart data calculation - always uses full 'requests' array (not filtered)
//     const requestsPerMonth = requests.reduce((acc, request) => {
//   const date = request.createdAt ? new Date(request.createdAt) : null;
//   if (!date) return acc;

//   const monthYear = date.toLocaleString("default", { month: "short", year: "numeric" });

//   if (!acc[monthYear]) {
//     acc[monthYear] = { total: 0, pending: 0, checked: 0 };
//   }

//   acc[monthYear].total += 1;

//   if (request.status?.toLowerCase() === "pending") {
//     acc[monthYear].pending += 1;
//   } else if (request.status?.toLowerCase() === "checked") {
//     acc[monthYear].checked += 1;
//   }

//   return acc;
// }, {});

// const chartData = Object.keys(requestsPerMonth)
//   .sort((a, b) => new Date(a) - new Date(b))
//   .map(month => ({
//     month,
//     total: requestsPerMonth[month].total,
//     pending: requestsPerMonth[month].pending,
//     checked: requestsPerMonth[month].checked
// }));


//   return (
//     <div>
//       <Navbar />
//       <div className="m-6">
//         <div className="flex justify-between items-center">
//           <h1 className="text-2xl font-bold mt-6 mb-10">Stock Reorder Requests</h1>
//           <button
//             className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10"
//             onClick={() => navigate("/warehouse-manager/reorder-request/add")}
//           >
//             + Add Reorder Request
//           </button>
//         </div>

//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="month" tick={{ fontSize: 12 }} />
//             <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
//             <Tooltip />
//             <Legend />
//             <Line type="monotone" dataKey="total" name="Total Requests" stroke="#4CAF50" strokeWidth={2} />
//             <Line type="monotone" dataKey="pending" name="Pending Requests" stroke="#FFA500" strokeWidth={2} />
//             <Line type="monotone" dataKey="checked" name="Checked Requests" stroke="#2196F3" strokeWidth={2} />
//           </LineChart>
//         </ResponsiveContainer>

//         {/* 🔎 Search + Filter */}
//         <div className="mb-6 flex justify-end items-center gap-2">
//             <Search className="w-5 h-5 text-gray-700" />
//             <input
//             type="text"
//             placeholder="Search..."
//             className="border border-gray-400 px-4 py-2 rounded w-6xl focus:outline-none focus:ring-2 focus:ring-amber-500"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             />

//             {/* Filter Icon + Dropdown Wrapper */}
//             <div className="relative">
//             <button
//                 onClick={() => setShowFilter(!showFilter)}
//                 className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500"
//             >
//                 <Filter className="w-5 h-5 text-gray-700" />
//             </button>

//             {/* Dropdown */}
//             {showFilter && (
//                 <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded shadow-md w-40 z-50">
//                 <ul className="text-sm">
//                     <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "all" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("all"); setSearchQuery(""); setShowFilter(false); }}
//                     >
//                     All
//                     </li>
//                     <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "id" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("id"); setSearchQuery(""); setShowFilter(false); }}
//                     >
//                     Request ID
//                     </li>
//                     <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "inventoryId" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("inventoryId"); setSearchQuery(""); setShowFilter(false); }}
//                     >
//                     Inventory ID
//                     </li>
//                     <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "inventoryName" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("inventoryName"); setSearchQuery(""); setShowFilter(false); }}
//                     >
//                     Inventory Name
//                     </li>
//                     <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "inventoryAddress" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("inventoryAddress"); setSearchQuery(""); setShowFilter(false); }} 
//                     >
//                     Inventory Address
//                     </li>
//                     <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "materialId" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("materialId"); setSearchQuery(""); setShowFilter(false); }}
//                     >
//                     Material ID
//                     </li>
//                     <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "materialName" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("materialName"); setSearchQuery(""); setShowFilter(false); }}
//                     >
//                     Material Name
//                     </li>
//                     <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "type" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("type"); setSearchQuery(""); setShowFilter(false); }}
//                     >
//                     Type
//                     </li>
//                     <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "expectedDate" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("expectedDate"); setSearchQuery(""); setShowFilter(false); }}
//                     >
//                     Expected Date
//                     </li>
//                     <li
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "status" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("status"); setSearchQuery(""); setShowFilter(false); }}
//                     >
//                     Status 
//                     </li>
//                 </ul>
//                 </div>
//                 )}
//               </div>  

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

//         </div>

//         <div className="overflow-x-auto text-xs">
//           <table className="min-w-max border-collapse border border-gray-300">
//             <thead>
//               <tr>
//                 <th className="border border-gray-300 px-4 py-2 sticky left-0 w-32 bg-brown-primary text-cream-primary z-40 relative">Actions</th>
//                 <th className="border border-gray-300 px-4 py-2 sticky left-32 w-32 bg-brown-primary text-cream-primary z-40 relative">Request ID</th>
//                 <th className="border border-gray-300 px-4 py-2 w-48 bg-brown-primary text-cream-primary">Inventory Name</th>
//                 <th className="border border-gray-300 px-4 py-2 w-48 bg-brown-primary text-cream-primary">Inventory Address</th>
//                 <th className="border border-gray-300 px-4 py-2 w-48 bg-brown-primary text-cream-primary">Inventory Contact</th>
//                 <th className="border border-gray-300 px-4 py-2 w-48 bg-brown-primary text-cream-primary">Material Name</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16 bg-brown-primary text-cream-primary">Material ID</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16 bg-brown-primary text-cream-primary">Quantity</th>
//                 <th className="border border-gray-300 px-4 py-2 w-48 bg-brown-primary text-cream-primary">Type</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16 bg-brown-primary text-cream-primary">Unit</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16 bg-brown-primary text-cream-primary">Expected Date</th>
//                 <th className="border border-gray-300 px-4 py-2 w-32 bg-brown-primary text-cream-primary">Warehouse Manager</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16 bg-brown-primary text-cream-primary">Status</th>
//                 <th className="border border-gray-300 px-4 py-2 w-32 bg-brown-primary text-cream-primary">Created At</th>
//               </tr>
//             </thead>
//             <tbody className="align-middle text-center text-xs">
//               {filteredRequests.length > 0 ? (
//                 filteredRequests.map((request) => {
//                   const createdDate = request.createdAt ? new Date(request.createdAt) : null;
//                   const expectedDate = request.expectedDate ? new Date(request.expectedDate) : null;

//                   let rowColor = "bg-white"; // default
//                   if (expectedDate) {
//                     const today = new Date();
//                     const diffTime = expectedDate - today;
//                     const diffDays = diffTime / (1000 * 60 * 60 * 24);

//                     if (diffDays >= 0 && diffDays <= 7) {
//                       rowColor = "bg-red-100"; // 🔴 highlight if expected within next 7 days
//                     }
//                     // else it stays white automatically
//                   }

              

//                   return (
//                     <tr key={request._id}>
//                       {/* Actions */}
//                       <td className={`border border-gray-300 px-4 py-2 sticky left-0 z-40 ${rowColor}`}>
//                         <div className="flex items-center justify-center gap-6">
//                           <div
//                             className="group relative cursor-pointer"
//                             onClick={() => navigate(`/warehouse-manager/reorder-request/update/${request._id}`)}
//                           >
//                             <Edit2 className="w-5 h-5 text-amber-500 hover:text-amber-600" />
//                           </div>
//                           <div
//                             className="group relative cursor-pointer"
//                             onClick={() => handleDelete(request._id)}
//                           >
//                             <Trash2 className="w-5 h-5 text-amber-500 hover:text-amber-600" />
//                           </div>
//                         </div>
//                       </td>

//                       {/* Table Data */}
//                       <td className={`border border-gray-300 px-4 py-2 sticky left-32 z-40 ${rowColor}`}>
//                         {request.stockReorderRequestId}
//                       </td>
//                       <td className={`border border-gray-300 px-4 py-2 w-48 ${rowColor}`}>{request.inventoryName}</td>
//                       <td className={`border border-gray-300 px-4 py-2 w-48 ${rowColor}`}>{request.inventoryAddress}</td>
//                       <td className={`border border-gray-300 px-4 py-2 w-48 ${rowColor}`}>{request.inventoryContact}</td>
//                       <td className={`border border-gray-300 px-4 py-2 w-48 ${rowColor}`}>{request.materialName}</td>
//                       <td className={`border border-gray-300 px-4 py-2 w-16 ${rowColor}`}>{request.materialId}</td>
//                       <td className={`border border-gray-300 px-4 py-2 w-16 ${rowColor}`}>{request.quantity}</td>
//                       <td className={`border border-gray-300 px-4 py-2 w-48 ${rowColor}`}>{request.type}</td>
//                       <td className={`border border-gray-300 px-4 py-2 w-16 ${rowColor}`}>{request.unit}</td>
//                       <td className={`border border-gray-300 px-4 py-2 w-16 ${rowColor}`}>
//                         {expectedDate ? expectedDate.toLocaleDateString() : "-"}
//                       </td>
//                       <td className={`border border-gray-300 px-4 py-2 w-32 ${rowColor}`}>
//                         {request.warehouseManagerName}
//                       </td>
//                       <td className={`border border-gray-300 px-4 py-2 w-16 ${rowColor}`}>{request.status}</td>
//                       <td className={`border border-gray-300 px-4 py-2 w-32 ${rowColor}`}>
//                         {createdDate ? createdDate.toLocaleString() : "-"}
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td colSpan="14" className="text-center p-4">No stock reorder requests found.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SReorderRequest;

import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar.jsx";
import { fetchSReorderRequests, deleteSReorderRequest } from "../services/FsReorderRequestService.js";
import { Edit2, Trash2, Filter, Search, Download, Eye, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generatePDF } from "../utils/pdfGenerator.js";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const SReorderRequest = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch stock reorder requests
  const getRequests = async () => {
    try {
      const data = await fetchSReorderRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch stock reorder requests:", err);
    }
  };

  useEffect(() => {
    getRequests();
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this request?");
    if (!confirmDelete) return;

    try {
      await deleteSReorderRequest(id);
      await getRequests();
      if (showModal && selectedRequest?._id === id) {
        setShowModal(false);
        setSelectedRequest(null);
      }
      alert("Stock Reorder Request deleted successfully!");
    } catch (err) {
      console.error("Failed to delete request:", err);
      alert("Failed to delete request.");
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
      return request.stockReorderRequestId?.toLowerCase().includes(query);
    }
    if (filterBy === "inventoryName") {
      return request.inventoryName?.toLowerCase().includes(query);
    }
    if (filterBy === "inventoryAddress") {
      return request.inventoryAddress?.toLowerCase().includes(query);
    }
    if (filterBy === "materialName") {
      return request.materialName?.toLowerCase().includes(query);
    }
    if (filterBy === "expectedDate") {
      return request.expectedDate?.toLowerCase().includes(query);
    }
    if (filterBy === "status") {
      return request.status?.toLowerCase().includes(query);
    }

    // Default: search all
    if (filterBy === "all") {
      return (
        request.stockReorderRequestId?.toLowerCase().includes(query) ||
        request.inventoryName?.toLowerCase().includes(query) ||
        request.inventoryAddress?.toLowerCase().includes(query) ||
        request.materialName?.toLowerCase().includes(query) ||
        request.expectedDate?.toLowerCase().includes(query) ||
        request.status?.toLowerCase().includes(query)
      );
    }
    return false;
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
      "ID", "Inventory ID", "Inventory Name", "Inventory Address", "Inventory Contact", "Material ID", 
      "Material Name", "Quantity", "Type", 
      "Unit", "Expected By", "Warehouse Manager Name", "Created At", "Status"
    ];

    const rows = dataToDownload.map(request => [
      request.stockReorderRequestId,
      request.inventoryId,
      request.inventoryName,
      request.inventoryAddress,
      request.inventoryContact,
      request.materialId,
      request.materialName,
      request.quantity,
      request.type,
      request.unit,
      request.expectedDate,
      request.warehouseManagerName,
      new Date(request.createdAt).toLocaleString(),
      request.status
    ]);

    const timeFilterName = timeFilter === 'all' ? 'All Records' : 
                          timeFilter === 'thisMonth' ? 'This Month' :
                          timeFilter === 'previousMonth' ? 'Previous Month' :
                          timeFilter === 'thisYear' ? 'This Year' :
                          typeof timeFilter === 'number' ? new Date(2024, timeFilter - 1).toLocaleString('default', { month: 'long' }) :
                          'Filtered';

    generatePDF(columns, rows, `Stock Reorder Request Report - ${timeFilterName}`);
    setShowDownloadDropdown(false);
  };

  // Chart data calculation - always uses full 'requests' array (not filtered)
  const requestsPerMonth = requests.reduce((acc, request) => {
    const date = request.createdAt ? new Date(request.createdAt) : null;
    if (!date) return acc;

    const monthYear = date.toLocaleString("default", { month: "short", year: "numeric" });

    if (!acc[monthYear]) {
      acc[monthYear] = { total: 0, pending: 0, checked: 0 };
    }

    acc[monthYear].total += 1;

    if (request.status?.toLowerCase() === "pending") {
      acc[monthYear].pending += 1;
    } else if (request.status?.toLowerCase() === "checked") {
      acc[monthYear].checked += 1;
    }

    return acc;
  }, {});

  const chartData = Object.keys(requestsPerMonth)
    .sort((a, b) => new Date(a) - new Date(b))
    .map(month => ({
      month,
      total: requestsPerMonth[month].total,
      pending: requestsPerMonth[month].pending,
      checked: requestsPerMonth[month].checked
  }));

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mt-6 mb-10">Stock Reorder Requests</h1>
          <button
            className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10"
            onClick={() => navigate("/warehouse-manager/reorder-request/add")}
          >
            + Add Reorder Request
          </button>
        </div>

        {/* Enhanced Chart Section */}
        <div className="w-full mb-10 bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-lg p-6 border border-amber-100">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#674636] mb-1">Requests Overview</h2>
            <p className="text-sm text-gray-600">Monthly stock reorder requests tracking</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#4CAF50" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFA500" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#FFA500" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="checkedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2196F3" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#2196F3" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
                tickLine={{ stroke: '#D1D5DB' }}
              />
              <YAxis 
                allowDecimals={false} 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
                tickLine={{ stroke: '#D1D5DB' }}
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
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                name="Total Requests" 
                stroke="url(#totalGradient)" 
                strokeWidth={3} 
                dot={{ fill: '#4CAF50', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#4CAF50', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="pending" 
                name="Pending Requests" 
                stroke="url(#pendingGradient)" 
                strokeWidth={3} 
                dot={{ fill: '#FFA500', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#FFA500', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="checked" 
                name="Checked Requests" 
                stroke="url(#checkedGradient)" 
                strokeWidth={3} 
                dot={{ fill: '#2196F3', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#2196F3', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 🔎 Search + Filter */}
        <div className="mb-6 flex justify-end items-center gap-2">
          <Search className="w-5 h-5 text-gray-700" />
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-400 px-4 py-2 rounded w-6xl focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "inventoryName" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("inventoryName"); setSearchQuery(""); setShowFilter(false); }}
                  >
                    Inventory Name
                  </li>
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "materialName" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("materialName"); setSearchQuery(""); setShowFilter(false); }}
                  >
                    Material Name
                  </li>
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "expectedDate" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("expectedDate"); setSearchQuery(""); setShowFilter(false); }}
                  >
                    Expected Date
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
              <tr style={{ background: "#674636", color: "#FFFFFF" }}>
                <th className="border border-gray-300 px-4 py-2 w-24">Actions</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Request ID</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Inventory Name</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Inventory Address</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Material Name</th>
                <th className="border border-gray-300 px-4 py-2 w-24">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Expected Date</th>
                <th className="border border-gray-300 px-4 py-2 w-24">Status</th>
              </tr>
            </thead>
            <tbody className="align-middle text-center text-xs">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => {
                  const expectedDate = request.expectedDate ? new Date(request.expectedDate) : null;
                  const today = new Date();
                  const diffTime = expectedDate ? expectedDate - today : 0;
                  const diffDays = diffTime / (1000 * 60 * 60 * 24);

                  let rowColor = "bg-white";
                  if (expectedDate && diffDays >= 0 && diffDays <= 7) {
                    rowColor = "bg-red-100";
                  }

                  return (
                    <tr key={request._id} className={rowColor}>
                      {/* Actions */}
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

                      {/* Table Data */}
                      <td className="border border-gray-300 px-4 py-2">{request.stockReorderRequestId}</td>
                      <td className="border border-gray-300 px-4 py-2">{request.inventoryName}</td>
                      <td className="border border-gray-300 px-4 py-2">{request.inventoryAddress}</td>
                      <td className="border border-gray-300 px-4 py-2">{request.materialName}</td>
                      <td className="border border-gray-300 px-4 py-2">{request.quantity}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {expectedDate ? expectedDate.toLocaleDateString() : "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{request.status}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-4">No stock reorder requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
{showModal && selectedRequest && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
      {/* Close Button */}
      <button
        onClick={closeModal}
        className="absolute top-3 right-3 bg-white rounded-full p-1 shadow border border-gray-200 hover:bg-gray-100 transition-all z-10"
      >
        <X className="w-4 h-4 text-gray-700" />
      </button>

      {/* Urgent Alert Banner */}
      {(() => {
        const expectedDate = selectedRequest.expectedDate ? new Date(selectedRequest.expectedDate) : null;
        const today = new Date();
        const diffTime = expectedDate ? expectedDate - today : 0;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (expectedDate && diffDays >= 0 && diffDays <= 7) {
          return (
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-t-xl flex items-center gap-2 text-xs">
              <div className="bg-white text-red-600 rounded-full w-4 h-4 flex items-center justify-center font-bold text-xs">
                !
              </div>
              <div>
                <p className="font-bold">Urgent Request</p>
                <p className="opacity-90 text-xs">Expected within {Math.ceil(diffDays)} days</p>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Modal Body */}
      <div className="p-4">
        {/* Title Section */}
        <div className="mb-4 pb-3 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#674636]">Reorder Request Details</h2>
          <p className="text-xs text-gray-500 mt-1">ID: {selectedRequest.stockReorderRequestId}</p>
        </div>

        {/* Compact Information Grid */}
        <div className="space-y-3 mb-4">
          {/* Request Information */}
          <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-[#674636]">
            <h3 className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Request Information</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`font-semibold ml-1 ${
                  selectedRequest.status?.toLowerCase() === 'pending' ? 'text-orange-500' :
                  selectedRequest.status?.toLowerCase() === 'checked' ? 'text-green-500' :
                  'text-gray-700'
                }`}>
                  {selectedRequest.status}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="font-semibold ml-1 text-gray-800">{selectedRequest.type}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Quantity:</span>
                <span className="font-semibold ml-1 text-gray-800">{selectedRequest.quantity} {selectedRequest.unit}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
            <h3 className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Timeline</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Expected:</span>
                <span className="font-semibold ml-1 text-gray-800">
                  {selectedRequest.expectedDate ? new Date(selectedRequest.expectedDate).toLocaleDateString() : "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="font-semibold ml-1 text-gray-800">
                  {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleDateString() : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Inventory Details */}
          <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-green-500">
            <h3 className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Inventory Details</h3>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-gray-500">Name:</span>
                <span className="font-semibold ml-1 text-gray-800">{selectedRequest.inventoryName}</span>
              </div>
              <div>
                <span className="text-gray-500">ID:</span>
                <span className="font-semibold ml-1 text-gray-800">{selectedRequest.inventoryId}</span>
              </div>
              <div>
                <span className="text-gray-500">Address:</span>
                <span className="font-semibold ml-1 text-gray-800">{selectedRequest.inventoryAddress}</span>
              </div>
              <div>
                <span className="text-gray-500">Contact:</span>
                <span className="font-semibold ml-1 text-gray-800">{selectedRequest.inventoryContact}</span>
              </div>
            </div>
          </div>

          {/* Material Details */}
          <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-purple-500">
            <h3 className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Material Details</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Name:</span>
                <span className="font-semibold ml-1 text-gray-800">{selectedRequest.materialName}</span>
              </div>
              <div>
                <span className="text-gray-500">ID:</span>
                <span className="font-semibold ml-1 text-gray-800">{selectedRequest.materialId}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Manager:</span>
                <span className="font-semibold ml-1 text-gray-800">{selectedRequest.warehouseManagerName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Status Summary */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-200">
          <h3 className="text-xs font-bold text-amber-800 mb-1 uppercase tracking-wide">Summary</h3>
          <p className="text-xs text-amber-700">
            Request for <strong>{selectedRequest.quantity} {selectedRequest.unit}</strong> of 
            <strong> {selectedRequest.materialName}</strong> - Status: <strong>{selectedRequest.status}</strong>
          </p>
        </div>
      </div>

      {/* Modal Footer - Always Visible */}
      <div className="sticky bottom-0 bg-white px-4 py-3 rounded-b-xl border-t border-gray-200">
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 rounded text-sm font-semibold transition-colors"
            onClick={closeModal}
          >
            Close
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-[#674636] to-[#8B5A3C] hover:from-[#8B5A3C] hover:to-[#674636] text-white rounded text-sm font-semibold flex items-center gap-1 transition-all"
            onClick={() => {
              closeModal();
              navigate(`/warehouse-manager/reorder-request/update/${selectedRequest._id}`);
            }}
          >
            <Edit2 className="w-3 h-3" /> Edit
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default SReorderRequest;