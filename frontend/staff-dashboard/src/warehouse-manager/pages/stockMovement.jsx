import Navbar from "../component/navbar.jsx";
import React, { useState, useEffect } from "react";
import { fetchStockMovements, deleteStockMovement } from "../services/FstockMovementService.js";
import { Edit2,Trash2, Filter, Search, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generatePDF } from "../utils/pdfGenerator.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const StockMovement = () => {
  const [movements, setMovements] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilter, setShowFilter] = useState(false);

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
    const confirmDelete = window.confirm("Are you sure you want to delete this stock movement?");
    if (!confirmDelete) return;

    try {
      await deleteStockMovement(id);
      await getMovements();
      alert("Stock movement deleted successfully!");
    } catch (err) {
      console.error("Failed to delete stock movement:", err);
      alert("Failed to delete stock movement.");
    }
  };

  // Filtering logic
    const filteredMovements = movements.filter((movement) => {
    const query = searchQuery.toLowerCase();

    if (filterBy === "id") {
      return movement.stockId?.toLowerCase().includes(query);
    }
    if (filterBy === "materialId") {
      return movement.materialId?.toLowerCase().includes(query);
    }
    if (filterBy === "fromLocation") {
      return movement.fromLocation?.toLowerCase().includes(query);
    }
    if (filterBy === "toLocation") {
      return movement.toLocation?.toLowerCase().includes(query);
    }
    if(filterBy === "requestedBy") {
      return movement.requestedBy?.toLowerCase().includes(query);
    }
    if(filterBy === "approvedBy") {
      return movement.approvedBy?.toLowerCase().includes(query);
    }
    if (filterBy === "dispatchedDate") {
      return new Date(movement.createdAt).toLocaleString().toLowerCase().includes(query);
    }

    // Default: search all
    if (filterBy === "all") {
    return (
      movement.stockId?.toLowerCase().includes(query) ||
      movement.materialId?.toLowerCase().includes(query) ||
      movement.fromLocation?.toLowerCase().includes(query) ||
      movement.toLocation?.toLowerCase().includes(query) ||
      movement.requestedBy?.toLowerCase().includes(query) ||
      movement.approvedBy?.toLowerCase().includes(query) ||
      new Date(movement.createdAt).toLocaleString().toLowerCase().includes(query)
    );
    }
  });

  //pdf function
    const handleDownloadPDF = () => {
      console.log("Downloading PDF...");
  
      const columns = [
      "ID", "Material ID", "From Location", "To Location", "Unit", "Quantity", 
      "Reason", "Requested By", "Approved By", 
      "Employee ID", "Vehicle Info", "Dispatched Date", "Created At"
      ];
  
      const rows = filteredMovements.map(movement => [
        movement.stockId,
        movement.materialId,
        movement.fromLocation,
        movement.toLocation,
        movement.unit,
        movement.quantity,
        movement.reason,
        movement.requestedBy,
        movement.approvedBy,
        movement.employeeId,
        movement.vehicleInfo,
        movement.dispatchedDate,
        new Date(movement.createdAt).toLocaleString()
      ]);
  
      generatePDF(columns, rows, "Stock Movement Report");
  
    };

    const chartData = filteredMovements.reduce((acc, m) => {
      const fromKey = m.fromLocation?.trim();
      const toKey = m.toLocation?.trim();
      const qty = m.quantity || 0;

      // Count Sent (from warehouse)
      if (fromKey) {
        if (!acc[fromKey]) {
          acc[fromKey] = { inventory: fromKey, sent: 0, received: 0 };
        }
        acc[fromKey].sent += qty;
      }

      // Count Received (to warehouse)
      if (toKey) {
        if (!acc[toKey]) {
          acc[toKey] = { inventory: toKey, sent: 0, received: 0 };
        }
        acc[toKey].received += qty;
      }

      return acc;
    }, {});

    const chartArray = Object.values(chartData);

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mt-6 mb-10">Stock Movements</h1>
          <button
            className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10"
            onClick={() => navigate("/add-movement")}
          >
            + Add Stock Movement
          </button>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart barCategoryGap="5%"  data={chartArray}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="inventory" angle={-30} textAnchor="end" interval={0} height={80} tick={{ fontSize: 12 }}/>
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sent" fill="#AAB396" name="Sent" barSize={30} />
            <Bar dataKey="received" fill="#674636" name="Received" barSize={30}/>
          </BarChart>
        </ResponsiveContainer>

        {/* 🔎 Search + Filter */}
        <div className=" mt-10 mb-6 flex justify-end items-center gap-2">
          <Search className="w-5 h-5 text-gray-700" />
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-400 px-4 py-2 bg-white rounded w-7xl focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "dispatchedDate" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("dispatchedDate"); setSearchQuery(""); setShowFilter(false); }}
                  >
                    Dispatched Date
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
              <tr style={{ background: "#674636", color:"#FFFFFF" }}>
                <th className="border border-gray-300 px-4 py-2 sticky left-0 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#674636" }}>Actions</th>
                <th className="border border-gray-300 px-4 py-2 sticky left-32 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#674636" }}>Stock ID</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Material ID</th>
                <th className="border border-gray-300 px-4 py-2 w-48">From Location</th>
                <th className="border border-gray-300 px-4 py-2 w-48">To Location</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Unit</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 w-56">Reason</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Requested By</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Approved By</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Employee ID</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Vehicle Info</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Dispatched Date</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Created At</th>
              </tr>
            </thead>
            <tbody className="align-middle text-center text-xs bg-[#FFF8E8]">
              {filteredMovements.length > 0 ? (
                filteredMovements.map((movement) => (
                  <tr key={movement._id} className="bg-[#FFF8E8]">
                    {/* Actions */}
                    <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#FFF8E8" }}>
                      <div className="flex items-center justify-center gap-6">
                        <div
                          className="group relative cursor-pointer"
                          onClick={() => navigate(`/update-movement/${movement._id}`)}
                        >
                          <Edit2 className="w-5 h-5  text-[#674636] hover:text-[#A67C52]" />
                          
                        </div>

                        <div
                          className="group relative cursor-pointer"
                          onClick={() => handleDelete(movement._id)}
                        >
                          <Trash2 className="w-5 h-5  text-[#674636] hover:text-[#A67C52]" />
                          
                        </div>
                      </div>
                    </td>

                    {/* Table Data */}
                    <td className="border border-gray-300 px-4 py-2 sticky left-32 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#FFF8E8" }}>{movement.stockId}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{movement.materialId}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{movement.fromLocation}</td>
                    <td className="border border-gray-300 px-4 py-2 w-8">{movement.toLocation}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{movement.unit}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{movement.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 w-56">{movement.reason}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{movement.requestedBy}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{movement.approvedBy}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{movement.employeeId}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{movement.vehicleInfo}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{movement.dispatchedDate ? new Date(movement.dispatchedDate).toLocaleDateString() : "-"}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{new Date(movement.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="14" className="text-center p-4">No stock movements found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockMovement;
