import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard_sup.css";
import { Link } from "react-router-dom";

function Dashboard_sup() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [hiddenRequests, setHiddenRequests] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [supplierData, setSupplierData] = useState({
    profile: { name: "Supplier Name", email: "", rating: 0, totalOrders: 0 },
    orders: { active: 0, completed: 0, pending: 0 },
    materials: [],
    performance: { onTimeDelivery: 0, qualityScore: 0, responseTime: 0 },
    recentOrders: [],
    notifications: [],
    earnings: { thisMonth: 0, lastMonth: 0, totalEarnings: 0 }
  });
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch pending approval orders
  const fetchPendingOrders = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/purchase-orders");
      const allOrders = response.data;
      const pending = allOrders.filter(order => order.status === "Draft");
      setPendingOrders(pending);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      setPendingOrders([]);
    }
  };

  // Handle order approval
  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await axios.put(`http://localhost:3000/api/purchase-orders/${id}`, { status: "Approved" });
      
      // Add notification to localStorage
      const orderToApprove = pendingOrders.find(o => o._id === id);
      if (orderToApprove) {
        const notification = {
          id: Date.now(),
          type: "success",
          message: `Order #${orderToApprove._id?.slice(-8)} has been approved successfully!`
        };
        const notifs = JSON.parse(localStorage.getItem("dashboard_notifications") || "[]");
        notifs.push(notification);
        localStorage.setItem("dashboard_notifications", JSON.stringify(notifs));
      }
      
      // Refresh pending orders
      fetchPendingOrders();
    } catch (error) {
      console.error("Error approving order:", error);
      alert("Failed to approve order. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  // Handle order rejection
  const handleReject = async (id) => {
    try {
      setProcessingId(id);
      await axios.put(`http://localhost:3000/api/purchase-orders/${id}`, { status: "Rejected" });
      
      // Add notification to localStorage
      const orderToReject = pendingOrders.find(o => o._id === id);
      if (orderToReject) {
        const notification = {
          id: Date.now(),
          type: "info",
          message: `Order #${orderToReject._id?.slice(-8)} has been rejected.`
        };
        const notifs = JSON.parse(localStorage.getItem("dashboard_notifications") || "[]");
        notifs.push(notification);
        localStorage.setItem("dashboard_notifications", JSON.stringify(notifs));
      }
      
      // Refresh pending orders
      fetchPendingOrders();
    } catch (error) {
      console.error("Error rejecting order:", error);
      alert("Failed to reject order. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  useEffect(() => {
    const fetchSupplierDashboardData = async () => {
      setLoading(true);
      const supplierId = "123"; // This should come from authentication/session

      try {
        // Fetch sample requests
        const samplesResponse = await fetch(`http://localhost:3000/api/samples/${supplierId}`);
        const samplesData = await samplesResponse.json();
        
        if (Array.isArray(samplesData)) {
          setRequests(samplesData);
        } else if (samplesData && Array.isArray(samplesData.samples)) {
          setRequests(samplesData.samples);
        } else {
          setRequests([]);
        }

        // Fetch supplier profile and orders
        const suppliersResponse = await fetch("http://localhost:3000/api/suppliers");
        const suppliers = await suppliersResponse.json();
        const currentSupplier = suppliers.find(s => s._id === supplierId) || suppliers[0]; // Fallback to first supplier

        // Fetch purchase orders for this supplier
        const ordersResponse = await fetch("http://localhost:3000/api/purchase-orders");
        const allOrders = await ordersResponse.json();
        const supplierOrders = allOrders.filter(order => 
          order.supplierId === supplierId || order.supplier?.toString() === supplierId
        );

        // Fetch materials offered by this supplier
        const materialsResponse = await fetch(`http://localhost:3000/api/materials?supplierId=${supplierId}`);
        const materials = await materialsResponse.json();

        // Calculate order statistics
        const orderStats = {
          active: supplierOrders.filter(o => o.status === 'active' || o.status === 'processing').length,
          completed: supplierOrders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
          pending: supplierOrders.filter(o => o.status === 'pending').length
        };

        // Calculate performance metrics
        const completedOrders = supplierOrders.filter(o => o.status === 'completed');
        const performance = {
          onTimeDelivery: completedOrders.length > 0 ? 
            Math.round((completedOrders.filter(o => o.deliveredOnTime !== false).length / completedOrders.length) * 100) : 0,
          qualityScore: currentSupplier?.rating ? Math.round(currentSupplier.rating * 20) : 0,
          responseTime: Math.floor(Math.random() * 24) + 1 // Mock response time in hours
        };

        // Calculate earnings (mock data)
        const earnings = {
          thisMonth: supplierOrders.reduce((sum, o) => sum + (o.totalAmount || Math.random() * 5000), 0),
          lastMonth: Math.random() * 8000,
          totalEarnings: supplierOrders.length * 3000 + Math.random() * 50000
        };

        // Recent orders
        const recentOrders = supplierOrders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(order => ({
            id: order._id,
            date: order.createdAt,
            status: order.status,
            amount: order.totalAmount || Math.random() * 5000,
            items: order.items?.length || 1
          }));

        setSupplierData({
          profile: {
            name: currentSupplier?.name || "Supplier Name",
            email: currentSupplier?.email || "supplier@example.com",
            rating: currentSupplier?.rating || 0,
            totalOrders: supplierOrders.length
          },
          orders: orderStats,
          materials: Array.isArray(materials) ? materials.slice(0, 8) : [],
          performance,
          recentOrders,
          notifications: samplesData.slice(0, 3), // Use sample requests as notifications
          earnings
        });

      } catch (error) {
        console.error("Error fetching supplier dashboard data:", error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierDashboardData();
  }, []);

  const handleNoted = (id) => {
    // Hide from supplier’s view (not delete from DB)
    setHiddenRequests([...hiddenRequests, id]);
  };

  const visibleRequests = requests.filter(
    (req) => !hiddenRequests.includes(req._id)
  );

  return (
    <div className="supplier-dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Supplier Panel</h2>
          <button className="close-btn" onClick={toggleSidebar}>
            ×
          </button>
        </div>
        <ul className="nav">
          <li>Overview</li>
          <li><Link to="/Order_details_sup">Orders</Link></li>
          <li><Link to="/Sample_order_list">Samples</Link></li>
          <li>Profile</li>
        </ul>
      </aside>

      {/* Hamburger */}
      {!sidebarOpen && (
        <button className="hamburger" onClick={toggleSidebar}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}

      {/* Main */}
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <h1>Welcome {supplierData.profile.name}</h1>
            <div className="profile">
              <div className="profile-info">
                <span className="profile-name">{supplierData.profile.name}</span>
                <div className="profile-rating">
                  ⭐ {supplierData.profile.rating.toFixed(1)} ({supplierData.profile.totalOrders} orders)
                </div>
              </div>
              <div className="profile-avatar">
                <img src="/avatar.png" alt="profile" onError={(e) => {e.target.style.display = 'none'}} />
                <div className="avatar-fallback">{supplierData.profile.name.charAt(0)}</div>
              </div>
            </div>
          </div>
          <div className="topbar-right">
            <button className="notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
              <span className="bell-icon">🔔</span>
              {pendingOrders.length > 0 && (
                <span className="notif-count">{pendingOrders.length}</span>
              )}
              <span className="notif-text">Pending Approvals</span>
            </button>
          </div>
        </div>

        {/* Supplier Stats Overview */}
        <div className="supplier-stats">
          <div className="stats-grid">
            <div className="stat-card orders-card">
              <div className="stat-header">
                <h3>Orders</h3>
                <span className="stat-icon">📦</span>
              </div>
              <div className="stat-main">{loading ? "..." : supplierData.orders.active + supplierData.orders.completed + supplierData.orders.pending}</div>
              <div className="stat-breakdown">
                <span className="active">Active: {supplierData.orders.active}</span>
                <span className="completed">Completed: {supplierData.orders.completed}</span>
                <span className="pending">Pending: {supplierData.orders.pending}</span>
              </div>
            </div>

            <div className="stat-card earnings-card">
              <div className="stat-header">
                <h3>This Month</h3>
                <span className="stat-icon">💰</span>
              </div>
              <div className="stat-main">${loading ? "..." : supplierData.earnings.thisMonth.toLocaleString()}</div>
              <div className="stat-breakdown">
                <span className="growth">
                  {supplierData.earnings.thisMonth > supplierData.earnings.lastMonth ? "📈" : "📉"} 
                  vs Last Month
                </span>
              </div>
            </div>

            <div className="stat-card performance-card">
              <div className="stat-header">
                <h3>Performance</h3>
                <span className="stat-icon">⚡</span>
              </div>
              <div className="stat-main">{loading ? "..." : supplierData.performance.onTimeDelivery}%</div>
              <div className="stat-breakdown">
                <span className="quality">Quality: {supplierData.performance.qualityScore}%</span>
                <span className="response">Response: {supplierData.performance.responseTime}h</span>
              </div>
            </div>

            <div className="stat-card materials-card">
              <div className="stat-header">
                <h3>Materials</h3>
                <span className="stat-icon">🏗️</span>
              </div>
              <div className="stat-main">{loading ? "..." : supplierData.materials.length}</div>
              <div className="stat-breakdown">
                <span className="available">Available catalog items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="dashboard-content">
          {/* Recent Orders */}
          <div className="recent-orders">
            <h3>Recent Orders</h3>
            <div className="orders-list">
              {loading ? (
                <div className="loading">Loading orders...</div>
              ) : supplierData.recentOrders.length === 0 ? (
                <div className="no-orders">No recent orders</div>
              ) : (
                supplierData.recentOrders.map((order) => (
                  <div key={order.id} className="order-item">
                    <div className="order-info">
                      <div className="order-id">#{order.id?.slice(-6)}</div>
                      <div className="order-date">
                        {new Date(order.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="order-details">
                      <div className="order-items">{order.items} items</div>
                      <div className="order-amount">${order.amount?.toFixed(2)}</div>
                    </div>
                    <div className={`order-status ${order.status}`}>
                      {order.status}
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link to="/Order_details_sup" className="view-all-orders">View All Orders →</Link>
          </div>

          {/* Materials Catalog */}
          <div className="materials-catalog">
            <h3>Your Materials</h3>
            <div className="materials-grid">
              {loading ? (
                <div className="loading">Loading materials...</div>
              ) : supplierData.materials.length === 0 ? (
                <div className="no-materials">No materials in catalog</div>
              ) : (
                supplierData.materials.map((material, index) => (
                  <div key={material._id || index} className="material-item">
                    <div className="material-name">{material.materialName || material.name}</div>
                    <div className="material-price">${material.pricePerUnit?.toFixed(2) || 'N/A'}</div>
                    <div className="material-category">{material.category || 'General'}</div>
                  </div>
                ))
              )}
            </div>
            <Link to="/Supplier_details" className="manage-materials">Manage Materials →</Link>
          </div>
        </div>

        {/* Sample Requests */}
        <section className="sample-requests">
          <h2>Sample Order Requests</h2>
          {visibleRequests.length === 0 ? (
            <p className="empty">No new sample requests 🎉</p>
          ) : (
            <div className="requests-grid">
              {visibleRequests.map((req) => (
                <div key={req._id} className="request-card">
                  <div className="request-header">
                    <span className="request-type">Sample Request</span>
                    <span className={`request-status ${req.status}`}>{req.status}</span>
                  </div>
                  <div className="request-info">
                    <p><strong>Material ID:</strong> {req.materialId}</p>
                    <p><strong>Requested By:</strong> {req.requestedBy}</p>
                    {req.reviewNote && (
                      <p><strong>Note:</strong> {req.reviewNote}</p>
                    )}
                  </div>
                  <div className="request-actions">
                    <button className="btn-noted" onClick={() => handleNoted(req._id)}>
                      Mark as Noted
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <Link to="/Sample_order_list" className="action-card">
              <div className="action-icon">📋</div>
              <div className="action-title">Sample Orders</div>
              <div className="action-desc">Manage sample requests</div>
            </Link>
            <Link to="/Order_details_sup" className="action-card">
              <div className="action-icon">📦</div>
              <div className="action-title">Order Status</div>
              <div className="action-desc">Track order progress</div>
            </Link>
            <Link to="/Supplier_details" className="action-card">
              <div className="action-icon">🏗️</div>
              <div className="action-title">Update Catalog</div>
              <div className="action-desc">Manage materials & pricing</div>
            </Link>
            <Link to="/Rate_supplier" className="action-card">
              <div className="action-icon">⭐</div>
              <div className="action-title">Performance</div>
              <div className="action-desc">View ratings & feedback</div>
            </Link>
          </div>
        </div>
      </main>

      {/* Pending Approval Results Panel */}
      <div className={`notif-panel ${notifOpen ? "open" : ""}`}>
        <div className="panel-header">
          <h3>📋 Pending Approval Results</h3>
          <button className="close-btn" onClick={() => setNotifOpen(false)}>
            ✕
          </button>
        </div>
        <div className="panel-content">
          {pendingOrders.length === 0 ? (
            <div className="empty-notifications">
              <span className="empty-icon">✅</span>
              <p>All caught up!</p>
              <small>No new requests require your attention</small>
            </div>
          ) : (
            <div className="notifications-list">
              {pendingOrders.map((order) => (
                <div className="notification-card" key={order._id}>
                  <div className="card-header">
                    <span className="order-badge">#{order._id?.slice(-8) || 'NEW'}</span>
                    <small className="timestamp">{new Date(order.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div className="card-content">
                    <div className="info-row">
                      <span className="label">Supplier:</span>
                      <span className="value">{order.supplierId?.companyName || order.supplierId || "Unknown"}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Materials:</span>
                      <span className="value">
                        {(order.items || []).map((item, i) => (
                          <span key={i}>
                            {item.materialId?.materialName || item.materialId}
                            {i < order.items.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Total Value:</span>
                      <span className="value total">
                        LKR {(order.items || []).reduce((sum, item) => 
                          sum + ((item.unitPrice || item.pricePerUnit || 0) * (item.qty || item.quantity || 0)), 0
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="approve-btn"
                      onClick={() => handleApprove(order._id)}
                      disabled={processingId === order._id}
                    >
                      {processingId === order._id ? "⏳ Processing..." : "✅ Approve"}
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleReject(order._id)}
                      disabled={processingId === order._id}
                    >
                      {processingId === order._id ? "⏳ Processing..." : "❌ Reject"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard_sup;
