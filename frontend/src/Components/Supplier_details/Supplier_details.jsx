import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./Supplier_details.css";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";

// Removed unused legacy URL & fetchHandler

function Supplier_details() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [search, setSearch] = useState("");
  const location = useLocation();

  const loadSuppliers = () => {
    axios
      .get("http://localhost:3000/api/suppliers")
      .then((res) => setSuppliers(res.data))
      .catch((err) => console.error("Error fetching suppliers:", err));
  };

  // Fetch suppliers from backend
  // Initial load
  useEffect(() => {
    loadSuppliers();
  }, []);

  // Re-fetch after a rating submission (navigated with state)
  useEffect(() => {
    if (location.state?.justRated) {
      // Optimistically update while fetching fresh data
      setSuppliers(prev => {
        if (!location.state?.ratedSupplierId) return prev;
        return prev.map(s => s._id === location.state.ratedSupplierId ? { ...s, rating: location.state.averageRating ?? location.state.weightedScore ?? s.rating } : s);
      });
      loadSuppliers();
    }
  }, [location.state?.justRated]);

  // After suppliers fetched, ensure latest rating from navigation state is applied if still present
  useEffect(() => {
    if (location.state?.justRated && location.state?.ratedSupplierId && (location.state?.averageRating || location.state?.weightedScore)) {
      setSuppliers(prev => prev.map(s => s._id === location.state.ratedSupplierId ? { ...s, rating: location.state.averageRating ?? location.state.weightedScore } : s));
    }
  }, [suppliers, location.state]);

  // Search filter
  const filteredSuppliers = suppliers.filter((s) =>
    s.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="suppliers-container">
        <h2>Interior Design Suppliers</h2>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder=" Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-container">
        <table id="supplierTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Supplier Name</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Materials & Pricing</th>
            <th>Regions</th>
            <th>Rating</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredSuppliers.map((s, index) => (
            <tr key={s._id}>
              <td>SUP-00{index + 1}</td>
              <td>{s.companyName}</td>
              <td>{s.contactName}</td>
              <td>{s.email}</td>
              <td>{s.phone}</td>
              <td>
                <div className="materials-cell">
                  {s.materials && s.materials.length > 0 ? (
                    s.materials.map((material, idx) => (
                      <div key={idx} className="material-item" style={{ 
                        fontSize: "12px", 
                        marginBottom: "2px",
                        padding: "2px 6px",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "3px",
                        display: "inline-block",
                        marginRight: "4px",
                        marginBottom: "4px"
                      }}>
                        <strong>{material.name}</strong>: ${material.pricePerUnit}/unit
                      </div>
                    ))
                  ) : (
                    <span style={{ color: "#999" }}>
                      {s.materialTypes?.join(", ") || "No materials"}
                    </span>
                  )}
                </div>
              </td>
              <td>{s.deliveryRegions?.join(", ")}</td>
              <td>{typeof s.rating === "number" ? s.rating.toFixed(2) : s.rating}</td>
              <td>
                <button
                  className="info-btn"
                  onClick={() => setSelectedSupplier(s)}
                >
                  👁 View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="action-buttons">
        <button className="add-supplier-btn">
          <Link to="/Add_suppliers">Add New Supplier</Link>
        </button>

        <button className="update-delete-supplier-btn">
          <Link to="/Update_delete_suppliers">Manage Suppliers</Link>
        </button>
      </div>

      {/* Modal */}
      {selectedSupplier && (
        <div className="modal">
          <div className="modal-content">
            <button
              className="close-btn"
              onClick={() => setSelectedSupplier(null)}
              aria-label="Close"
            >
              ×
            </button>
            <h3>{selectedSupplier.companyName}</h3>
            <div className="info-grid">
              <p>
                <b>Contact:</b> {selectedSupplier.contactName}
              </p>
              <p>
                <b>Email:</b> {selectedSupplier.email}
              </p>
              <p>
                <b>Phone:</b> {selectedSupplier.phone}
              </p>
              <div>
                <b>Materials & Pricing:</b>
                <div style={{ marginTop: "8px" }}>
                  {selectedSupplier.materials && selectedSupplier.materials.length > 0 ? (
                    selectedSupplier.materials.map((material, idx) => (
                      <div key={idx} style={{ 
                        padding: "8px 12px", 
                        margin: "4px 0", 
                        backgroundColor: "#f8f9fa", 
                        borderLeft: "4px solid #674636",
                        borderRadius: "4px"
                      }}>
                        <strong style={{ color: "#674636" }}>{material.name}</strong>
                        <span style={{ float: "right", color: "#28a745", fontWeight: "bold" }}>
                          ${material.pricePerUnit}/unit
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: "#666", fontStyle: "italic" }}>
                      {selectedSupplier.materialTypes?.join(", ") || "No materials listed"}
                    </div>
                  )}
                </div>
              </div>
              <p>
                <b>Regions:</b> {selectedSupplier.deliveryRegions?.join(", ")}
              </p>
              <p>
                <b>Rating:</b> {selectedSupplier.rating}
              </p>
            </div>
            <button className="place-order-btn">Place Order</button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Supplier_details;
