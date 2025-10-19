import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar.jsx";
import { Eye, Search, Filter, X } from "lucide-react";
import { fetchMaterialRequests, updateMaterialRequest } from "../services/FmaterialRequestsService.js";

export default function WarehouseMaterialRequests() {
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);

  const statuses = ["Pending", "Approved", "Rejected", "PartiallyApproved", "Fulfilled"];

  // Fetch material requests from API
  const getRequests = async () => {
    try {
      const data = await fetchMaterialRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching material requests:", error);
      setRequests([]);
    }
  };

  useEffect(() => {
    getRequests();
  }, []);

  // Filter logic
  const filteredRequests = requests.filter((req) => {
    const query = searchQuery.toLowerCase();

    if (!query) return true; // show all if search box empty

    switch (filterBy) {
      case "status":
        return req.status?.toLowerCase().includes(query);

      case "neededBy":
        return new Date(req.neededBy)
          .toLocaleDateString()
          .toLowerCase()
          .includes(query);

      case "createdAt":
        return new Date(req.createdAt)
          .toLocaleDateString()
          .toLowerCase()
          .includes(query);

      default:
        return true;
    }
  });

  // Status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Approved": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "PartiallyApproved": return "bg-blue-100 text-blue-800";
      case "Fulfilled": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getColumnColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-50 border-yellow-200";
      case "Approved": return "bg-green-50 border-green-200";
      case "Rejected": return "bg-red-50 border-red-200";
      case "PartiallyApproved": return "bg-blue-50 border-blue-200";
      case "Fulfilled": return "bg-purple-50 border-purple-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  // Helper to generate display-friendly Material Request ID
  const displayRequestId = (id) => id.slice(-6).toUpperCase();

  const handleDragStart = (e, request) => {
    setDraggedItem(request);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedItem && draggedItem.status !== newStatus) {
      try {
        await updateMaterialRequest(draggedItem._id, { status: newStatus });
        setRequests((prev) =>
          prev.map((r) =>
            r._id === draggedItem._id ? { ...r, status: newStatus } : r
          )
        );
      } catch (err) {
        alert("Failed to update status. Try again.");
      }
    }
    setDraggedItem(null);
  };

  const getRequestsByStatus = (status) => {
    return filteredRequests.filter((req) => req.status === status);
  };

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <h1 className="text-2xl font-bold mt-6 mb-6">Material Requests</h1>

        

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
                {["status", "neededBy", "createdAt"].map((f) => (
                  <li
                    key={f}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === f ? "bg-gray-200" : ""}`}
                    onClick={() => { setFilterBy(f); setShowFilter(false); }}
                  >
                    {f === "status"
                      ? "Status"
                      : f === "neededBy"
                      ? "Needed By"
                      : "Created"}
                  </li>
                ))}
              </ul>
            </div>
          )}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Request Status Board</h2>
          <div className="grid grid-cols-5 gap-4">
            {statuses.map((status) => {
              const statusRequests = getRequestsByStatus(status);
              return (
                <div
                  key={status}
                  className={`rounded-lg border-2 ${getColumnColor(status)} p-4 min-h-[200px]`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-gray-700">
                      {status === "PartiallyApproved" ? "Partially Approved" : status}
                    </h3>
                    <span className="bg-white rounded-full px-2 py-1 text-xs font-bold text-gray-600">
                      {statusRequests.length}
                    </span>
                  </div>
                  <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2 custom-scroll">
                    {statusRequests.map((req) => (
                      <div
                        key={req._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, req)}
                        className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-gray-900">
                            {displayRequestId(req._id)}
                          </p>
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="flex-shrink-0 text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {statusRequests.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">No requests</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Requests Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <div
                key={req._id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 border-b border-gray-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 mb-1 truncate">
                        {req.projectName || "Unnamed Project"}
                      </h3>
                      <p className="text-xs font-medium text-gray-500">
                        ID: {displayRequestId(req._id)}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-5 py-4">
                  <div className="space-y-3">
                    {/* Requested By */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Requested By</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {req.requestedByName || "Unknown"}
                        </p>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Created</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Needed By */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Needed By</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(req.neededBy).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Items Count */}
                    {req.items && req.items.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="font-medium">{req.items.length} item{req.items.length !== 1 ? 's' : ''} requested</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md group-hover:scale-[1.02]"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Material Requests Found</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  There are no material requests available at the moment. Check back later or adjust your filters.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col">

            {/* Content - Two Column Layout */}
            <div className="flex-1 grid grid-cols-2 gap-6 p-6 overflow-hidden">

              {/* Left Column - Request Info */}
              <div className="flex flex-col gap-4">

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Requested By</p>
                    <p className="text-gray-900 font-bold text-sm">{selectedRequest.requestedByName || "Unknown"}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <p className="text-xs font-semibold text-green-700 uppercase mb-1">Project</p>
                    <p className="text-gray-900 font-bold text-sm truncate">{selectedRequest.projectName || "N/A"}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <p className="text-xs font-semibold text-purple-700 uppercase mb-1">Created</p>
                    <p className="text-gray-900 font-bold text-sm">{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <p className="text-xs font-semibold text-orange-700 uppercase mb-1">Needed By</p>
                    <p className="text-gray-900 font-bold text-sm">{new Date(selectedRequest.neededBy).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Status Section */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Current Status</p>
                  {isEditing ? (
                    <select
                      value={editedStatus}
                      onChange={(e) => setEditedStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium"
                    >
                      {["Pending", "Approved", "Rejected", "PartiallyApproved", "Fulfilled"].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  )}
                </div>

                {/* Warehouse Note */}
                {selectedRequest.warehouseNote && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex-1">
                    <p className="text-xs font-semibold text-amber-700 uppercase mb-2">Warehouse Note</p>
                    <p className="text-gray-800 text-sm leading-relaxed">{selectedRequest.warehouseNote}</p>
                  </div>
                )}
              </div>

              {/* Right Column - Items List */}
              <div className="flex flex-col">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg">Requested Items</h3>
                  <span className="bg-white text-blue-700 rounded-full px-3 py-1 text-sm font-bold">
                    {selectedRequest.items?.length || 0} Items
                  </span>
                </div>

                <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                  <div className="bg-gray-100 px-4 py-3 grid grid-cols-12 gap-3 border-b border-gray-200 flex-shrink-0">
                    <div className="col-span-1 text-xs font-bold text-gray-700 uppercase">#</div>
                    <div className="col-span-8 text-xs font-bold text-gray-700 uppercase">Item Name</div>
                    <div className="col-span-3 text-xs font-bold text-gray-700 uppercase text-right">Quantity</div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {selectedRequest.items?.map((item, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 grid grid-cols-12 gap-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="col-span-1 text-sm text-gray-600 font-medium">{index + 1}</div>
                        <div className="col-span-8 text-sm font-semibold text-gray-900">{item.itemName}</div>
                        <div className="col-span-3 text-sm text-gray-900 text-right font-bold">{item.qty ?? 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end gap-3 border-t border-gray-200 flex-shrink-0">
              {isEditing ? (
                <>
                  <button
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedStatus(selectedRequest.status);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors shadow-sm"
                    onClick={async () => {
                      try {
                        await updateMaterialRequest(selectedRequest._id, { status: editedStatus });
                        setRequests((prev) =>
                          prev.map((r) =>
                            r._id === selectedRequest._id ? { ...r, status: editedStatus } : r
                          )
                        );
                        setSelectedRequest(null);
                        setIsEditing(false);
                        alert("Status updated successfully!");
                      } catch (err) {
                        alert("Failed to update status. Try again.");
                      }
                    }}
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                    onClick={() => setSelectedRequest(null)}
                  >
                    Close
                  </button>
                  <button
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-sm"
                    onClick={() => {
                      setEditedStatus(selectedRequest.status);
                      setIsEditing(true);
                    }}
                  >
                    Edit Status
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}