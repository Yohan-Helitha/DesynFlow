import React, { useEffect, useState } from 'react';
import './Orders.css';
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import { FaClipboardList, FaPlus, FaBox, FaCheckCircle, FaTimesCircle, FaFileAlt, FaStar, FaHourglassHalf, FaRegClock } from 'react-icons/fa';
import { generateOrderReceiptPDF } from '../../utils/pdfGenerator';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Helper to format amounts in LKR with thousands separators and two decimals
  const formatLKR = (amount) => {
    const num = Number(amount || 0);
    return `LKR ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
  };



  // Function to mark order as received
  const markAsReceived = async (orderId) => {
    try {
      await axios.put(`http://localhost:3000/api/purchase-orders/${orderId}/status`, {
        status: 'Received'
      });
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'Received' }
            : order
        )
      );
    } catch (error) {
      console.error('Error marking order as received:', error);
  console.error('Failed to mark order as received. Please try again.');
    }
  };

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
            <h2><FaClipboardList className="header-icon" /> Purchase Orders Management</h2>
            <p className="header-subtitle">Manage and track all your purchase orders</p>
          </div>
          <div className="header-actions">
            <button className="btn-primary">
              <Link to="/OrderForm">
                <FaPlus className="icon" />
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
                        <div key={i} className="price-item">{formatLKR(item.unitPrice || item.pricePerUnit)}</div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="total-amount">
                      {formatLKR(order.items?.reduce((total, item) => 
                        total + ((item.unitPrice || item.pricePerUnit) * (item.qty || item.quantity) || 0), 0
                      ) || 0)}
                    </span>
                  </td>
                  <td>
               <span className={`status-badge ${order.status?.toLowerCase() || 'pending'}`}>
               {order.status === "Approved" ? <><FaCheckCircle /> Approved</> :
                order.status === "Preparing" ? <><FaHourglassHalf /> Preparing</> :
                order.status === "Dispatched" ? <><FaBox /> Dispatched</> :
                order.status === "Received" ? <><FaCheckCircle /> Received</> :
                order.status === "Rejected" ? <><FaTimesCircle /> Rejected</> :
                order.status || <><FaRegClock /> Sent</>}
              </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {order.status === 'Dispatched' && (
                        <button
                          className="action-btn received"
                          onClick={() => markAsReceived(order._id)}
                        >
                          <FaBox /> Mark Received
                        </button>
                      )}
                      
                      {order.status === 'Received' && (
                        <>
                          <button
                            className="action-btn pdf-btn"
                            onClick={() => generateOrderReceiptPDF(order)}
                            title="Generate PDF Receipt"
                          >
                            <FaFileAlt /> Generate PDF
                          </button>
                          <button
                            className="action-btn rate-btn"
                            onClick={() => {
                              const url = `/Rate_supplier?supplierId=${order.supplierId?._id || order.supplierId}&orderId=${order._id}&viewOnly=false`;
                              window.location.href = url;
                            }}
                            title="Rate this supplier"
                          >
                            <FaStar /> Rate Supplier
                          </button>
                        </>
                      )}
                      
                      {(order.status === 'Preparing' || order.status === 'Approved') && (
                        <button className="action-btn disabled" disabled>
                          {order.status === 'Preparing' ? <><FaHourglassHalf /> Being Prepared</> : <><FaRegClock /> Waiting Supplier</>}
                        </button>
                      )}
                      
                      {(!order.status || order.status === 'Pending') && (
                        <button className="action-btn disabled" disabled>
                          <FaRegClock /> Pending
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                    <div className="empty-state">
                    <FaClipboardList className="empty-icon" />
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
