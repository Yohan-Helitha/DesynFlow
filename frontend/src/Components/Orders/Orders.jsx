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
        <h2>📋 Purchase Orders Management</h2>
      
      <div className="top-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search by supplier or material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="place-order-btn">
          <Link to="/OrderForm">
            <span>➕</span>
            Place New Order
          </Link>
        </button>
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
                       order.status === "Rejected" ? "❌ Rejected" :
                       order.status || "📤 Sent"}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`action-btn ${order.status !== 'Approved' ? 'disabled' : 'received'}`}
                      disabled={order.status !== 'Approved'}
                      onClick={() => {
                        navigate('/Rate_supplier', {
                          state: {
                            supplierId: order.supplierId?._id || order.supplierId,
                            orderId: order._id
                          }
                        });
                      }}
                    >
                      {order.status === 'Approved' ? '📦 Mark Received' : '⏳ Pending'}
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
