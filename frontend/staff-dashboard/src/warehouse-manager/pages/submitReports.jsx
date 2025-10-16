import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar.jsx";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2, Search, Filter } from "lucide-react";
import { fetchReports, deleteReport } from "../services/FsubmitReportsService.js"; // your API service

const SubmitReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilter, setShowFilter] = useState(false);

  // Fetch reports
  const getReports = async () => {
    try {
      const data = await fetchReports();
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  };

  useEffect(() => {
    getReports();
  }, []);

  // Delete report
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await deleteReport(id);
      setReports(reports.filter(r => r._id !== id));
      alert("Report deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete report.");
    }
  };

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
    <div>
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

        {/* Search + Filter */}
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

        {/* Reports Table */}
        <div className="overflow-x-auto text-xs">
          <table className="min-w-max border-collapse border border-gray-300">
            <thead>
              <tr style={{ background: "#674636", color:"#FFFFFF" }}>
                <th className="border border-gray-300 px-4 py-2 sticky left-0 bg-[#674636] z-40">Actions</th>
                <th className="border border-gray-300 px-4 py-2 w-64">Report Title</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Submitted By</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Created At</th>
                <th className="border border-gray-300 px-4 py-2 w-32">File</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {filteredReports.length > 0 ? filteredReports.map(r => (
                <tr key={r._id} className="bg-[#FFF8E8]">
                  <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-[#FFF8E8] z-40">
                    <div className="flex items-center justify-center gap-4">
                      <Eye className="w-5 h-5 cursor-pointer text-[#674636] hover:text-[#A67C52]" onClick={() => window.open(r.reportFileUrl, "_blank")} />
                      <Trash2 className="w-5 h-5 cursor-pointer text-[#674636] hover:text-[#A67C52]" onClick={() => handleDelete(r._id)} />
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{r.reportTitle}</td>
                  <td className="border border-gray-300 px-4 py-2">{r.submittedBy}</td>
                  <td className="border border-gray-300 px-4 py-2">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <a href={r.reportFileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      View File
                    </a>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center p-4">No reports found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubmitReports;
