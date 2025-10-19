// import React, { useState, useEffect } from "react";
// import Navbar from "../component/navbar.jsx";
// import { Edit2, Trash2, Filter, Search, Download } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { generatePDF } from "../utils/pdfGenerator.js";
// import {
//   fetchWarrantyClaims,
//   deleteWarrantyClaim,
// } from "../services/FwarrantyClaimService.js";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// const WarrantyClaims = () => {
//   const [claims, setClaims] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterBy, setFilterBy] = useState("all");
//   const [showFilter, setShowFilter] = useState(false);
//   const navigate = useNavigate();

//   // Fetch claims
//   const getClaims = async () => {
//     try {
//       const data = await fetchWarrantyClaims();
//       setClaims(data);
//     } catch (err) {
//       console.error("Failed to fetch warranty claims:", err);
//     }
//   };

//   useEffect(() => {
//     getClaims();
//   }, []);


//   // Filtering logic
//   const filteredClaims = claims.filter((claim) => {
//     const query = searchQuery.toLowerCase();
//     if (filterBy === "status") return claim.status?.toLowerCase().includes(query);
//     if (filterBy === "issueDescription")
//       return claim.issueDescription?.toLowerCase().includes(query);
//     if (filterBy === "clientId")
//       return claim.clientId?.toLowerCase().includes(query);
//     if (filterBy === "financeReviewerId")
//       return claim.financeReviewerId?.toLowerCase().includes(query);
//     if (filterBy === "createdAt")
//       return new Date(claim.createdAt).toLocaleString().toLowerCase().includes(query);
//     if (filterBy === "updatedAt")
//       return new Date(claim.updatedAt).toLocaleString().toLowerCase().includes(query);

//     // default: all fields
//     return (
//       claim.issueDescription?.toLowerCase().includes(query) ||
//       claim.status?.toLowerCase().includes(query) ||
//       claim.clientId?.toLowerCase().includes(query) ||
//       claim.financeReviewerId?.toLowerCase().includes(query) ||
//       new Date(claim.createdAt).toLocaleString().toLowerCase().includes(query)
//     );
//   });

//   // PDF function
//   const handleDownloadPDF = () => {
//     const columns = [
//       "Warranty ID",
//       "Client ID",
//       "Issue Description",
//       "Status",
//       "Finance Reviewer",
//       "Shipped Replacement",
//       "Shipped At",
//       "Created At",
//       "Updated At",
//     ];

//     const rows = filteredClaims.map((claim) => [
//       claim.warrantyId,
//       claim.clientId,
//       claim.issueDescription,
//       claim.status,
//       claim.financeReviewerId || "-",
//       claim.warehouseAction?.shippedReplacement ? "Yes" : "No",
//       claim.warehouseAction?.shippedAt
//         ? new Date(claim.warehouseAction.shippedAt).toLocaleString()
//         : "-",
//       new Date(claim.createdAt).toLocaleString(),
//       new Date(claim.updatedAt).toLocaleString(),
//     ]);

//     generatePDF(columns, rows, "Warranty Claim Report");
//   };

//   // Chart Data (claims per status)
//   const chartData = filteredClaims.reduce((acc, claim) => {
//     const status = claim.status || "Unknown";
//     const existing = acc.find((item) => item.status === status);
//     if (existing) existing.count += 1;
//     else acc.push({ status, count: 1 });
//     return acc;
//   }, []);

//   return (
//     <div>
//       <Navbar />
//       <div className="m-6">
//         <div className="flex justify-between items-center">
//           <h1 className="text-2xl font-bold mt-6 mb-10">Warranty Claims</h1>
         
//         </div>

//         {/* Chart */}
//         <ResponsiveContainer width="100%" height={400}>
//           <BarChart data={chartData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="status" />
//             <YAxis allowDecimals={false} />
//             <Tooltip />
//             <Legend />
//             <Bar dataKey="count" fill="#AAB396" name="Claims Count" barSize={40} />
//           </BarChart>
//         </ResponsiveContainer>

//         {/* Search + Filter + PDF */}
//         <div className="mt-10 mb-6 flex justify-end items-center gap-2">
//           <Search className="w-5 h-5 text-gray-700" />
//           <input
//             type="text"
//             placeholder="Search..."
//             className="border border-gray-400 px-4 py-2 bg-white rounded w-6xl focus:outline-none focus:ring-2 focus:ring-amber-500"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />

