import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Order_details_sup.css";

const API_BASE = "http://localhost:3000/api/purchase-orders"; // correct backend port

function OrderDetailsSup() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Auto-refresh every 30 seconds to keep data current
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const notifications = orders.filter((o) => o.status?.toLowerCase() === "draft");
  const approvedOrders = orders.filter((o) => o.status?.toLowerCase() === "approved");

  // Filter orders by search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.supplierId?.companyName || order.supplierId || "").toString().toLowerCase()
      .includes((searchTerm || "").toLowerCase()) ||
      (order.items || []).some(item => 
        (item.materialId?.materialName || item.materialName || "").toString().toLowerCase()
          .includes((searchTerm || "").toLowerCase())
      );
    const matchesStatus = selectedStatus === "all" || order.status?.toLowerCase() === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await axios.put(`${API_BASE}/${id}`, { status: "Approved" });
      // Add notification to localStorage
      const notif = {
        type: "order",
        orderId: id,
        status: "Approved",
        time: new Date().toISOString(),
      };
      const notifs = JSON.parse(localStorage.getItem("dashboard_notifications") || "[]");
      notifs.push(notif);
      localStorage.setItem("dashboard_notifications", JSON.stringify(notifs));
      await fetchOrders();
    } catch (err) {
      console.error("Error approving order:", err);
    } finally {
      setProcessingId(null);
    }
  }

  const handleReject = async (id) => {
    try {
      setProcessingId(id);
      await axios.put(`${API_BASE}/${id}`, { status: "Rejected" });
      // Add notification to localStorage
      const notif = {
        type: "order",
        orderId: id,
        status: "Rejected",
        time: new Date().toISOString(),
      };
      const notifs = JSON.parse(localStorage.getItem("dashboard_notifications") || "[]");
      notifs.push(notif);
      localStorage.setItem("dashboard_notifications", JSON.stringify(notifs));
      await fetchOrders();
    } catch (err) {
      console.error("Error rejecting order:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handlePreparing = async (id) => {
    try {
      setProcessingId(id);
      await axios.put(`${API_BASE}/${id}`, { status: "Preparing" });
      // Add notification to localStorage
      const notif = {
        type: "order",
        orderId: id,
        status: "Preparing",
        time: new Date().toISOString(),
      };
      const notifs = JSON.parse(localStorage.getItem("dashboard_notifications") || "[]");
      notifs.push(notif);
      localStorage.setItem("dashboard_notifications", JSON.stringify(notifs));
      await fetchOrders();
    } catch (err) {
      console.error("Error updating order to preparing:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDispatched = async (id) => {
    try {
      setProcessingId(id);
      await axios.put(`${API_BASE}/${id}`, { status: "Dispatched" });
      // Add notification to localStorage
      const notif = {
        type: "order",
        orderId: id,
        status: "Dispatched",
        time: new Date().toISOString(),
      };
      const notifs = JSON.parse(localStorage.getItem("dashboard_notifications") || "[]");
      notifs.push(notif);
      localStorage.setItem("dashboard_notifications", JSON.stringify(notifs));
      await fetchOrders();
    } catch (err) {
      console.error("Error updating order to dispatched:", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="order-details-container">
      {/* Header Section */}
      <div className="header-section">
        <h1>Supplier Order Management</h1>
        <button className="notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
          <span className="bell-icon">🔔</span>
          {notifications.length > 0 && (
            <span className="notif-count">{notifications.length}</span>
          )}
          <span className="notif-text">Notifications</span>
        </button>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-filter">
          <input
            type="text"
            placeholder="🔍 Search orders by supplier or material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="status-filter">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="preparing">Preparing</option>
            <option value="dispatched">Dispatched</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Notifications Panel */}
      <div className={`notif-panel ${notifOpen ? "open" : ""}`}>
        <div className="panel-header">
          <h3>📋 Pending Approval Requests</h3>
          <button className="close-btn" onClick={() => setNotifOpen(false)}>
            ✕
          </button>
        </div>
        <div className="panel-content">
          {notifications.length === 0 ? (
            <div className="empty-notifications">
              <span className="empty-icon">✅</span>
              <p>All caught up!</p>
              <small>No new requests require your attention</small>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((o) => (
                <div className="notification-card" key={o._id}>
                  <div className="card-header">
                    <span className="order-badge">#{o._id?.slice(-8) || 'NEW'}</span>
                    <small className="timestamp">{new Date(o.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div className="card-content">
                    <div className="info-row">
                      <span className="label">Supplier:</span>
                      <span className="value">{o.supplierId?.companyName || o.supplierId || "Unknown"}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Materials:</span>
                      <span className="value">
                        {(o.items || []).map((it, i) => (
                          <span key={i}>
                            {it.materialId?.materialName || it.materialId}
                            {i < o.items.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Total Value:</span>
                      <span className="value total">
                        ${(o.items || []).reduce((sum, item) => 
                          sum + ((item.unitPrice || 0) * (item.qty || 0)), 0
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="approve-btn"
                      disabled={processingId === o._id}
                      onClick={() => handleApprove(o._id)}
                    >
                      {processingId === o._id ? "⏳ Processing..." : "✅ Approve"}
                    </button>
                    <button
                      className="reject-btn"
                      disabled={processingId === o._id}
                      onClick={() => handleReject(o._id)}
                    >
                      {processingId === o._id ? "⏳ Processing..." : "❌ Reject"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Orders Table */}
      <div className="orders-section">
        <div className="section-header">
          <h2>📊 Order Management Dashboard</h2>
          <div className="stats-summary">
            <span className="stat">Total: {filteredOrders.length}</span>
            <span className="stat pending">Pending: {filteredOrders.filter(o => o.status?.toLowerCase() === 'draft').length}</span>
            <span className="stat approved">Approved: {filteredOrders.filter(o => o.status?.toLowerCase() === 'approved').length}</span>
            <span className="stat preparing">Preparing: {filteredOrders.filter(o => o.status?.toLowerCase() === 'preparing').length}</span>
            <span className="stat dispatched">Dispatched: {filteredOrders.filter(o => o.status?.toLowerCase() === 'dispatched').length}</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <h3>No Orders Found</h3>
            <p>There are no orders matching your current filters.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order Details</th>
                  <th>Supplier</th>
                  <th>Items & Quantities</th>
                  <th>Total Value</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div className="order-id-cell">
                        <strong>#{order._id?.slice(-8) || 'NEW'}</strong>
                        <small>Order ID</small>
                      </div>
                    </td>
                    <td>
                      <div className="supplier-cell">
                        <strong>{order.supplierId?.companyName || order.supplierId || "Unknown"}</strong>
                        {order.supplierId?.email && <small>{order.supplierId.email}</small>}
                      </div>
                    </td>
                    <td>
                      <div className="items-cell">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="item-row">
                            <span className="material">{item.materialId?.materialName || item.materialId}</span>
                            <span className="quantity">Qty: {item.qty}</span>
                            {item.unitPrice && <span className="price">${item.unitPrice}/unit</span>}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="total-cell">
                        <strong>
                          ${(order.items || []).reduce((sum, item) => 
                            sum + ((item.unitPrice || 0) * (item.qty || 0)), 0
                          ).toFixed(2)}
                        </strong>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                        {order.status?.toLowerCase() === 'draft' && '📝 Draft'}
                        {order.status?.toLowerCase() === 'approved' && '✅ Approved'}
                        {order.status?.toLowerCase() === 'preparing' && '🔄 Preparing'}
                        {order.status?.toLowerCase() === 'dispatched' && '📦 Dispatched'}
                        {order.status?.toLowerCase() === 'rejected' && '❌ Rejected'}
                      </span>
                    </td>
                    <td>
                      <div className="date-cell">
                        <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                        <small>{new Date(order.createdAt).toLocaleTimeString()}</small>
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        {/* Approval/Rejection for Draft orders */}
                        {order.status?.toLowerCase() === 'draft' && (
                          <>
                            <button
                              className="action-btn approve-btn"
                              disabled={processingId === order._id}
                              onClick={() => handleApprove(order._id)}
                            >
                              {processingId === order._id ? "⏳" : "✅"}
                              {processingId === order._id ? "Processing" : "Approve"}
                            </button>
                            <button
                              className="action-btn reject-btn"
                              disabled={processingId === order._id}
                              onClick={() => handleReject(order._id)}
                            >
                              {processingId === order._id ? "⏳" : "❌"}
                              {processingId === order._id ? "Processing" : "Reject"}
                            </button>
                          </>
                        )}
                        
                        {/* Supplier workflow buttons for Approved orders */}
                        {order.status?.toLowerCase() === 'approved' && (
                          <button
                            className="action-btn preparing-btn"
                            disabled={processingId === order._id}
                            onClick={() => handlePreparing(order._id)}
                          >
                            {processingId === order._id ? "⏳" : "🔄"}
                            {processingId === order._id ? "Processing" : "Start Preparing"}
                          </button>
                        )}
                        
                        {order.status?.toLowerCase() === 'preparing' && (
                          <button
                            className="action-btn dispatched-btn"
                            disabled={processingId === order._id}
                            onClick={() => handleDispatched(order._id)}
                          >
                            {processingId === order._id ? "⏳" : "📦"}
                            {processingId === order._id ? "Processing" : "Mark Dispatched"}
                          </button>
                        )}
                        
                        {/* Show status for completed workflow */}
                        {(order.status?.toLowerCase() === 'dispatched' || order.status?.toLowerCase() === 'rejected') && (
                          <span className="status-info">
                            {order.status?.toLowerCase() === 'dispatched' ? '✅ Order Dispatched' : '❌ Order Rejected'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
export default OrderDetailsSup;
