// import Navbar from "../component/navbar.jsx";
// import React, { useState, useEffect } from "react";
// import { fetchStockMovements, deleteStockMovement } from "../services/FstockMovementService.js";
// import { Edit2,Trash2, Filter, Search, Download } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { generatePDF } from "../utils/pdfGenerator.js";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// const StockMovement = () => {
//   const [movements, setMovements] = useState([]);
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterBy, setFilterBy] = useState("all");
//   const [showFilter, setShowFilter] = useState(false);
//   const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

//   // Fetch movements
//   const getMovements = async () => {
//     try {
//       const data = await fetchStockMovements();
//       setMovements(data);
//     } catch (err) {
//       console.error("Failed to fetch stock movements:", err);
//     }
//   };

//   useEffect(() => {
//     getMovements();
//   }, []);

//   // Delete handler
//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm("Are you sure you want to delete this stock movement?");
//     if (!confirmDelete) return;

//     try {
//       await deleteStockMovement(id);
//       await getMovements();
//       alert("Stock movement deleted successfully!");
//     } catch (err) {
//       console.error("Failed to delete stock movement:", err);
//       alert("Failed to delete stock movement.");
//     }
//   };

//   // Filtering logic
//     const filteredMovements = movements.filter((movement) => {
//     const query = searchQuery.toLowerCase();

//     if (filterBy === "id") {
//       return movement.stockId?.toLowerCase().includes(query);
//     }
//     if (filterBy === "materialId") {
//       return movement.materialId?.toLowerCase().includes(query);
//     }
//     if (filterBy === "fromLocation") {
//       return movement.fromLocation?.toLowerCase().includes(query);
//     }
//     if (filterBy === "toLocation") {
//       return movement.toLocation?.toLowerCase().includes(query);
//     }
//     if(filterBy === "requestedBy") {
//       return movement.requestedBy?.toLowerCase().includes(query);
//     }
//     if(filterBy === "approvedBy") {
//       return movement.approvedBy?.toLowerCase().includes(query);
//     }
//     if (filterBy === "dispatchedDate") {
//       return new Date(movement.createdAt).toLocaleString().toLowerCase().includes(query);
//     }

//     // Default: search all
//     if (filterBy === "all") {
//     return (
//       movement.stockId?.toLowerCase().includes(query) ||
//       movement.materialId?.toLowerCase().includes(query) ||
//       movement.fromLocation?.toLowerCase().includes(query) ||
//       movement.toLocation?.toLowerCase().includes(query) ||
//       movement.requestedBy?.toLowerCase().includes(query) ||
//       movement.approvedBy?.toLowerCase().includes(query) ||
//       new Date(movement.createdAt).toLocaleString().toLowerCase().includes(query)
//     );
//     }
//   });

//   //pdf function
//     const handleDownloadPDF = (timeFilter = 'all') => {
//       console.log("Downloading PDF for:", timeFilter);

//       let dataToDownload = filteredMovements;
      
//       // Filter data based on time selection
//       if (timeFilter !== 'all') {
//         const now = new Date();
//         const currentYear = now.getFullYear();
//         const currentMonth = now.getMonth() + 1;
        
//         dataToDownload = filteredMovements.filter(movement => {
//           const movementDate = new Date(movement.createdAt);
//           const movementYear = movementDate.getFullYear();
//           const movementMonth = movementDate.getMonth() + 1;
          
//           switch (timeFilter) {
//             case 'thisMonth':
//               return movementYear === currentYear && movementMonth === currentMonth;
//             case 'previousMonth':
//               const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
//               const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
//               return movementYear === prevYear && movementMonth === prevMonth;
//             case 'thisYear':
//               return movementYear === currentYear;
//             default:
//               if (typeof timeFilter === 'number' && timeFilter >= 1 && timeFilter <= 12) {
//                 return movementYear === currentYear && movementMonth === timeFilter;
//               }
//               return true;
//           }
//         });
//       }
  
