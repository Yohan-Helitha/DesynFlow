import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar.jsx";
import { fetchTransferRequests, deleteTransferRequest } from "../services/FtransferRequestService.js";
import { Edit2, Trash2,Filter,Search, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generatePDF } from "../utils/pdfGenerator.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";


const TransferRequest = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilter, setShowFilter] = useState(false);

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
    if(filterBy === "createdAt") {
      return new Date(request.createdAt).toLocaleString().toLowerCase().includes(query);
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
      request.requiredBy?.toLowerCase().includes(query) ||
      new Date(request.createdAt).toLocaleString().toLowerCase().includes(query)
    );
    }
  });

  //pdf function
    const handleDownloadPDF = () => {
      console.log("Downloading PDF...");
  
      const columns = [
      "ID", "Material ID", "From Location", "Quantity", "Reason", "Requested By", 
      "Approved By", "Created By", "Updated At", 
      ];
  
      const rows = filteredRequests.map(request => [
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
        request.requiredBy,
        request.createdAt,
        request.updatedAt,
        new Date(request.createdAt).toLocaleString()
      ]);
  
      generatePDF(columns, rows, "Transfer Request Report");
  
    };

    const chartData = filteredRequests.reduce((acc, req) => {
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

    const chartArray = Object.values(chartData);


  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mt-6 mb-10">Transfer Requests</h1>
          <button
            className="bg-amber-900 hover:bg-bamber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10"
            onClick={() => navigate("/add-transfer-request")}
          >
            + Add Transfer Request
          </button>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartArray} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="warehouse" 
              angle={-30} 
              textAnchor="end" 
              interval={0} 
              height={80} 
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="sent" fill="#9d0208" name="Sent" barSize={20} />
            <Bar dataKey="received" fill="#03045e" name="Received" barSize={20} />
          </BarChart>
        </ResponsiveContainer>

        {/* 🔎 Search + Filter */}
        <div className="mt-10 mb-6 flex justify-end items-center gap-2">
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
                    Stock ID
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
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "requestedBy" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("requestedBy"); setSearchQuery(""); setShowFilter(false); }}
                  >
                    Requested By
                  </li>
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "approvedBy" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("approvedBy"); setSearchQuery(""); setShowFilter(false); }}
                  >
                    Approved By
                  </li>
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "status" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("status"); setSearchQuery(""); setShowFilter(false); }}
                  >
                    Status
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
          <table className="min-w-max border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 sticky left-0 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">Actions</th>
                <th className="border border-gray-300 px-4 py-2 sticky left-32 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">Transfer Request ID</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Material ID</th>
                <th className="border border-gray-300 px-4 py-2 w-48">From Location</th>
                <th className="border border-gray-300 px-4 py-2 w-48">To Location</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 w-56">Reason</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Requested By</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Approved By</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Status</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Required By</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Created At</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Updated At</th>
              </tr>
            </thead>
            <tbody className="align-middle text-center text-xs bg-white">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request._id}>
                    {/* Actions */}
                    <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">
                      <div className="flex items-center justify-center gap-6">
                        <div
                          className="group relative cursor-pointer"
                          onClick={() => navigate(`/update-transfer-request/${request._id}`)}
                        >
                          <Edit2 className="w-5 h-5  text-amber-500 hover:text-amber-600" />
                          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100">
                            Update
                          </span>
                        </div>
                        <div
                          className="group relative cursor-pointer"
                          onClick={() => handleDelete(request._id)}
                        >
                          <Trash2 className="w-5 h-5  text-amber-500 hover:text-amber-600" />
                          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100">
                            Delete
                          </span>
                        </div>
                      </div>
                    </td>
                    {/* Table Data */}
                    <td className="border border-gray-300 px-4 py-2 sticky left-32 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">{request.transferRequestId}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{request.materialId}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{request.fromLocation}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{request.toLocation}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{request.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 w-56">{request.reason}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{request.requestedBy}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{request.approvedBy}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{request.status}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{request.requiredBy ? new Date(request.requiredBy).toLocaleDateString() : "-"}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{request.createdAt ? new Date(request.createdAt).toLocaleString() : "-"}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{request.updatedAt ? new Date(request.updatedAt).toLocaleString() : "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="text-center p-4">No transfer requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransferRequest;