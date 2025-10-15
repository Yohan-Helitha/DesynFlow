import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar.jsx";
import { Edit2, Trash2, Filter, Search, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generatePDF } from "../utils/pdfGenerator.js";
import {
  fetchWarrantyClaims,
  deleteWarrantyClaim,
} from "../services/warrantyClaimService.js";
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
    <div>
      <Navbar />
      <div className="m-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mt-6 mb-10">Warranty Claims</h1>
         
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#AAB396" name="Claims Count" barSize={40} />
          </BarChart>
        </ResponsiveContainer>

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
          <table className="min-w-max border-collapse border border-gray-300">
            <thead>
              <tr style={{ background: "#674636", color: "#FFFFFF" }}>
                <th className="border border-gray-300 px-4 py-2 sticky left-0 bg-[#674636] z-40">
                  Actions
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Warranty ID
                </th>
                <th className="border border-gray-300 px-4 py-2">Client ID</th>
                <th className="border border-gray-300 px-4 py-2">
                  Issue Description
                </th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">
                  Finance Reviewer
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Shipped Replacement
                </th>
                <th className="border border-gray-300 px-4 py-2">Shipped At</th>
                <th className="border border-gray-300 px-4 py-2">
                  Created At
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Updated At
                </th>
              </tr>
            </thead>

            <tbody className="align-middle text-center text-xs bg-[#FFF8E8]">
              {filteredClaims.length > 0 ? (
                filteredClaims.map((claim) => (
                  <tr key={claim._id}>
                    <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-[#FFF8E8] z-40">
                      <div className="flex items-center justify-center gap-6">
                        <Edit2
                          className="w-5 h-5 text-[#674636] hover:text-[#A67C52] cursor-pointer"
                          onClick={() =>
                            navigate(`/warehouse-manager/warranty-claims/update/${claim._id}`)
                          }
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{claim.warrantyId}</td>
                    <td className="border border-gray-300 px-4 py-2">{claim.clientId}</td>
                    <td className="border border-gray-300 px-4 py-2">{claim.issueDescription}</td>
                    <td className="border border-gray-300 px-4 py-2">{claim.status}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {claim.financeReviewerId || "-"}
                    </td>
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
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(claim.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center p-4">
                    No warranty claims found.
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

export default WarrantyClaims;
