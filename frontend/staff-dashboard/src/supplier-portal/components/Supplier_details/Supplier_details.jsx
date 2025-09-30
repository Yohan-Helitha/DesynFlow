import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Supplier_details.css";
import { FaPlus, FaEye, FaFileAlt, FaTimes, FaBox } from 'react-icons/fa';
import { Link } from "react-router-dom";
import { generateSupplierProfilePDF } from "../../utils/pdfGenerator";


function Supplier_details() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [search, setSearch] = useState("");
  const [userRole, setUserRole] = useState("procurement"); // Default to procurement
  const [currentSupplierId, setCurrentSupplierId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Detect user role and set current supplier ID
  useEffect(() => {
    // Check if coming from supplier dashboard or if URL contains supplier context
    const isSupplierContext = location.pathname.includes('/Dashboard_sup') || 
                            window.location.search.includes('supplier=true') ||
                            localStorage.getItem('currentUserRole') === 'supplier';
    
    if (isSupplierContext) {
      setUserRole("supplier");
      // In a real app, get this from authentication
      setCurrentSupplierId(localStorage.getItem('currentSupplierId') || "123");
    }
  }, [location]);

  const loadSuppliers = () => {
    if (userRole === "supplier" && currentSupplierId) {
      // For suppliers, load only their own data
      axios
        .get(`http://localhost:4000/api/suppliers/${currentSupplierId}`)
        .then((res) => {
          setSuppliers([res.data]); // Array with single supplier
          setSelectedSupplier(res.data); // Auto-select their own profile
        })
        .catch((err) => console.error("Error fetching supplier profile:", err));
    } else {
      // For procurement officers, load all suppliers
      axios
        .get("http://localhost:4000/api/suppliers")
        .then((res) => setSuppliers(res.data))
        .catch((err) => console.error("Error fetching suppliers:", err));
    }
  };

  // Fetch suppliers from backend
  // Initial load (after role detection)
  useEffect(() => {
    if (userRole) {
      loadSuppliers();
    }
  }, [userRole, currentSupplierId]);

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
    
    // Handle new supplier added
    if (location.state?.newSupplierAdded) {
      loadSuppliers();
      // Show success message
      setTimeout(() => {
        alert(`Supplier "${location.state.supplierName}" has been added successfully!`);
      }, 500);
    }
  }, [location.state?.justRated, location.state?.newSupplierAdded]);

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

  // Helper to format amounts in LKR consistently
  const formatLKR = (amount) => {
    const num = Number(amount || 0);
    return `LKR ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
  };

  return (
    <>
      <div className="suppliers-container">
          <div className="page-header">
            <div className="header-content">
              <h2>{userRole === "supplier" ? "My Supplier Profile" : "Interior Design Suppliers"}</h2>
              <p className="header-subtitle">
                {userRole === "supplier" 
                  ? "Manage your company profile and materials catalog"
                  : "Manage your supplier network and partnerships"
                }
              </p>
            </div>
          </div>

        {userRole === "procurement" && (
          <div className="top-controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search suppliers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Link to="/procurement-officer/add_suppliers" className="btn-primary add-supplier-link">
              <FaPlus className="icon" />
              Add Supplier
            </Link>
          </div>
        )}

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
                      <div key={idx} className="material-item material-item-inline">
                        <strong>{material.name}</strong>: {formatLKR(material.pricePerUnit)}/unit
                      </div>
                    ))
                  ) : (
                    <span className="no-materials-text">
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
                  <FaEye /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="action-buttons">
        <button className="update-delete-supplier-btn">
          <Link to="/procurement-officer/update_delete_suppliers">Manage Suppliers</Link>
        </button>
      </div>
      </div>
    
    {/* Modal rendered as portal at document body level */}
    {selectedSupplier && createPortal(
      <div className="modal">
        <div className="modal-content">
          <button
            className="close-btn"
            onClick={() => setSelectedSupplier(null)}
            aria-label="Close"
          >
            <FaTimes />
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
              <div className="materials-container">
                {selectedSupplier.materials && selectedSupplier.materials.length > 0 ? (
                  selectedSupplier.materials.map((material, idx) => (
                    <div key={idx} className="material-detail-item">
                      <strong className="material-name">{material.name}</strong>
                      <span className="material-price">
                        {formatLKR(material.pricePerUnit)}/unit
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="no-materials-modal">
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
          <div className="modal-actions">
            <button 
              className="export-pdf-btn"
              onClick={() => generateSupplierProfilePDF(selectedSupplier)}
              title="Export supplier profile as PDF"
            >
              <FaFileAlt /> Export PDF
            </button>
            <button 
              className="place-order-btn"
              onClick={() => {
                navigate('/procurement-officer/order_form', {
                  state: {
                    preselectedSupplier: selectedSupplier,
                    supplierLocked: true
                  }
                });
              }}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}

export default Supplier_details;
