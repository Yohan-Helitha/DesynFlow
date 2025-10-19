import Navbar from "../component/navbar";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2,Filter,Search,Download } from "lucide-react";
import { fetchDisposalMaterials, deleteDisposalMaterial } from "../services/FdisposalMaterialsService.js";
import { generatePDF } from "../utils/pdfGenerator.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";


const DisposalMaterials = () => {
  const [disposals, setDisposals] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

  // Fetch all disposal records
  const getDisposals = async () => {
    try {
      const data = await fetchDisposalMaterials();
      setDisposals(data);
    } catch (err) {
      console.error("Failed to fetch disposal materials:", err);
    }
  };

  useEffect(() => {
    getDisposals();
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    try {
      await deleteDisposalMaterial(id);
      setDisposals(disposals.filter((d) => d._id !== id));
      alert("Disposal record deleted successfully!");
    } catch (err) {
      console.error("Failed to delete record:", err);
      alert("Failed to delete disposal record.");
    }
  };


  // Filtering logic
    const filteredDisposals = disposals.filter((disposal) => {
    const query = searchQuery.toLowerCase();

    if (filterBy === "id") {
      return disposal.disposalId?.toLowerCase().includes(query);
    }
    if (filterBy === "materialId") {
      return disposal.materialId?.toLowerCase().includes(query);
    }
    if (filterBy === "materialName") {
      return disposal.materialName?.toLowerCase().includes(query);
    }
    if (filterBy === "inventoryName") {
      return disposal.inventoryName?.toLowerCase().includes(query);
    }
    if (filterBy === "requestedBy") {
      return disposal.requestedBy?.toLowerCase().includes(query);
    }
    if(filterBy === "createdAt") {
      return new Date(disposal.createdAt).toLocaleString().toLowerCase().includes(query);
    }
  

    // Default: search all
    if (filterBy === "all") {
    return (
      disposal.disposalId?.toLowerCase().includes(query) ||
      disposal.materialId?.toLowerCase().includes(query) ||
      disposal.materialName?.toLowerCase().includes(query) ||
      disposal.inventoryName?.toLowerCase().includes(query) ||
      disposal.requestedBy?.toLowerCase().includes(query) || 
      new Date(disposal.createdAt).toLocaleString().toLowerCase().includes(query)
      );
    }
  });

  //pdf function
    const handleDownloadPDF = (timeFilter = 'all') => {
      console.log("Downloading PDF for:", timeFilter);

      let dataToDownload = filteredDisposals;
      
      // Filter data based on time selection
      if (timeFilter !== 'all') {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        dataToDownload = filteredDisposals.filter(disposal => {
          const disposalDate = new Date(disposal.createdAt);
          const disposalYear = disposalDate.getFullYear();
          const disposalMonth = disposalDate.getMonth() + 1;
          
          switch (timeFilter) {
            case 'thisMonth':
              return disposalYear === currentYear && disposalMonth === currentMonth;
            case 'previousMonth':
              const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
              const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
              return disposalYear === prevYear && disposalMonth === prevMonth;
            case 'thisYear':
              return disposalYear === currentYear;
            default:
              if (typeof timeFilter === 'number' && timeFilter >= 1 && timeFilter <= 12) {
                return disposalYear === currentYear && disposalMonth === timeFilter;
              }
              return true;
          }
        });
      }
  
      const columns = [
      "ID", "Material ID", "Material Name", "Inventory Name", "Quantity", "Unit", 
      "Requested By", "Reason of Disposal", "Approved By", "Created At"
      ];
  
      const rows = dataToDownload.map(disposal => [
        disposal.disposalId,
        disposal.materialId,
        disposal.materialName,
        disposal.inventoryName,
        disposal.quantity,
        disposal.unit,
        disposal.requestedBy,
        disposal.reasonOfDisposal,
        disposal.approvedBy,
        new Date(disposal.createdAt).toLocaleString()
      ]);

      const timeFilterName = timeFilter === 'all' ? 'All Records' : 
                            timeFilter === 'thisMonth' ? 'This Month' :
                            timeFilter === 'previousMonth' ? 'Previous Month' :
                            timeFilter === 'thisYear' ? 'This Year' :
                            typeof timeFilter === 'number' ? new Date(2024, timeFilter - 1).toLocaleString('default', { month: 'long' }) :
                            'Filtered';
  
      generatePDF(columns, rows, `Disposal Materials Report - ${timeFilterName}`);
      setShowDownloadDropdown(false);
    };

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const chartData = useMemo(() => {
      if (!disposals || disposals.length === 0) return [];
      const chartData = disposals.reduce((acc, disposal) => {
        const date = new Date(disposal.createdAt);
        const month = monthNames[date.getMonth()]; // get month name
        const year = date.getFullYear();
        const key = `${month}-${year}`;

        if (!acc[key]) {
          acc[key] = { monthYear: `${month} ${year}`, count: 0 };
        }
        acc[key].count += 1;
        return acc;
      }, {});
      return Object.values(chartData);
    }, [disposals]);

    const chartArray = Object.values(chartData);


  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mt-6 mb-10">Disposal Materials</h1>
          <button
            className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10"
            onClick={() => navigate("/warehouse-manager/disposal-materials/add")}
          >
            + Add Disposal
          </button>
        </div>

        {/* 📊 Bar Chart Section */}
          <div className="w-full h-80 mb-10">
            <ResponsiveContainer>
              <BarChart data={chartArray}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthYear" />
                <YAxis domain={[0, 'dataMax + 2']} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#674636" barSize={30} /> 
              </BarChart>
            </ResponsiveContainer>
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
                    Disposal ID
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
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "inventoryName" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("inventoryName"); setSearchQuery(""); setShowFilter(false); }}
                    >
                    Inventory Name
                    </li>
                    <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === "requestedBy" ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy("requestedBy"); setSearchQuery(""); setShowFilter(false); }}
                    >
                    Requested by
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
              <tr style={{ background: "#674636", color:"#FFFFFF" }}>
                <th className="border border-gray-300 px-4 py-2 sticky left-0 w-32 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#674636" }}>Actions</th>
                <th className="border border-gray-300 px-4 py-2 sticky left-32 w-32 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#674636" }}>Disposal ID</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Material ID</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Material Name</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Inventory Name</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Unit</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Requested By</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Reason</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Approved By</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Created At</th>
              </tr>
            </thead>
            <tbody className="align-middle text-center text-xs bg-[#FFF8E8]">
              {filteredDisposals.length > 0 ? (
                filteredDisposals.map((disposal) => (
                  <tr key={disposal._id} className="bg-[#FFF8E8]">
                    <td className="border border-gray-300 px-4 py-2 sticky left-0 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#FFF8E8" }}>
                      <div className="flex items-center justify-center gap-6">
                        <div
                          className="group relative cursor-pointer"
                          onClick={() => navigate(`/warehouse-manager/disposal-materials/update/${disposal._id}`)}
                        >
                          <Edit2 className="w-5 h-5 cursor-pointer text-[#674636] hover:text-[#A67C52]"  />
                          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            Update
                          </span>
                        </div>

                        <div
                          className="group relative cursor-pointer"
                          onClick={() => handleDelete(disposal._id)}
                        >
                          <Trash2 className="w-5 h-5 cursor-pointer text-[#674636] hover:text-[#A67C52]" />
                          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            Delete
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 sticky left-32 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50" style={{ background: "#FFF8E8" }}>{disposal.disposalId}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{disposal.materialId}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{disposal.materialName}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{disposal.inventoryName}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{disposal.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{disposal.unit}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{disposal.requestedBy}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{disposal.reasonOfDisposal}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{disposal.approvedBy}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">
                      {new Date(disposal.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center p-4">
                    No disposal records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DisposalMaterials;