//       const columns = [
//       "ID", "Material ID", "From Location", "To Location", "Unit", "Quantity", 
//       "Reason", "Requested By", "Approved By", 
//       "Employee ID", "Vehicle Info", "Dispatched Date", "Created At"
//       ];
  
//       const rows = dataToDownload.map(movement => [
//         movement.stockId,
//         movement.materialId,
//         movement.fromLocation,
//         movement.toLocation,
//         movement.unit,
//         movement.quantity,
//         movement.reason,
//         movement.requestedBy,
//         movement.approvedBy,
//         movement.employeeId,
//         movement.vehicleInfo,
//         movement.dispatchedDate,
//         new Date(movement.createdAt).toLocaleString()
//       ]);

//       const timeFilterName = timeFilter === 'all' ? 'All Records' : 
//                             timeFilter === 'thisMonth' ? 'This Month' :
//                             timeFilter === 'previousMonth' ? 'Previous Month' :
//                             timeFilter === 'thisYear' ? 'This Year' :
//                             typeof timeFilter === 'number' ? new Date(2024, timeFilter - 1).toLocaleString('default', { month: 'long' }) :
//                             'Filtered';
  
//       generatePDF(columns, rows, `Stock Movement Report - ${timeFilterName}`);
//       setShowDownloadDropdown(false);
//     };

//       const chartData = movements.reduce((acc, m) => {
//       const fromKey = m.fromLocation?.trim();
//       const toKey = m.toLocation?.trim();
//       const qty = m.quantity || 0;

//       // Count Sent (from warehouse)
//       if (fromKey) {
//         if (!acc[fromKey]) {
//           acc[fromKey] = { inventory: fromKey, sent: 0, received: 0 };
//         }
//         acc[fromKey].sent += qty;
//       }

//       // Count Received (to warehouse)
//       if (toKey) {
//         if (!acc[toKey]) {
//           acc[toKey] = { inventory: toKey, sent: 0, received: 0 };
//         }
//         acc[toKey].received += qty;
//       }

//       return acc;
//     }, {});

//     const chartArray = Object.values(chartData);

//   return (
//     <div>
//       <Navbar />
//       <div className="m-6">
//         <div className="flex justify-between items-center">
//           <h1 className="text-2xl font-bold mt-6 mb-10">Stock Movements</h1>
//           <button
//             className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10"
//             onClick={() => navigate("/warehouse-manager/stock-movement/add")}
//           >
//             + Add Stock Movement
//           </button>
//         </div>

//         <ResponsiveContainer width="100%" height={400}>
//           <BarChart barCategoryGap="5%"  data={chartArray}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="inventory" angle={-30} textAnchor="end" interval={0} height={80} tick={{ fontSize: 12 }}/>
//             <YAxis domain={[0, 'dataMax + 2']} />
//             <Tooltip />
//             <Legend />
//             <Bar dataKey="sent" fill="#AAB396" name="Sent" barSize={30} />
//             <Bar dataKey="received" fill="#674636" name="Received" barSize={30}/>
//           </BarChart>
//         </ResponsiveContainer>

//         {/* 🔎 Search + Filter */}
//         <div className=" mt-10 mb-6 flex justify-end items-center gap-2">
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
//                     className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "dispatchedDate" ? "bg-gray-200" : ""}`}
//                     onClick={() => { setFilterBy("dispatchedDate"); setSearchQuery(""); setShowFilter(false); }}
//                   >
//                     Dispatched Date
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
//         </div>

