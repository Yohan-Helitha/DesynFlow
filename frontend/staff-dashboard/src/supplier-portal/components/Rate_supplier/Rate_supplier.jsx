import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Rate_supplier.css";

function RateSupplier() {
  console.log('🚀 RateSupplier component initializing...');
  
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: "",
    criteria: { timeliness: 0, quality: 0, communication: 0 }
  });
  const [userRole, setUserRole] = useState("procurement");
  const [myRatings, setMyRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    console.log('🔍 Detecting user role...');
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
  }, [location.pathname, location.search, urlOrderId]);
  
  // Emergency fallback to show form after 2 seconds
  useEffect(() => {
    const emergencyTimer = setTimeout(() => {
      if (loading) {
        console.log('⚠️ Emergency timeout: forcing form to show');
        setLoading(false);
      }
    }, 2000);
    
    return () => clearTimeout(emergencyTimer);
  }, [loading]);

  // Resolve API base (backend actually running on 4000 by default)
  const API_BASE = import.meta.env?.VITE_API_BASE || import.meta.env?.REACT_APP_API_BASE || "http://localhost:4000";

  // Fetch data based on user role
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('Loading timeout reached, showing form anyway');
      setLoading(false);
    }, 5000);
    
    if (userRole === "supplier") {
      // For suppliers, fetch ratings they've received
      const currentSupplierId = localStorage.getItem('currentSupplierId') || "123";
      fetch(`${API_BASE}/api/supplier-ratings/${currentSupplierId}`)
        .then(res => {
          clearTimeout(loadingTimeout);
          if (!res.ok) throw new Error(`Ratings fetch failed ${res.status}`);
          return res.json();
        })
        .then(data => {
          setMyRatings(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(err => {
          clearTimeout(loadingTimeout);
          console.error("Failed to fetch my ratings", err);
          setMyRatings([]);
          setLoading(false);
          // Don't set error for supplier ratings, just show empty state
        });
    } else {
      // For procurement officers, fetch suppliers to rate
      Promise.race([
        fetch(`${API_BASE}/api/suppliers`),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout')), 3000)
        )
      ])
        .then(res => {
          clearTimeout(loadingTimeout);
          if (!res.ok) throw new Error(`Supplier fetch failed ${res.status}`);
          return res.json();
        })
        .then(data => {
          setSuppliers(Array.isArray(data) ? data : []);
          // If navigated from Orders with a specific supplier, preselect and restrict
          const supplierId = location.state?.supplierId || urlSupplierId;
          if (supplierId) {
            console.log('Pre-selecting supplier:', supplierId);
            setFormData(prev => ({ ...prev, supplierId: supplierId }));
          }
          setLoading(false);
        })
        .catch(err => {
          clearTimeout(loadingTimeout);
          console.error("Failed to fetch suppliers", err);
          // Show form anyway even if suppliers API fails
          setSuppliers([]);
          setLoading(false);
          // Don't block the form, user can still rate if they have supplier ID from URL
        });
    }

    return () => clearTimeout(loadingTimeout);
  }, [API_BASE, userRole, location.state?.supplierId, urlSupplierId]);

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
      console.warn('Please select a supplier');
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
      
  console.log(`Rating submitted successfully! Order marked as received. Weighted Score: ${ws} | New Average: ${avg}`);
      
      setFormData({
        supplierId: "",
        criteria: { timeliness: 0, quality: 0, communication: 0 }
      });
      
      // Navigate back to Orders page after successful rating
      if (orderId) {
        window.location.href = "/procurement-officer/orders";
      } else {
        // Pass state so Supplier_details can force re-fetch
        navigate("/procurement-officer/supplier_details", { state: { justRated: true, ratedSupplierId: data?.rating?.supplierId || data?.rating?.supplier || data?.supplierId, weightedScore: avg ?? ws, averageRating: avg, ts: Date.now() } });
      }
    } catch (err) {
      console.error("Error submitting rating", err);
  console.error('Failed to submit rating. Check console for details.');
    }
  };

  console.log('📊 Rendering with userRole:', userRole, 'loading:', loading, 'error:', error);

  if (loading) {
    return (
      <div className="rate-supplier-container">
        <div className="loading-state">
          <p>Loading supplier data...</p>
        </div>
      </div>
    );
  }

  try {
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
          
          {/* Warning for API issues */}
          {error && (
            <div style={{background: '#ffe6e6', padding: '10px', margin: '10px 0', color: '#d00', border: '1px solid #ffcccc', borderRadius: '4px'}}>
              <strong>Warning:</strong> {error} Form is still available for manual entry.
            </div>
          )}
          
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
              {console.log('Suppliers data:', suppliers, 'Length:', suppliers.length)}
              <select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                required
                disabled={!!(location.state?.supplierId || urlSupplierId)}
                className="supplier-select"
              >
                {!(location.state?.supplierId || urlSupplierId) && <option value="">Select Supplier</option>}
                {suppliers.length === 0 && <option value="">No suppliers available</option>}
                {(location.state?.supplierId || urlSupplierId)
                  ? suppliers.filter(s => s._id === (location.state?.supplierId || urlSupplierId)).map(s => (
                      <option key={s._id} value={s._id}>{s.companyName || s.name || 'Unknown Supplier'}</option>
                    ))
                  : suppliers.map(s => (
                      <option key={s._id} value={s._id}>{s.companyName || s.name || 'Unknown Supplier'}</option>
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
                    onClick={() => navigate('/procurement-officer/orders')}
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
  } catch (renderError) {
    console.error('🚨 Render error in RateSupplier:', renderError);
    return (
      <div className="rate-supplier-container">
        <div className="error-state">
          <h2 className="page-title">Rate Supplier</h2>
          <div style={{background: '#ffe6e6', padding: '20px', margin: '10px 0', color: '#d00', border: '1px solid #ffcccc', borderRadius: '4px'}}>
            <strong>Error:</strong> There was a problem loading the form. Please refresh the page.
            <br/>
            <button onClick={() => window.location.reload()} style={{margin: '10px 0', padding: '8px 16px'}}>
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default RateSupplier;