//           {/* Filter */}
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
//                   {[
//                     "all",
//                     "issueDescription",
//                     "status",
//                     "clientId",
//                     "financeReviewerId",
//                     "createdAt",
//                     "updatedAt",
//                   ].map((key) => (
//                     <li
//                       key={key}
//                       className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
//                         filterBy === key ? "bg-gray-200" : ""
//                       }`}
//                       onClick={() => {
//                         setFilterBy(key);
//                         setSearchQuery("");
//                         setShowFilter(false);
//                       }}
//                     >
//                       {key.charAt(0).toUpperCase() + key.slice(1)}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>

//           {/* Download PDF */}
//           <button
//             onClick={handleDownloadPDF}
//             className="p-2 border border-gray-400 rounded bg-white hover:bg-gray-100 focus:ring-2 focus:ring-amber-500"
//             title="Download PDF"
//           >
//             <Download className="w-5 h-5 text-gray-700" />
//           </button>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto text-xs">
//           <table className="min-w-max border-collapse border border-gray-300">
//             <thead>
//               <tr style={{ background: "#674636", color: "#FFFFFF" }}>
//                 <th className="border border-gray-300 px-4 py-2 sticky left-0 bg-[#674636] z-40">
//                   Actions
//                 </th>
//                 <th className="border border-gray-300 px-4 py-2">
//                   Warranty ID
//                 </th>
//                 <th className="border border-gray-300 px-4 py-2">Client ID</th>
//                 <th className="border border-gray-300 px-4 py-2">
//                   Issue Description
//                 </th>
//                 <th className="border border-gray-300 px-4 py-2">Status</th>
//                 <th className="border border-gray-300 px-4 py-2">
//                   Finance Reviewer
//                 </th>
//                 <th className="border border-gray-300 px-4 py-2">
//                   Shipped Replacement
//                 </th>
//                 <th className="border border-gray-300 px-4 py-2">Shipped At</th>
//                 <th className="border border-gray-300 px-4 py-2">
//                   Created At
//                 </th>
//                 <th className="border border-gray-300 px-4 py-2">
//                   Updated At
//                 </th>
//               </tr>
//             </thead>

