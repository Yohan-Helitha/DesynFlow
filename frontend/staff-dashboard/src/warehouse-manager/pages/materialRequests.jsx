import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar.jsx";
import { Eye, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WarehouseMaterialRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilter, setShowFilter] = useState(false);

  // Fetch material requests from API
  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/material-requests"); // ✅ API should return all project leader requests
      if (response.ok) {
        const data = await response.json();
        setRequests(Array.isArray(data) ? data : []);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error("Error fetching material requests:", error);
      setRequests([]);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter logic
  const filteredRequests = requests.filter((r) => {
    const query = searchQuery.toLowerCase();
    if (filterBy === "project") return r.projectName?.toLowerCase().includes(query);
    if (filterBy === "status") return r.status?.toLowerCase().includes(query);
    if (filterBy === "date")
      return new Date(r.createdAt).toLocaleDateString().includes(query);
    if (filterBy === "all")
      return (
        r.projectName?.toLowerCase().includes(query) ||
        r.status?.toLowerCase().includes(query) ||
        new Date(r.createdAt).toLocaleDateString().includes(query)
      );
    return false;
  });

  // Status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "PartiallyApproved":
        return "bg-blue-100 text-blue-800";
      case "Fulfilled":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <h1 className="text-2xl font-bold mt-6 mb-10">Material Requests</h1>

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
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                      filterBy === "all" ? "bg-gray-200" : ""
                    }`}
                    onClick={() => {
                      setFilterBy("all");
                      setShowFilter(false);
                    }}
                  >
                    All
                  </li>
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                      filterBy === "project" ? "bg-gray-200" : ""
                    }`}
                    onClick={() => {
                      setFilterBy("project");
                      setShowFilter(false);
                    }}
                  >
                    Project Name
                  </li>
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                      filterBy === "status" ? "bg-gray-200" : ""
                    }`}
                    onClick={() => {
                      setFilterBy("status");
                      setShowFilter(false);
                    }}
                  >
                    Status
                  </li>
                  <li
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                      filterBy === "date" ? "bg-gray-200" : ""
                    }`}
                    onClick={() => {
                      setFilterBy("date");
                      setShowFilter(false);
                    }}
                  >
                    Date
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Requests Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <div
                key={req._id}
                className="bg-[#FFF8E8] border border-gray-300 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-[#674636] mb-3">
                  {req.projectName || "Unnamed Project"}
                </h3>

                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Requested By:</span>
                    <span>{req.createdByName || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Created:</span>
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Needed By:</span>
                    <span>{new Date(req.neededBy).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>

                {/* View Details Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => navigate(`/warehouse-manager/material-requests/${req._id}`)}
                    className="inline-flex items-center gap-2 bg-[#674636] hover:bg-[#A67C52] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center p-8 text-gray-500">
              <div className="bg-[#FFF8E8] border border-gray-300 rounded-lg p-8">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No material requests found
                </h3>
                <p className="text-sm">No material requests available at the moment.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
