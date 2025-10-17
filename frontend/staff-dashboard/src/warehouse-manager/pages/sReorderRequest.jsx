import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar.jsx";
import { fetchSReorderRequests, deleteSReorderRequest } from "../services/FsReorderRequestService.js";
import { Edit2, Trash2,Filter, Search,Download } from "lucide-react";
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
      alert("Stock Reorder Request deleted successfully!");
    } catch (err) {
      console.error("Failed to delete request:", err);
      alert("Failed to delete request.");
    }
  };

  // Filtering logic
    const filteredRequests = requests.filter((request) => {
    const query = searchQuery.toLowerCase();

    if (filterBy === "id") {
      return request.stockReorderRequestId?.toLowerCase().includes(query);
    }
    if (filterBy === "inventoryId") {
      return request.inventoryId?.toLowerCase().includes(query);
    }
    if(filterBy === "inventoryName") {
      return request.inventoryName?.toLowerCase().includes(query);
    }
    if (filterBy === "inventoryAddress") {
      return request.inventoryAddress?.toLowerCase().includes(query);
    }
    if (filterBy === "materialId") {
      return request.materialId?.toLowerCase().includes(query);
    }
    if(filterBy === "materialName") {
      return request.materialName?.toLowerCase().includes(query);
    }
    if (filterBy === "type") {
      return request.type?.toLowerCase().includes(query);
    }
    if (filterBy === "expectedDate") {
      return request.expectedDate?.toLowerCase().includes(query);
    }
    if(filterBy === "status") {
      return request.status?.toLowerCase().includes(query);
    }
    

    // Default: search all
    if (filterBy === "all") {
    return (
      request.stockReorderRequestId?.toLowerCase().includes(query) ||
      request.inventoryId?.toLowerCase().includes(query) ||
      request.inventoryAddress?.toLowerCase().includes(query) ||
      request.materialId?.toLowerCase().includes(query) ||
      request.materialName?.toLowerCase().includes(query) ||
      request.type?.toLowerCase().includes(query) ||
      request.expectedDate?.toLowerCase().includes(query) ||
      request.status?.toLowerCase().includes(query)
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

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" name="Total Requests" stroke="#4CAF50" strokeWidth={2} />
            <Line type="monotone" dataKey="pending" name="Pending Requests" stroke="#FFA500" strokeWidth={2} />
            <Line type="monotone" dataKey="checked" name="Checked Requests" stroke="#2196F3" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>

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
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "inventoryId" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("inventoryId"); setSearchQuery(""); setShowFilter(false); }}
                    >
                    Inventory ID
                    </li>
                    <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "inventoryName" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("inventoryName"); setSearchQuery(""); setShowFilter(false); }}
                    >
                    Inventory Name
                    </li>
                    <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "inventoryAddress" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("inventoryAddress"); setSearchQuery(""); setShowFilter(false); }} 
                    >
                    Inventory Address
                    </li>
                    <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "materialId" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("materialId"); setSearchQuery(""); setShowFilter(false); }}
                    >
                    Material ID
                    </li>
                    <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "materialName" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("materialName"); setSearchQuery(""); setShowFilter(false); }}
                    >
                    Material Name
                    </li>
                    <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "type" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("type"); setSearchQuery(""); setShowFilter(false); }}
                    >
                    Type
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

        <div className="overflow-x-auto text-xs">
          <table className="min-w-max border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2 sticky left-0 w-32 bg-brown-primary text-cream-primary z-40 relative">Actions</th>
                <th className="border border-gray-300 px-4 py-2 sticky left-32 w-32 bg-brown-primary text-cream-primary z-40 relative">Request ID</th>
                <th className="border border-gray-300 px-4 py-2 w-48 bg-brown-primary text-cream-primary">Inventory Name</th>
                <th className="border border-gray-300 px-4 py-2 w-48 bg-brown-primary text-cream-primary">Inventory Address</th>
                <th className="border border-gray-300 px-4 py-2 w-48 bg-brown-primary text-cream-primary">Inventory Contact</th>
                <th className="border border-gray-300 px-4 py-2 w-48 bg-brown-primary text-cream-primary">Material Name</th>
                <th className="border border-gray-300 px-4 py-2 w-16 bg-brown-primary text-cream-primary">Material ID</th>
                <th className="border border-gray-300 px-4 py-2 w-16 bg-brown-primary text-cream-primary">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 w-48 bg-brown-primary text-cream-primary">Type</th>
                <th className="border border-gray-300 px-4 py-2 w-16 bg-brown-primary text-cream-primary">Unit</th>
                <th className="border border-gray-300 px-4 py-2 w-16 bg-brown-primary text-cream-primary">Expected Date</th>
                <th className="border border-gray-300 px-4 py-2 w-32 bg-brown-primary text-cream-primary">Warehouse Manager</th>
                <th className="border border-gray-300 px-4 py-2 w-16 bg-brown-primary text-cream-primary">Status</th>
                <th className="border border-gray-300 px-4 py-2 w-32 bg-brown-primary text-cream-primary">Created At</th>
              </tr>
            </thead>
            <tbody className="align-middle text-center text-xs">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => {
                  const createdDate = request.createdAt ? new Date(request.createdAt) : null;
                  const expectedDate = request.expectedDate ? new Date(request.expectedDate) : null;

                  let rowColor = "bg-white"; // default
                  if (expectedDate) {
                    const today = new Date();
                    const diffTime = expectedDate - today;
                    const diffDays = diffTime / (1000 * 60 * 60 * 24);

                    if (diffDays >= 0 && diffDays <= 7) {
                      rowColor = "bg-red-100"; // 🔴 highlight if expected within next 7 days
                    }
                    // else it stays white automatically
                  }

              

                  return (
                    <tr key={request._id}>
                      {/* Actions */}
                      <td className={`border border-gray-300 px-4 py-2 sticky left-0 z-40 ${rowColor}`}>
                        <div className="flex items-center justify-center gap-6">
                          <div
                            className="group relative cursor-pointer"
                            onClick={() => navigate(`/warehouse-manager/reorder-request/update/${request._id}`)}
                          >
                            <Edit2 className="w-5 h-5 text-amber-500 hover:text-amber-600" />
                          </div>
                          <div
                            className="group relative cursor-pointer"
                            onClick={() => handleDelete(request._id)}
                          >
                            <Trash2 className="w-5 h-5 text-amber-500 hover:text-amber-600" />
                          </div>
                        </div>
                      </td>

                      {/* Table Data */}
                      <td className={`border border-gray-300 px-4 py-2 sticky left-32 z-40 ${rowColor}`}>
                        {request.stockReorderRequestId}
                      </td>
                      <td className={`border border-gray-300 px-4 py-2 w-48 ${rowColor}`}>{request.inventoryName}</td>
                      <td className={`border border-gray-300 px-4 py-2 w-48 ${rowColor}`}>{request.inventoryAddress}</td>
                      <td className={`border border-gray-300 px-4 py-2 w-48 ${rowColor}`}>{request.inventoryContact}</td>
                      <td className={`border border-gray-300 px-4 py-2 w-48 ${rowColor}`}>{request.materialName}</td>
                      <td className={`border border-gray-300 px-4 py-2 w-16 ${rowColor}`}>{request.materialId}</td>
                      <td className={`border border-gray-300 px-4 py-2 w-16 ${rowColor}`}>{request.quantity}</td>
                      <td className={`border border-gray-300 px-4 py-2 w-48 ${rowColor}`}>{request.type}</td>
                      <td className={`border border-gray-300 px-4 py-2 w-16 ${rowColor}`}>{request.unit}</td>
                      <td className={`border border-gray-300 px-4 py-2 w-16 ${rowColor}`}>
                        {expectedDate ? expectedDate.toLocaleDateString() : "-"}
                      </td>
                      <td className={`border border-gray-300 px-4 py-2 w-32 ${rowColor}`}>
                        {request.warehouseManagerName}
                      </td>
                      <td className={`border border-gray-300 px-4 py-2 w-16 ${rowColor}`}>{request.status}</td>
                      <td className={`border border-gray-300 px-4 py-2 w-32 ${rowColor}`}>
                        {createdDate ? createdDate.toLocaleString() : "-"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="14" className="text-center p-4">No stock reorder requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SReorderRequest;