//         <div className="overflow-x-auto text-xs">
//           <table className="min-w-max border-collapse border border-gray-300">
//             <thead>
//               <tr style={{ background: "#674636", color:"#FFFFFF" }}>
//                 <th className="border border-gray-300 px-4 py-2 sticky left-0 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#674636" }}>Actions</th>
//                 <th className="border border-gray-300 px-4 py-2 sticky left-32 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#674636" }}>Stock ID</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16">Material ID</th>
//                 <th className="border border-gray-300 px-4 py-2 w-48">From Location</th>
//                 <th className="border border-gray-300 px-4 py-2 w-48">To Location</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16">Unit</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16">Quantity</th>
//                 <th className="border border-gray-300 px-4 py-2 w-56">Reason</th>
//                 <th className="border border-gray-300 px-4 py-2 w-32">Requested By</th>
//                 <th className="border border-gray-300 px-4 py-2 w-32">Approved By</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16">Employee ID</th>
//                 <th className="border border-gray-300 px-4 py-2 w-32">Vehicle Info</th>
//                 <th className="border border-gray-300 px-4 py-2 w-16">Dispatched Date</th>
//                 <th className="border border-gray-300 px-4 py-2 w-32">Created At</th>
//               </tr>
//             </thead>
//             <tbody className="align-middle text-center text-xs bg-[#FFF8E8]">
//               {filteredMovements.length > 0 ? (
//                 filteredMovements.map((movement) => (
//                   <tr key={movement._id} className="bg-[#FFF8E8]">
//                     {/* Actions */}
//                     <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#FFF8E8" }}>
//                       <div className="flex items-center justify-center gap-6">
//                         <div
//                           className="group relative cursor-pointer"
//                           onClick={() => navigate(`/warehouse-manager/stock-movement/update/${movement._id}`)}
//                         >
//                           <Edit2 className="w-5 h-5  text-[#674636] hover:text-[#A67C52]" />
                          
//                         </div>

//                         <div
//                           className="group relative cursor-pointer"
//                           onClick={() => handleDelete(movement._id)}
//                         >
//                           <Trash2 className="w-5 h-5  text-[#674636] hover:text-[#A67C52]" />
                          
//                         </div>
//                       </div>
//                     </td>

//                     {/* Table Data */}
//                     <td className="border border-gray-300 px-4 py-2 sticky left-32 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#FFF8E8" }}>{movement.stockId}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-16">{movement.materialId}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-48">{movement.fromLocation}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-8">{movement.toLocation}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-16">{movement.unit}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-16">{movement.quantity}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-56">{movement.reason}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-32">{movement.requestedBy}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-32">{movement.approvedBy}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-16">{movement.employeeId}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-32">{movement.vehicleInfo}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-16">{movement.dispatchedDate ? new Date(movement.dispatchedDate).toLocaleDateString() : "-"}</td>
//                     <td className="border border-gray-300 px-4 py-2 w-32">{new Date(movement.createdAt).toLocaleString()}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="14" className="text-center p-4">No stock movements found.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StockMovement;

