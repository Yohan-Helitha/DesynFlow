import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Rate_supplier.css";

function RateSupplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: "",
    criteria: { timeliness: 0, quality: 0, communication: 0 }
  });
  const [userRole, setUserRole] = useState("procurement");
  const [myRatings, setMyRatings] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Debug: Log location state and URL params
  console.log('Rate_supplier component loaded');
  console.log('Location:', location);
  console.log('Location state:', location.state);
  
  // Get URL parameters as fallback
  const urlParams = new URLSearchParams(location.search);
  const urlSupplierId = urlParams.get('supplierId');
  const urlOrderId = urlParams.get('orderId');
  const urlViewOnly = urlParams.get('viewOnly') === 'true';
  
  console.log('URL params:', { urlSupplierId, urlOrderId, urlViewOnly });

  // Detect user role
  useEffect(() => {
    // If coming from Orders page with order ID, this is a procurement officer rating
    const isFromOrdersPage = urlOrderId || location.state?.orderId;
    
    // Only treat as supplier if explicitly from supplier dashboard AND not from orders
    const isSupplierContext = !isFromOrdersPage && (
                              location.pathname.includes('/Dashboard_sup') || 
                              window.location.search.includes('supplier=true') ||
                              localStorage.getItem('currentUserRole') === 'supplier'
                            );
    
    console.log('Role detection:', { 
      isFromOrdersPage, 
      isSupplierContext, 
      finalRole: isSupplierContext ? 'supplier' : 'procurement' 
    });
    
    if (isSupplierContext) {
      setUserRole("supplier");
    } else {
      setUserRole("procurement");
    }
  }, [location, urlOrderId]);

  // Resolve API base (backend actually running on 3000 by default)
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

  // Fetch data based on user role
  useEffect(() => {
    if (userRole === "supplier") {
      // For suppliers, fetch ratings they've received
      const currentSupplierId = localStorage.getItem('currentSupplierId') || "123";
      fetch(`${API_BASE}/api/supplier-ratings/${currentSupplierId}`)
        .then(res => {
          if (!res.ok) throw new Error(`Ratings fetch failed ${res.status}`);
          return res.json();
        })
        .then(data => {
          setMyRatings(Array.isArray(data) ? data : []);
        })
        .catch(err => {
          console.error("Failed to fetch my ratings", err);
          setMyRatings([]);
        });
    } else {
      // For procurement officers, fetch suppliers to rate
      fetch(`${API_BASE}/api/suppliers`)
        .then(res => {
          if (!res.ok) throw new Error(`Supplier fetch failed ${res.status}`);
          return res.json();
        })
        .then(data => {
          setSuppliers(data);
          // If navigated from Orders with a specific supplier, preselect and restrict
          const supplierId = location.state?.supplierId || urlSupplierId;
          if (supplierId) {
            console.log('Pre-selecting supplier:', supplierId);
            setFormData(prev => ({ ...prev, supplierId: supplierId }));
          }
        })
        .catch(err => console.error("Failed to fetch suppliers", err));
    }
  }, [API_BASE, userRole, location.state?.supplierId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["timeliness", "quality", "communication"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        criteria: { ...prev.criteria, [name]: Number(value) }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierId) {
      alert("Please select a supplier");
      return;
    }
    try {
      // Submit the rating
      let res = await fetch(`${API_BASE}/api/supplierRating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Submit failed (${res.status}): ${errText}`);
      }
      const data = await res.json();

      // If this rating is for a specific order (from Orders page), mark order as received
      const orderId = location.state?.orderId || urlOrderId;
      if (orderId) {
        try {
          console.log('Updating order status to Received for order:', orderId);
          const orderRes = await fetch(`${API_BASE}/api/purchase-orders/${orderId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Received" })
          });
          if (!orderRes.ok) {
            console.warn("Failed to update order status to Received");
          } else {
            console.log('Order status updated successfully');
          }
        } catch (orderErr) {
          console.error("Error updating order status:", orderErr);
        }
      }

      // Optional: show computed weighted score
      const ws = data?.rating?.weightedScore?.toFixed ? Number(data.rating.weightedScore.toFixed(2)) : data?.rating?.weightedScore;
      const avg = data?.averageRating?.toFixed ? Number(data.averageRating.toFixed(2)) : data?.averageRating;
      
      alert(`Rating submitted successfully! Order marked as received.\nWeighted Score: ${ws} | New Average: ${avg}`);
      
      setFormData({
        supplierId: "",
        criteria: { timeliness: 0, quality: 0, communication: 0 }
      });
      
      // Navigate back to Orders page after successful rating
      if (orderId) {
        window.location.href = "/Orders";
      } else {
        // Pass state so Supplier_details can force re-fetch
        navigate("/Supplier_details", { state: { justRated: true, ratedSupplierId: data?.rating?.supplierId || data?.rating?.supplier || data?.supplierId, weightedScore: avg ?? ws, averageRating: avg, ts: Date.now() } });
      }
    } catch (err) {
      console.error("Error submitting rating", err);
      alert("Failed to submit rating. Check console for details.");
    }
  };

  console.log('Rendering with userRole:', userRole);

  return (
    <div className="rate-supplier-container">
      {userRole === "supplier" ? (
        <>
          <h2 className="page-title">My Ratings</h2>
          <p className="page-subtitle">View ratings and feedback you've received from clients</p>
          
          <div className="ratings-display">
            {myRatings.length === 0 ? (
              <div className="no-ratings">
                <p>No ratings received yet. Complete orders to start receiving feedback!</p>
              </div>
            ) : (
              <div className="ratings-list">
                {myRatings.map((rating, index) => (
                  <div key={index} className="rating-card">
                    <div className="rating-header">
                      <h3>Rating #{index + 1}</h3>
                      <span className="rating-date">
                        {new Date(rating.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="rating-scores">
                      <div className="score-item">
                        <span>Timeliness:</span>
                        <span className="score">{rating.criteria?.timeliness || rating.timeliness || 0}/5</span>
                      </div>
                      <div className="score-item">
                        <span>Quality:</span>
                        <span className="score">{rating.criteria?.quality || rating.quality || 0}/5</span>
                      </div>
                      <div className="score-item">
                        <span>Communication:</span>
                        <span className="score">{rating.criteria?.communication || rating.communication || 0}/5</span>
                      </div>
                    </div>
                    <div className="overall-rating">
                      <strong>Overall Score: {rating.weightedScore?.toFixed(1) || 'N/A'}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {console.log('Rendering PROCUREMENT FORM - userRole is NOT supplier')}
          <h2 className="page-title">
            {(location.state?.viewOnly || urlViewOnly) ? 'Order Rating' : 'Rate Supplier'}
          </h2>
          
          {(location.state?.orderId || urlOrderId) && (
            <div className="order-context">
              <p className="order-info">
                {(location.state?.viewOnly || urlViewOnly) ? 
                  `Viewing rating for Order: ${location.state?.orderId || urlOrderId}` : 
                  `Rating supplier for Order: ${location.state?.orderId || urlOrderId}`
                }
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="rate-form">
            {/* Supplier Selection */}
            <div className="supplier-section">
              <label className="supplier-label">Supplier:</label>
              <select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                required
                disabled={!!(location.state?.supplierId || urlSupplierId)}
                className="supplier-select"
              >
                {!(location.state?.supplierId || urlSupplierId) && <option value="">Select Supplier</option>}
                {(location.state?.supplierId || urlSupplierId)
                  ? suppliers.filter(s => s._id === (location.state?.supplierId || urlSupplierId)).map(s => (
                      <option key={s._id} value={s._id}>{s.companyName}</option>
                    ))
                  : suppliers.map(s => (
                      <option key={s._id} value={s._id}>{s.companyName}</option>
                    ))}
              </select>
              {(location.state?.orderId || urlOrderId) && !(location.state?.viewOnly || urlViewOnly) && (
                <span className="order-info">Order: {location.state?.orderId || urlOrderId}</span>
              )}
            </div>

            {/* Rating Section */}
            <div className="rating-section">
              <div className="rating-item">
                <label>Timeliness:</label>
                <input
                  type="number"
                  name="timeliness"
                  value={formData.criteria.timeliness}
                  min="0"
                  max="5"
                  onChange={handleChange}
                  required
                  className="rating-input"
                />
              </div>

              <div className="rating-item">
                <label>Quality:</label>
                <input
                  type="number"
                  name="quality"
                  value={formData.criteria.quality}
                  min="0"
                  max="5"
                  onChange={handleChange}
                  required
                  className="rating-input"
                />
              </div>

              <div className="rating-item">
                <label>Communication:</label>
                <input
                  type="number"
                  name="communication"
                  value={formData.criteria.communication}
                  min="0"
                  max="5"
                  onChange={handleChange}
                  required
                  className="rating-input"
                />
              </div>

              {!(location.state?.viewOnly || urlViewOnly) && (
                <button type="submit" className="submit-btn">Submit Rating</button>
              )}
              
              {(location.state?.viewOnly || urlViewOnly) && (
                <div className="view-only-info">
                  <p>This order has already been rated and marked as received.</p>
                  <button 
                    type="button" 
                    className="back-btn" 
                    onClick={() => navigate('/Orders')}
                  >
                    Back to Orders
                  </button>
                </div>
              )}
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default RateSupplier;
