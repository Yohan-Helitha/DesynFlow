import React, { useEffect, useState } from 'react';
import './Orders.css';
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Fetch purchase orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/purchase-orders"); // backend API
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };
    fetchOrders();

    // Auto-refresh every 30 seconds to catch supplier status updates
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filtered orders by supplier or material
  const filteredOrders = orders.filter(order => {
    const supplierName = (order.supplierId?.companyName || order.supplierId || "").toString().toLowerCase();
    const materialList = (order.items || [])
      .map(i => (i.materialId?.materialName || i.materialName || i.materialId || "").toString().toLowerCase())
      .join(" ");
    const term = (searchTerm || "").toLowerCase();
    return supplierName.includes(term) || materialList.includes(term);
  });

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="orders-container">
        <div className="page-header">
          <div className="header-content">
            <h2>📋 Purchase Orders Management</h2>
            <p className="header-subtitle">Manage and track all your purchase orders</p>
          </div>
          <div className="header-actions">
            <button className="btn-primary">
              <Link to="/OrderForm">
                <span className="icon">➕</span>
                New Order
              </Link>
            </button>
          </div>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by supplier, material, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

      <div className="table-container">
        <table className="orders-table" id="ordersTable">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Supplier</th>
              <th>Materials</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, idx) => (
                <tr key={order._id || idx}>
                  <td>
                    <span className="order-id">#{order._id?.slice(-8) || `ORD${idx + 1000}`}</span>
                  </td>
                  <td>
                    <div className="supplier-info">
                      <span className="company-name">{order.supplierId?.companyName || order.supplierId || "Unknown Supplier"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="materials-list">
                      {order.items?.map((item, i) => (
                        <span key={i} className="material-item">
                          {item.materialId?.materialName || item.materialName || item.materialId || "Unknown"}
                          {i < order.items.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="quantity-list">
                      {order.items?.map((item, i) => (
                        <div key={i} className="qty-item">{item.qty || item.quantity}</div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="price-list">
                      {order.items?.map((item, i) => (
                        <div key={i} className="price-item">${item.unitPrice || item.pricePerUnit}</div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="total-amount">
                      ${order.items?.reduce((total, item) => 
                        total + ((item.unitPrice || item.pricePerUnit) * (item.qty || item.quantity) || 0), 0
                      )?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${order.status?.toLowerCase() || 'pending'}`}>
                      {order.status === "Approved" ? "✅ Approved" :
                       order.status === "Preparing" ? "🔄 Preparing" :
                       order.status === "Dispatched" ? "📦 Dispatched" :
                       order.status === "Received" ? "✅ Received" :
                       order.status === "Rejected" ? "❌ Rejected" :
                       order.status || "📤 Sent"}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`action-btn ${order.status === 'Dispatched' ? 'received' : order.status === 'Received' ? 'completed' : 'disabled'}`}
                      disabled={order.status !== 'Dispatched' && order.status !== 'Received'}
                      onClick={(e) => {
                        e.preventDefault();
                        
                        const navigationState = {
                          supplierId: order.supplierId?._id || order.supplierId,
                          orderId: order._id,
                          ...(order.status === 'Received' && { viewOnly: true })
                        };
                        
                        // Force navigation using URL parameters
                        const url = `/Rate_supplier?supplierId=${navigationState.supplierId}&orderId=${navigationState.orderId}${navigationState.viewOnly ? '&viewOnly=true' : ''}`;
                        window.location.href = url;
                      }}
                    >
                      {order.status === 'Dispatched' ? '📦 Mark Received' :
                       order.status === 'Received' ? '⭐ View Rating' :
                       order.status === 'Preparing' ? '🔄 Being Prepared' :
                       order.status === 'Approved' ? '⏳ Waiting Supplier' : 
                       '⏳ Pending'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  <div className="empty-state">
                    <span className="empty-icon">📋</span>
                    <p>No orders found</p>
                    <small>Try adjusting your search criteria</small>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}

export default Orders;
