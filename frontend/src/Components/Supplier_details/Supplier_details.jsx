import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./Supplier_details.css";
import { Link } from "react-router-dom";

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
      loadSuppliers();
    }
  }, [location.state?.justRated]);

  // Search filter
  const filteredSuppliers = suppliers.filter((s) =>
    s.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
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
      <table id="supplierTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Supplier Name</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Materials</th>
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
              <td>{s.materialTypes?.join(", ")}</td>
              <td>{s.deliveryRegions?.join(", ")}</td>
              <td>{typeof s.rating === "number" ? s.rating.toFixed(2) : s.rating}</td>
              <td>
                <button
                  className="info-btn"
                  onClick={() => setSelectedSupplier(s)}
                >
                  More Info
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="add-supplier-btn">
        <Link to="/Add_suppliers">Add New Supplier</Link>
      </button>

      <button className="update-delete-supplier-btn">
        <Link to="/Update_delete_suppliers">Manage Suppliers</Link>
      </button>

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
            <p>
              <b>Contact:</b> {selectedSupplier.contactName}
            </p>
            <p>
              <b>Email:</b> {selectedSupplier.email}
            </p>
            <p>
              <b>Phone:</b> {selectedSupplier.phone}
            </p>
            <p>
              <b>Materials:</b> {selectedSupplier.materialTypes?.join(", ")}
            </p>
            <p>
              <b>Regions:</b> {selectedSupplier.deliveryRegions?.join(", ")}
            </p>
            <p>
              <b>Rating:</b> {selectedSupplier.rating}
            </p>
            <button className="place-order-btn">Place Order</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Supplier_details;