//             <tbody className="align-middle text-center text-xs bg-[#FFF8E8]">
//               {filteredClaims.length > 0 ? (
//                 filteredClaims.map((claim) => (
//                   <tr key={claim._id}>
//                     <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-[#FFF8E8] z-40">
//                       <div className="flex items-center justify-center gap-6">
//                         <Edit2
//                           className="w-5 h-5 text-[#674636] hover:text-[#A67C52] cursor-pointer"
//                           onClick={() =>
//                             navigate(`/warehouse-manager/warranty-claims/update/${claim._id}`)
//                           }
//                         />
//                       </div>
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">{claim.warrantyId}</td>
//                     <td className="border border-gray-300 px-4 py-2">{claim.clientId}</td>
//                     <td className="border border-gray-300 px-4 py-2">{claim.issueDescription}</td>
//                     <td className="border border-gray-300 px-4 py-2">{claim.status}</td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       {claim.financeReviewerId || "-"}
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       {claim.warehouseAction?.shippedReplacement ? "Yes" : "No"}
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       {claim.warehouseAction?.shippedAt
//                         ? new Date(claim.warehouseAction.shippedAt).toLocaleString()
//                         : "-"}
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       {new Date(claim.createdAt).toLocaleString()}
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       {new Date(claim.updatedAt).toLocaleString()}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="10" className="text-center p-4">
//                     No warranty claims found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WarrantyClaims;

import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar.jsx";
import { Edit2, Trash2, Filter, Search, Download, Eye, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generatePDF } from "../utils/pdfGenerator.js";
import {
  fetchWarrantyClaims,
  deleteWarrantyClaim,
} from "../services/FwarrantyClaimService.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const WarrantyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Fetch claims
  const getClaims = async () => {
    try {
      const data = await fetchWarrantyClaims();
      setClaims(data);
    } catch (err) {
      console.error("Failed to fetch warranty claims:", err);
    }
  };

  useEffect(() => {
    getClaims();
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this warranty claim?");
    if (!confirmDelete) return;

    try {
      await deleteWarrantyClaim(id);
      setClaims(claims.filter(claim => claim._id !== id));
      if (showModal && selectedClaim?._id === id) {
        setShowModal(false);
        setSelectedClaim(null);
      }
      alert("Warranty claim deleted successfully!");
    } catch (err) {
      console.error("Failed to delete warranty claim:", err);
      alert("Failed to delete warranty claim.");
    }
  };

  // Modal handlers
  const openModal = (claim) => {
    setSelectedClaim(claim);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClaim(null);
  };

  // Filtering logic
  const filteredClaims = claims.filter((claim) => {
    const query = searchQuery.toLowerCase();
    if (filterBy === "status") return claim.status?.toLowerCase().includes(query);
    if (filterBy === "issueDescription")
      return claim.issueDescription?.toLowerCase().includes(query);
    if (filterBy === "clientId")
      return claim.clientId?.toLowerCase().includes(query);
    if (filterBy === "financeReviewerId")
      return claim.financeReviewerId?.toLowerCase().includes(query);
    if (filterBy === "createdAt")
      return new Date(claim.createdAt).toLocaleString().toLowerCase().includes(query);
    if (filterBy === "updatedAt")
      return new Date(claim.updatedAt).toLocaleString().toLowerCase().includes(query);

    // default: all fields
    return (
      claim.issueDescription?.toLowerCase().includes(query) ||
      claim.status?.toLowerCase().includes(query) ||
      claim.clientId?.toLowerCase().includes(query) ||
      claim.financeReviewerId?.toLowerCase().includes(query) ||
      new Date(claim.createdAt).toLocaleString().toLowerCase().includes(query)
    );
  });

  // PDF function
  const handleDownloadPDF = () => {
    const columns = [
      "Warranty ID",
      "Client ID",
      "Issue Description",
      "Status",
      "Finance Reviewer",
      "Shipped Replacement",
      "Shipped At",
      "Created At",
      "Updated At",
    ];

    const rows = filteredClaims.map((claim) => [
      claim.warrantyId,
      claim.clientId,
      claim.issueDescription,
      claim.status,
      claim.financeReviewerId || "-",
      claim.warehouseAction?.shippedReplacement ? "Yes" : "No",
      claim.warehouseAction?.shippedAt
        ? new Date(claim.warehouseAction.shippedAt).toLocaleString()
        : "-",
      new Date(claim.createdAt).toLocaleString(),
      new Date(claim.updatedAt).toLocaleString(),
    ]);

    generatePDF(columns, rows, "Warranty Claim Report");
  };

  // Chart Data (claims per status)
  const chartData = filteredClaims.reduce((acc, claim) => {
    const status = claim.status || "Unknown";
    const existing = acc.find((item) => item.status === status);
    if (existing) existing.count += 1;
    else acc.push({ status, count: 1 });
    return acc;
  }, []);

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navbar />
      <div className="m-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mt-6 mb-10">Warranty Claims</h1>
        </div>

        {/* Chart */}
        <div className="w-full mb-10 bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-lg p-6 border border-amber-100">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-[#674636] mb-1">Warranty Claims Overview</h2>
            <p className="text-sm text-gray-600">Claims distribution by status</p>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer>
              <BarChart 
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5A3C" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#674636" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis 
                  dataKey="status" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#D1D5DB' }}
                  tickLine={{ stroke: '#D1D5DB' }}
                />
                <YAxis 
                  domain={[0, 'dataMax + 2']}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#D1D5DB' }}
                  tickLine={{ stroke: '#D1D5DB' }}
                  label={{ value: 'Claims Count', angle: -90, position: 'insideLeft', style: { fill: '#6B7280', fontSize: 12 } }}
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
                  formatter={() => 'Claims Count'}
                />
                <Bar 
                  dataKey="count" 
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                  animationDuration={1000}
                /> 
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Search + Filter + PDF */}
        <div className="mt-10 mb-6 flex justify-end items-center gap-2">
          <Search className="w-5 h-5 text-gray-700" />
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-400 px-4 py-2 bg-white rounded w-6xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Filter */}
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
                  {[
                    "all",
                    "issueDescription",
                    "status",
                    "clientId",
                    "financeReviewerId",
                    "createdAt",
                    "updatedAt",
                  ].map((key) => (
                    <li
                      key={key}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                        filterBy === key ? "bg-gray-200" : ""
                      }`}
                      onClick={() => {
                        setFilterBy(key);
                        setSearchQuery("");
                        setShowFilter(false);
                      }}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Download PDF */}
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
              <tr style={{ background: "#674636", color: "#FFFFFF" }}>
                <th className="border border-gray-300 px-4 py-2 w-24">Actions</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Warranty ID</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Issue Description</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Status</th>
                <th className="border border-gray-300 px-4 py-2 w-40">Shipped Replacement</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Shipped At</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Created At</th>
              </tr>
            </thead>

            <tbody className="align-middle text-center text-xs">
              {filteredClaims.length > 0 ? (
                filteredClaims.map((claim) => (
                  <tr key={claim._id} className="bg-[#FFF8E8] hover:bg-[#F5EDDC]">
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex items-center justify-center gap-3">
                        <Eye 
                          className="w-5 h-5 cursor-pointer text-[#674636] hover:text-[#A67C52]" 
                          onClick={() => openModal(claim)}
                          title="View Details"
                        />
                        <Trash2 
                          className="w-5 h-5 cursor-pointer text-[#674636] hover:text-[#A67C52]" 
                          onClick={() => handleDelete(claim._id)}
                          title="Delete"
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{claim.warrantyId}</td>
                    <td className="border border-gray-300 px-4 py-2">{claim.issueDescription}</td>
                    <td className="border border-gray-300 px-4 py-2">{claim.status}</td>
                    
                    <td className="border border-gray-300 px-4 py-2">
                      {claim.warehouseAction?.shippedReplacement ? "Yes" : "No"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {claim.warehouseAction?.shippedAt
                        ? new Date(claim.warehouseAction.shippedAt).toLocaleString()
                        : "-"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(claim.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-4">
                    No warranty claims found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

{/* Modal */}
{showModal && selectedClaim && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl relative max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Claim Details</h2>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              selectedClaim.status === 'approved' ? 'bg-green-100 text-green-800' :
              selectedClaim.status === 'rejected' ? 'bg-red-100 text-red-800' :
              selectedClaim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {selectedClaim.status?.charAt(0).toUpperCase() + selectedClaim.status?.slice(1)}
            </span>
          </div>
          <button
            onClick={closeModal}
            className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow transition-all border border-gray-200"
          >
            <X className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>
        <p className="text-gray-500 text-sm mt-1">ID: {selectedClaim.warrantyId}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Compact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Client & Finance */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-500 rounded"></div>
                Client Info
              </h3>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Client ID</label>
                <p className="text-gray-900 font-medium text-sm">{selectedClaim.clientId}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-green-500 rounded"></div>
                Finance
              </h3>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Reviewer</label>
                <p className={`font-medium text-sm ${
                  selectedClaim.financeReviewerId ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {selectedClaim.financeReviewerId || "Not assigned"}
                </p>
              </div>
            </div>
          </div>

          {/* Warehouse & Timeline */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-purple-500 rounded"></div>
                Warehouse
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Replacement Shipped</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    selectedClaim.warehouseAction?.shippedReplacement 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedClaim.warehouseAction?.shippedReplacement ? "Yes" : "No"}
                  </span>
                </div>
                {selectedClaim.warehouseAction?.shippedAt && (
                  <div>
                    <label className="text-xs text-gray-500">Shipped Date</label>
                    <p className="text-gray-900 font-medium text-sm">
                      {new Date(selectedClaim.warehouseAction.shippedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-orange-500 rounded"></div>
                Timeline
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500">Created</label>
                  <p className="text-gray-900 font-medium text-sm">
                    {new Date(selectedClaim.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Updated</label>
                  <p className="text-gray-900 font-medium text-sm">
                    {new Date(selectedClaim.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Issue Description */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-red-500 rounded"></div>
            Issue Description
          </h3>
          <div className="bg-white rounded border border-gray-200 p-3">
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {selectedClaim.issueDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-gray-500">
            Updated: {new Date(selectedClaim.updatedAt).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              onClick={closeModal}
            >
              Close
            </button>
            <button
              className="px-4 py-2 bg-amber-900 hover:bg-amber-800 text-white rounded-lg font-medium text-sm flex items-center gap-1.5 transition-colors"
              onClick={() => {
                closeModal();
                navigate(`/warehouse-manager/warranty-claims/update/${selectedClaim._id}`);
              }}
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default WarrantyClaims;