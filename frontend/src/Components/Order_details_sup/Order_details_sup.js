import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Order_details_sup.css";

const API_BASE = "/api/purchase-orders"; // adjust if needed

function OrderDetailsSup() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);

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
  }, []);

  const notifications = orders.filter((o) => o.status === "Draft");
  const approvedOrders = orders.filter((o) => o.status === "Approved");

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await axios.put(`${API_BASE}/${id}`, { status: "Approved" });
      await fetchOrders();
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessingId(id);
      await axios.put(`${API_BASE}/${id}`, { status: "Rejected" });
      await fetchOrders();
    } catch (err) {
      console.error("Reject failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="ods-container">
      {/* Topbar */}
      <header className="ods-topbar">
        <h1>Supplier Dashboard</h1>
        <button
          className="notif-btn"
          onClick={() => setNotifOpen((prev) => !prev)}
        >
          🔔
          {notifications.length > 0 && (
            <span className="notif-count">{notifications.length}</span>
          )}
        </button>
      </header>

      {/* Notifications drawer */}
      <div className={`notif-drawer ${notifOpen ? "open" : ""}`}>
        <div className="notif-header">
          <h3>New Order Requests</h3>
          <button className="close-btn" onClick={() => setNotifOpen(false)}>
            ×
          </button>
        </div>

        {notifications.length === 0 ? (
          <p className="muted">No new requests</p>
        ) : (
          notifications.map((o) => (
            <div className="notif-card" key={o._id}>
              <div>
                <p><b>Order ID:</b> {o._id}</p>
                <p><b>Requested By:</b> {o.requestedBy || "Procurement"}</p>
                <small>{new Date(o.createdAt).toLocaleString()}</small>
              </div>
              <div className="notif-actions">
                <button
                  className="btn-approve"
                  disabled={processingId === o._id}
                  onClick={() => handleApprove(o._id)}
                >
                  {processingId === o._id ? "..." : "Approve"}
                </button>
                <button
                  className="btn-reject"
                  disabled={processingId === o._id}
                  onClick={() => handleReject(o._id)}
                >
                  {processingId === o._id ? "..." : "Reject"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Orders Section */}
      <main className="ods-main">
        <h2>Approved Orders</h2>
        {loading ? (
          <p>Loading…</p>
        ) : approvedOrders.length === 0 ? (
          <p className="muted">No approved orders yet</p>
        ) : (
          <div className="orders-grid">
            {approvedOrders.map((o) => (
              <div className="order-card" key={o._id}>
                <h3>Order #{o._id}</h3>
                <p><b>Status:</b> {o.status}</p>
                <div className="order-items">
                  {(o.items || []).map((it, i) => (
                    <div key={i} className="order-item">
                      <span>{it.materialId}</span>
                      <span>Qty: {it.qty}</span>
                      <span>Unit: {it.unitPrice}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default OrderDetailsSup;