import Navbar from "../component/navbar.jsx";
import React, { useState, useEffect, useMemo } from "react";
import { fetchStockMovements, deleteStockMovement } from "../services/FstockMovementService.js";
import { Edit2, Trash2, Filter, Search, Download, Eye, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generatePDF } from "../utils/pdfGenerator.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const StockMovement = () => {
  const [movements, setMovements] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch movements
  const getMovements = async () => {
    try {
      const data = await fetchStockMovements();
      setMovements(data);
    } catch (err) {
      console.error("Failed to fetch stock movements:", err);
    }
  };

  useEffect(() => {
    getMovements();
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stock movement?")) return;
    try {
      await deleteStockMovement(id);
      setMovements(movements.filter(m => m._id !== id));
      alert("Stock movement deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete stock movement.");
    }
  };

  // Modal handlers
  const openModal = (movement) => { setSelectedMovement(movement); setShowModal(true); };
  const closeModal = () => { setSelectedMovement(null); setShowModal(false); };

  // Filtering logic
  const filteredMovements = movements.filter((movement) => {
    const query = searchQuery.toLowerCase();
    if (filterBy === "id") return movement.stockId?.toLowerCase().includes(query);
    if (filterBy === "materialId") return movement.materialId?.toLowerCase().includes(query);
    if (filterBy === "fromLocation") return movement.fromLocation?.toLowerCase().includes(query);
    if (filterBy === "toLocation") return movement.toLocation?.toLowerCase().includes(query);
    if (filterBy === "requestedBy") return movement.requestedBy?.toLowerCase().includes(query);
    if (filterBy === "approvedBy") return movement.approvedBy?.toLowerCase().includes(query);
    if (filterBy === "dispatchedDate") return new Date(movement.createdAt).toLocaleString().toLowerCase().includes(query);
    if (filterBy === "all") return Object.keys(movement).some(key =>
      movement[key]?.toString().toLowerCase().includes(query)
    );
    return false;
  });

  // PDF Download
  const handleDownloadPDF = (timeFilter = 'all') => {
    let dataToDownload = filteredMovements;

    if (timeFilter !== 'all') {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      dataToDownload = filteredMovements.filter(movement => {
        const d = new Date(movement.createdAt);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;

        switch(timeFilter) {
          case 'thisMonth': return y === currentYear && m === currentMonth;
          case 'previousMonth': 
            const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
            const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
            return y === prevYear && m === prevMonth;
          case 'thisYear': return y === currentYear;
          default: 
            if (typeof timeFilter === 'number' && timeFilter >= 1 && timeFilter <= 12) return y === currentYear && m === timeFilter;
            return true;
        }
      });
    }

    const columns = [
      "ID", "Material ID", "From Location", "To Location", "Unit", "Quantity",
      "Reason", "Requested By", "Approved By", "Employee ID", "Vehicle Info", "Dispatched Date", "Created At"
    ];
    const rows = dataToDownload.map(m => [
      m.stockId, m.materialId, m.fromLocation, m.toLocation, m.unit, m.quantity,
      m.reason, m.requestedBy, m.approvedBy, m.employeeId, m.vehicleInfo,
      m.dispatchedDate, new Date(m.createdAt).toLocaleString()
    ]);

    const timeFilterName = timeFilter === 'all' ? 'All Records' : 
                           timeFilter === 'thisMonth' ? 'This Month' :
                           timeFilter === 'previousMonth' ? 'Previous Month' :
                           timeFilter === 'thisYear' ? 'This Year' :
                           typeof timeFilter === 'number' ? new Date(2024, timeFilter - 1).toLocaleString('default', { month: 'long' }) :
                           'Filtered';

    generatePDF(columns, rows, `Stock Movement Report - ${timeFilterName}`);
    setShowDownloadDropdown(false);
  };

  // Chart data
  const chartData = useMemo(() => {
    const acc = {};
    movements.forEach(m => {
      const from = m.fromLocation?.trim();
      const to = m.toLocation?.trim();
      const qty = m.quantity || 0;
      if (from) acc[from] = acc[from] || { inventory: from, sent: 0, received: 0 };
      if (to) acc[to] = acc[to] || { inventory: to, sent: 0, received: 0 };
      if (from) acc[from].sent += qty;
      if (to) acc[to].received += qty;
    });
    return Object.values(acc);
  }, [movements]);

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mt-6 mb-10">Stock Movements</h1>
          <button
            className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10"
            onClick={() => navigate("/warehouse-manager/stock-movement/add")}
          >
            + Add Stock Movement
          </button>
        </div>

        {/* Chart */}
        <div className="w-full mb-10 bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-lg p-6 border border-amber-100">
          <h2 className="text-xl font-bold text-[#674636] mb-2">Stock Movement Overview</h2>
          <p className="text-sm text-gray-600 mb-4">Sent vs Received per Inventory</p>
          <div className="w-full h-80">
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="inventory" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#D1D5DB' }} tickLine={{ stroke: '#D1D5DB' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#D1D5DB' }} tickLine={{ stroke: '#D1D5DB' }} label={{ value: 'Quantity', angle: -90, position: 'insideLeft', style: { fill: '#6B7280', fontSize: 12 } }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: 12 }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="sent" fill="#AAB396" name="Sent" barSize={40} radius={[8,8,0,0]} />
                <Bar dataKey="received" fill="#674636" name="Received" barSize={40} radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="mb-6 flex justify-end items-center gap-2">
          <Search className="w-5 h-5 text-gray-700" />
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-400 px-4 py-2 bg-white rounded w-7xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="relative">
            <button onClick={() => setShowFilter(!showFilter)} className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500">
              <Filter className="w-5 h-5 text-gray-700" />
            </button>
            {showFilter && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded shadow-md w-40 z-50">
                <ul className="text-sm">
                  {["all","id","materialId","fromLocation","toLocation","requestedBy","approvedBy","dispatchedDate"].map(f => (
                    <li key={f} className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy===f?"bg-gray-200":""}`}
                        onClick={()=>{setFilterBy(f); setSearchQuery(""); setShowFilter(false);}}>
                      {f==="all"?"All":f.charAt(0).toUpperCase()+f.slice(1)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={()=>setShowDownloadDropdown(!showDownloadDropdown)} className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500">
              <Download className="w-5 h-5 text-gray-700" />
            </button>
            {showDownloadDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded shadow-md w-48 z-50">
                <ul className="text-sm">
                  {["thisMonth","previousMonth","thisYear","all"].map((option,i) => (
                    <li key={i} className="px-4 py-2 cursor-pointer hover:bg-gray-100" onClick={()=>handleDownloadPDF(option)}>
                      {option==="all"?"All Records":option==="thisMonth"?"This Month":option==="previousMonth"?"Previous Month":"This Year"}
                    </li>
                  ))}
                  <li className="px-4 py-2 text-gray-500 font-medium border-b border-gray-200">Select Month:</li>
                  {["January","February","March","April","May","June","July","August","September","October","November","December"].map((month,index)=>(
                    <li key={month} className="px-4 py-2 cursor-pointer hover:bg-gray-100" onClick={()=>handleDownloadPDF(index+1)}>{month}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto text-xs">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr style={{ background: "#674636", color:"#FFFFFF" }}>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
              <th className="border border-gray-300 px-4 py-2">Stock ID</th>
              <th className="border border-gray-300 px-4 py-2">Material ID</th>
              <th className="border border-gray-300 px-4 py-2">From Location</th>
              <th className="border border-gray-300 px-4 py-2">To Location</th>
              <th className="border border-gray-300 px-4 py-2">Unit</th>
              <th className="border border-gray-300 px-4 py-2">Quantity</th>
              <th className="border border-gray-300 px-4 py-2">Reason</th>
              <th className="border border-gray-300 px-4 py-2">Dispatched Date</th>
            </tr>
          </thead>
          <tbody className="text-center text-xs">
            {filteredMovements.length > 0 ? filteredMovements.map(m => (
              <tr key={m._id} className="bg-[#FFF8E8] hover:bg-[#F4E1C9]">
                <td className="border px-4 py-2 flex justify-center gap-2">
                  <Eye className="w-5 h-5 cursor-pointer text-[#674636]" onClick={()=>openModal(m)} title="View"/>
                  <Trash2 className="w-5 h-5 cursor-pointer text-[#674636]" onClick={()=>handleDelete(m._id)} title="Delete"/>
                </td>
                <td className="border px-4 py-2">{m.stockId}</td>
                <td className="border px-4 py-2">{m.materialId}</td>
                <td className="border px-4 py-2">{m.fromLocation}</td>
                <td className="border px-4 py-2">{m.toLocation}</td>
                <td className="border px-4 py-2">{m.unit}</td>
                <td className="border px-4 py-2">{m.quantity}</td>
                <td className="border px-4 py-2">{m.reason}</td>
                <td className="border px-4 py-2">{m.dispatchedDate}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={9} className="text-center p-4">No stock movements found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

        {/* Modal */}
{showModal && selectedMovement && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative animate-scaleIn">
      
      {/* Enhanced Close Button */}
      <button
        onClick={closeModal}
        className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg border border-gray-300 hover:bg-gray-50 hover:scale-110 transition-all duration-200 z-10"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      {/* Enhanced Alert Banner */}
      {selectedMovement.quantity <= selectedMovement.reorderLevel && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-t-2xl flex items-center gap-3">
          <div className="bg-white text-red-600 rounded-full w-7 h-7 flex items-center justify-center font-bold shadow-sm">
            <span className="text-sm">!</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">Critical Stock Alert</p>
            <p className="text-xs opacity-95">Immediate restocking required - Quantity below reorder level</p>
          </div>
          <div className="bg-red-400/20 px-2 py-1 rounded-full">
            <span className="text-xs font-semibold">URGENT</span>
          </div>
        </div>
      )}

      {/* Modal Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#674636] to-[#8B5A3C] rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Stock Movement Details</h2>
            <p className="text-sm text-gray-500 mt-1">Complete information about this stock transfer</p>
          </div>
        </div>
      </div>

      {/* Modal Body - No Scroll */}
      <div className="p-6">
        {/* Three-column compact layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Column 1: Basic Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Basic Info
            </h3>
            <div className="space-y-2">
              {[
                { label: "Stock ID", value: selectedMovement.stockId },
                { label: "Material ID", value: selectedMovement.materialId },
                { label: "Unit", value: selectedMovement.unit },
                { label: "Quantity", value: (
                  <span className={`font-bold ${selectedMovement.quantity <= selectedMovement.reorderLevel ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedMovement.quantity}
                  </span>
                )},
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">{item.label}</span>
                  <span className="text-gray-900 font-semibold bg-gray-50 px-2 py-1 rounded text-xs">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Locations & Transport */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Locations & Transport
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">From</span>
                <span className="text-red-600 font-semibold bg-red-50 px-2 py-1 rounded text-xs">
                  {selectedMovement.fromLocation}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">To</span>
                <span className="text-green-600 font-semibold bg-green-50 px-2 py-1 rounded text-xs">
                  {selectedMovement.toLocation}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Vehicle</span>
                <span className="text-gray-900 font-semibold bg-gray-50 px-2 py-1 rounded text-xs">
                  {selectedMovement.vehicleInfo || "-"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Dispatched</span>
                <span className="text-gray-900 font-semibold bg-gray-50 px-2 py-1 rounded text-xs">
                  {selectedMovement.dispatchedDate ? new Date(selectedMovement.dispatchedDate).toLocaleDateString() : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Personnel & Dates */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personnel
            </h3>
            <div className="space-y-2">
              {[
                { label: "Requested By", value: selectedMovement.requestedBy },
                { label: "Approved By", value: selectedMovement.approvedBy },
                { label: "Employee ID", value: selectedMovement.employeeId },
                { label: "Created", value: new Date(selectedMovement.createdAt).toLocaleDateString() },
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">{item.label}</span>
                  <span className="text-gray-900 font-semibold bg-gray-50 px-2 py-1 rounded text-xs">
                    {item.value || "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reason Section - Full Width */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Reason for Movement
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              {selectedMovement.reason || "No reason provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Updated: {new Date(selectedMovement.updatedAt || selectedMovement.createdAt).toLocaleDateString()}
        </div>
        
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-semibold transition-all duration-200 hover:bg-gray-50 text-sm flex items-center gap-1"
            onClick={closeModal}
          >
            <X className="w-4 h-4" />
            Close
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-[#674636] to-[#8B5A3C] hover:from-[#8B5A3C] hover:to-[#674636] text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-md text-sm flex items-center gap-1"
            onClick={() => {
              closeModal();
              navigate(`/warehouse-manager/stock-movement/update/${selectedMovement._id}`);
            }}
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default StockMovement;
