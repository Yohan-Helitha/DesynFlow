import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Order_details_sup.css";

const API_BASE = "http://localhost:3000/api/purchase-orders"; // correct backend port

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
      console.error("Error approving order:", err);
    } finally {
      setProcessingId(null);
    }
  }

  const handleReject = async (id) => {
    try {
      setProcessingId(id);
      await axios.put(`${API_BASE}/${id}`, { status: "Rejected" });
      await fetchOrders();
    } catch (err) {
      console.error("Error rejecting order:", err);
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
          <>
            {notifications.map((o) => (
              <div className="notif-card" key={o._id}>
                <div>
                  <p><b>Order ID:</b> {o._id}</p>
                  <p><b>Supplier:</b> {o.supplierId?.companyName || o.supplierId || "Unknown"}</p>
                  <p><b>Materials:</b> {(o.items || []).map((it, i) => (
                    <span key={i}>{it.materialId}{i < o.items.length - 1 ? ", " : ""}</span>
                  ))}</p>
                  <p><b>Quantities:</b> {(o.items || []).map((it, i) => (
                    <span key={i}>{it.qty}{i < o.items.length - 1 ? ", " : ""}</span>
                  ))}</p>
                  <p><b>Status:</b> {o.status}</p>
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
            ))}
          </>
        )}
      </div>
      {/* Orders Section */}
      <main className="ods-main">
        <h2>All Orders</h2>
        {loading ? (
          <p>Loading…</p>
        ) : orders.length === 0 ? (
          <p className="muted">No orders yet</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Supplier</th>
                <th>Materials</th>
                <th>Quantities</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order._id || idx}>
                  <td>{order._id}</td>
                  <td>{order.supplierId?.companyName || order.supplierId || "Unknown"}</td>
                  <td>{(order.items || []).map((it, i) => (
                    <span key={i}>{it.materialName || it.materialId}{i < order.items.length - 1 ? ", " : ""}</span>
                  ))}</td>
                  <td>{(order.items || []).map((it, i) => (
                    <span key={i}>{it.qty}{i < order.items.length - 1 ? ", " : ""}</span>
                  ))}</td>
                  <td>
                    <span className={`status ${order.status?.toLowerCase()}`}>{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
export default OrderDetailsSup;
