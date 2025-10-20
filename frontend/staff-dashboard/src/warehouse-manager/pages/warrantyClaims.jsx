import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar.jsx";
import { Search, Filter, Eye, Trash2, Edit2, X } from "lucide-react";
import { fetchWarrantyClaims } from "../services/FwarrantyClaimService.js";

const WarrantyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilter, setShowFilter] = useState(false);

  // Fetch claims from backend (should return merged warranty/claim data)
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

  // Filtering logic
  const filteredClaims = claims.filter((claim) => {
    const query = searchQuery.toLowerCase();
    if (filterBy === "warrantyId") return String(claim.warrantyId?._id || "").toLowerCase().includes(query);
    if (filterBy === "materialName") return (claim.warrantyId?.itemId?.materialName || "").toLowerCase().includes(query);
    if (filterBy === "itemId") return String(claim.warrantyId?.itemId?._id || "").toLowerCase().includes(query);
    if (filterBy === "issueDescription") return (claim.issueDescription || "").toLowerCase().includes(query);
    if (filterBy === "status") return (claim.status || "").toLowerCase().includes(query);
    if (filterBy === "createdAt") return new Date(claim.createdAt).toLocaleDateString().toLowerCase().includes(query);
    if (filterBy === "updatedAt") return new Date(claim.updatedAt).toLocaleDateString().toLowerCase().includes(query);
    // default: all fields
    return (
      String(claim.warrantyId?._id || "").toLowerCase().includes(query) ||
      (claim.warrantyId?.itemId?.materialName || "").toLowerCase().includes(query) ||
      String(claim.warrantyId?.itemId?._id || "").toLowerCase().includes(query) ||
      (claim.issueDescription || "").toLowerCase().includes(query) ||
      (claim.status || "").toLowerCase().includes(query)
    );
  });

  // Action handlers
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const handleView = (claim) => {
    setSelectedClaim(claim);
    setEditData(claim);
    setShowModal(true);
    setIsEditing(false);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedClaim(null);
    setIsEditing(false);
  };
  const handleEdit = () => {
    setIsEditing(true);
    setEditData(selectedClaim);
  };
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSave = () => {
    // TODO: Replace with backend update logic
    setSelectedClaim(editData);
    setIsEditing(false);
    // Optionally update claims list
    setClaims((prevClaims) => prevClaims.map(c => c._id === editData._id ? editData : c));
    alert("Warranty claim updated successfully!");
  };
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this claim?")) {
      setClaims(claims.filter(c => c._id !== id));
      // Add backend delete logic here if needed
    }
  };

  // Handle shipping toggle
  const handleShippingToggle = async (claimId, shippedReplacement) => {
    try {
      const response = await fetch(`/api/warehouse/warranty_claims/${claimId}/shipping`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippedReplacement })
      });
      
      if (response.ok) {
        // Refresh the claims list to show updated data
        getClaims();
      } else {
        console.error('Failed to update shipping status');
        alert('Failed to update shipping status');
      }
    } catch (error) {
      console.error('Error updating shipping status:', error);
      alert('Error updating shipping status');
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 min-h-screen overflow-y-auto">
      <Navbar />
      <div className="m-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mt-6 mb-10">Warranty Claims</h1>
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
                  {["all", "warrantyId", "materialName", "itemId", "issueDescription", "status", "createdAt", "updatedAt"].map((key) => (
                    <li
                      key={key}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${filterBy === key ? "bg-gray-200" : ""}`}
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto text-xs">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr style={{ background: "#674636", color: "#FFFFFF" }}>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
                <th className="border border-gray-300 px-4 py-2">Warranty ID</th>
                <th className="border border-gray-300 px-4 py-2">Material ID</th>
                <th className="border border-gray-300 px-4 py-2">Material Name</th>
                <th className="border border-gray-300 px-4 py-2">Claim Status</th>
                <th className="border border-gray-300 px-4 py-2">Shipped Replacement</th>
                <th className="border border-gray-300 px-4 py-2">Shipped At</th>
              </tr>
            </thead>
            <tbody className="align-middle text-center text-xs bg-[#FFF8E8]">
              {filteredClaims.length > 0 ? (
                filteredClaims.map((claim) => (
                  <tr key={claim._id}>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex items-center justify-center gap-3">
                        <Eye className="w-5 h-5 cursor-pointer text-[#674636] hover:text-[#A67C52]" onClick={() => handleView(claim)} title="View Details" />
                        <Trash2 className="w-5 h-5 cursor-pointer text-[#674636] hover:text-[#A67C52]" onClick={() => handleDelete(claim._id)} title="Delete" />
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{claim.warrantyId?._id ? String(claim.warrantyId._id).slice(-8) : "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{claim.warrantyId?.itemId?._id ? String(claim.warrantyId.itemId._id).slice(-8) : "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{claim.warrantyId?.itemId?.materialName || "Unknown Material"}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        claim.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        claim.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        claim.status === 'Replaced' ? 'bg-blue-100 text-blue-800' :
                        claim.status === 'UnderReview' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button 
                        onClick={() => handleShippingToggle(claim._id, !claim.warehouseAction?.shippedReplacement)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                          claim.warehouseAction?.shippedReplacement 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {claim.warehouseAction?.shippedReplacement ? "Yes" : "No"}
                      </button>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{claim.warehouseAction?.shippedAt ? new Date(claim.warehouseAction.shippedAt).toLocaleDateString() : "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-4">
                    No warranty claims found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal for details & edit */}
        {showModal && selectedClaim && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg relative max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-amber-900" />
                  <h2 className="text-xl font-bold text-gray-900">Claim Details</h2>
                  {isEditing && <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-900 rounded text-xs font-semibold">Editing</span>}
                </div>
                <button
                  onClick={closeModal}
                  className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow transition-all border border-gray-200"
                  title="Close"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Warranty ID */}
                <div>
                  <label className="text-xs text-gray-500">Warranty ID</label>
                  <div className="font-medium text-gray-900">{selectedClaim.warrantyId}</div>
                </div>
                {/* Material ID */}
                <div>
                  <label className="text-xs text-gray-500">Material ID</label>
                  <div className="font-medium text-gray-900">{selectedClaim.itemId ? String(selectedClaim.itemId) : (selectedClaim.warranty && selectedClaim.warranty.itemId ? String(selectedClaim.warranty.itemId) : "-")}</div>
                </div>
                {/* Issue Description */}
                <div>
                  <label className="text-xs text-gray-500">Issue Description</label>
                  {isEditing ? (
                    <textarea
                      name="issueDescription"
                      value={editData.issueDescription || ""}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      rows={3}
                    />
                  ) : (
                    <div className="font-medium text-gray-900 whitespace-pre-wrap">{selectedClaim.issueDescription}</div>
                  )}
                </div>
                {/* Claim Status */}
                <div>
                  <label className="text-xs text-gray-500">Claim Status</label>
                  {isEditing ? (
                    <select
                      name="status"
                      value={editData.status || ""}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="UnderReview">UnderReview</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Replaced">Replaced</option>
                    </select>
                  ) : (
                    <div className="font-medium text-gray-900">{selectedClaim.status}</div>
                  )}
                </div>
                {/* Shipped Replacement */}
                <div>
                  <label className="text-xs text-gray-500">Shipped Replacement</label>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      name="shippedReplacement"
                      checked={editData.warehouseAction?.shippedReplacement || false}
                      onChange={e => {
                        setEditData(prev => ({
                          ...prev,
                          warehouseAction: {
                            ...prev.warehouseAction,
                            shippedReplacement: e.target.checked
                          }
                        }));
                      }}
                      className="mr-2"
                    />
                  ) : (
                    <div className="font-medium text-gray-900">{selectedClaim.warehouseAction?.shippedReplacement ? "Yes" : "No"}</div>
                  )}
                </div>
                {/* Shipped At */}
                <div>
                  <label className="text-xs text-gray-500">Shipped At</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="shippedAt"
                      value={editData.warehouseAction?.shippedAt ? new Date(editData.warehouseAction.shippedAt).toISOString().split('T')[0] : ""}
                      onChange={e => {
                        setEditData(prev => ({
                          ...prev,
                          warehouseAction: {
                            ...prev.warehouseAction,
                            shippedAt: e.target.value ? new Date(e.target.value) : null
                          }
                        }));
                      }}
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                    />
                  ) : (
                    <div className="font-medium text-gray-900">{selectedClaim.warehouseAction?.shippedAt ? new Date(selectedClaim.warehouseAction.shippedAt).toLocaleDateString() : "-"}</div>
                  )}
                </div>
                {/* Created At */}
                <div>
                  <label className="text-xs text-gray-500">Created At</label>
                  <div className="font-medium text-gray-900">{new Date(selectedClaim.createdAt).toLocaleDateString()}</div>
                </div>
                {/* Updated At */}
                <div>
                  <label className="text-xs text-gray-500">Updated At</label>
                  <div className="font-medium text-gray-900">{new Date(selectedClaim.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>
              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <button
                      className="px-4 py-2 bg-amber-900 hover:bg-amber-800 text-white rounded-lg font-medium text-sm"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                    <button
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="px-4 py-2 bg-amber-900 hover:bg-amber-800 text-white rounded-lg font-medium text-sm flex items-center gap-1.5"
                      onClick={handleEdit}
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50"
                      onClick={closeModal}
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarrantyClaims;
