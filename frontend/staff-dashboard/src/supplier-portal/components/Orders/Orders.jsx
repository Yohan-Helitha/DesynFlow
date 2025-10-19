import React, { useEffect, useState } from 'react';
import './Orders.css';
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from 'sonner';
import { FaClipboardList, FaPlus, FaBox, FaCheckCircle, FaTimesCircle, FaFileAlt, FaStar, FaHourglassHalf, FaRegClock } from 'react-icons/fa';
import { generateOrderReceiptPDF } from '../../utils/pdfGenerator';

function Orders() {
  console.log("Orders component is rendering...");
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to format amounts in LKR with thousands separators and two decimals
  const formatLKR = (amount) => {
    const num = Number(amount || 0);
    return `LKR ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
  };



  // Function to mark order as received
  const markAsReceived = async (orderId) => {
    try {
      console.log('Marking order as received:', orderId);
      
      // Use the new endpoint that handles both order and reorder request updates
      const response = await axios.put(`/api/purchase-orders/${orderId}/mark-received`);
      console.log('API response:', response.data);

      // Send notification to warehouse manager via supplier notifications API
      try {
        await axios.post('/api/supplier-notifications', {
          type: 'order_update',
          purchaseOrderId: orderId,
          message: 'Order marked as Received by Procurement. Stock has been restocked.',
          status: 'New'
        });
      } catch (notifyErr) {
        console.warn('Notification to warehouse manager failed (non-blocking):', notifyErr?.response?.data || notifyErr.message);
      }
      
      // Update local state and maintain sorting order
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'Received' }
            : order
        );
        
        // Re-sort to maintain newest-first order
        return updatedOrders.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(parseInt(a._id.substring(0, 8), 16) * 1000);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(parseInt(b._id.substring(0, 8), 16) * 1000);
          return dateB - dateA; // Newest first
        });
      });
      
      // Show appropriate success message based on response
      const message = response.data?.updatedReorderRequest 
        ? `Order marked as received. Reorder request ${response.data.updatedReorderRequest} updated to Restocked.`
        : 'Order marked as received.';
      toast.success(message);
    } catch (error) {
      console.error('Error marking order as received:', error);
      console.error('Error details:', error.response?.data);
      toast.error(`Failed to mark order as received: ${error.response?.data?.error || error.message}`);
    }
  };

  // Fetch purchase orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching orders from API...");
        const res = await fetch("/api/purchase-orders"); // backend API
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Orders fetched successfully:", data);
        if (data.length > 0) {
          console.log("First order items:", data[0].items);
          console.log("Sample item:", data[0].items?.[0]);
        }
        
        // Sort orders by creation date - newest first
        const sortedOrders = data.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(parseInt(a._id.substring(0, 8), 16) * 1000);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(parseInt(b._id.substring(0, 8), 16) * 1000);
          return dateB - dateA; // Newest first
        });
        
        setOrders(sortedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    // Auto-refresh removed - users can manually refresh if needed
  }, []);

  // Handle successful order creation navigation
  useEffect(() => {
    if (location.state?.newOrderCreated) {
      // Success message removed - order list will be refreshed to show the new order
      
      // Refresh orders to include the new order
      const fetchOrders = async () => {
        try {
          setLoading(true);
          setError(null);
          console.log("Fetching orders from API...");
          const res = await fetch("/api/purchase-orders");
          
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          
          const data = await res.json();
          console.log("Orders fetched successfully:", data);
          
          // Sort orders by creation date - newest first
          const sortedOrders = data.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(parseInt(a._id.substring(0, 8), 16) * 1000);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(parseInt(b._id.substring(0, 8), 16) * 1000);
            return dateB - dateA; // Newest first
          });
          
          setOrders(sortedOrders);
        } catch (err) {
          console.error("Error fetching orders:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [location.state?.newOrderCreated]);

  // Filtered and sorted orders by supplier or material - newest first
  const filteredOrders = orders.filter(order => {
    const supplierName = (order.supplierId?.companyName || order.supplierId || "").toString().toLowerCase();
    const materialList = (order.items || [])
      .map(i => (i.materialId?.materialName || i.materialName || i.materialId || "").toString().toLowerCase())
      .join(" ");
    const term = (searchTerm || "").toLowerCase();
    return supplierName.includes(term) || materialList.includes(term);
  }).sort((a, b) => {
    // Ensure filtered results maintain newest-first order
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(parseInt(a._id.substring(0, 8), 16) * 1000);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(parseInt(b._id.substring(0, 8), 16) * 1000);
    return dateB - dateA; // Newest first
  });

  // Show loading state
  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading-state">
          <h2>Loading orders...</h2>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="orders-container">
        <div className="error-state">
          <h2>Error loading orders</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        {/* Modern Header */}
        <div className="orders-header">
          <div className="header-content">
            <div className="title-section">
              <h1 className="page-title">
                <FaClipboardList className="title-icon" />
                Purchase Orders
              </h1>
              <p className="page-description">Manage and track your purchase orders</p>
            </div>
            <div className="header-controls">
              <div className="search-box">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Link to="/procurement-officer/order_form" className="create-order-btn">
                <FaPlus className="btn-icon" />
                Create Order
              </Link>
            </div>
          </div>
        </div>

        {/* Orders Table Section */}
        <div className="table-section">
          <div className="table-wrapper">
            <div className="table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th className="col-order-id">Order ID</th>
                    <th className="col-supplier">Supplier</th>
                    <th className="col-materials">Materials</th>
                    <th className="col-quantity">Quantity</th>
                    <th className="col-unit">Unit</th>
                    <th className="col-price">Unit Price</th>
                    <th className="col-total">Total Amount</th>
                    <th className="col-status">Status</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, idx) => (
                      <tr key={order._id || idx} className="table-row">
                        <td className="col-order-id">
                          <div className="order-id-wrapper">
                            <span className="order-id">#{order._id?.slice(-8) || `ORD${idx + 1000}`}</span>
                          </div>
                        </td>
                        <td className="col-supplier">
                          <div className="supplier-info">
                            <span className="supplier-name">{order.supplierId?.companyName || order.supplierId || "Unknown Supplier"}</span>
                          </div>
                        </td>
                        <td className="col-materials">
                          <div className="materials-wrapper">
                            {order.items?.map((item, i) => (
                              <span key={i} className="material-tag">
                                {item.materialId?.materialName || item.materialName || item.materialId || "Unknown"}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="col-quantity">
                          <div className="quantity-wrapper">
                            {order.items?.map((item, i) => (
                              <div key={i} className="quantity-item">{item.qty || item.quantity}</div>
                            ))}
                          </div>
                        </td>
                        <td className="col-unit">
                          <div className="unit-wrapper">
                            {order.items?.map((item, i) => (
                              <div key={i} className="unit-item">{item.unit || 'N/A'}</div>
                            ))}
                          </div>
                        </td>
                        <td className="col-price">
                          <div className="price-wrapper">
                            {order.items?.map((item, i) => (
                              <div key={i} className="price-item">{formatLKR(item.unitPrice || item.pricePerUnit)}</div>
                            ))}
                          </div>
                        </td>
                        <td className="col-total">
                          <div className="total-wrapper">
                            <span className="total-amount">
                              {formatLKR(order.items?.reduce((total, item) => 
                                total + ((item.unitPrice || item.pricePerUnit) * (item.qty || item.quantity) || 0), 0
                              ) || 0)}
                            </span>
                          </div>
                        </td>
                        <td className="col-status">
                          <div className="status-wrapper">
                            <span className={`status-badge status-${order.status?.toLowerCase() || 'pending'}`}>
                              <span className="status-text">
                                {order.status === "Approved" ? "Approved" :
                                 order.status === "Preparing" ? "Preparing" :
                                 order.status === "Dispatched" ? "Dispatched" :
                                 order.status === "Received" ? "Completed" :
                                 order.status === "Rejected" ? "Rejected" :
                                 order.status || "Pending"}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="col-actions">
                          <div className="actions-wrapper">
                            {order.status === 'Dispatched' && (
                              <button
                                className="action-btn btn-receive"
                                onClick={() => markAsReceived(order._id)}
                                title="Mark as Received"
                              >
                                <FaCheckCircle className="btn-icon" />
                                <span>Mark Received</span>
                              </button>
                            )}
                            
                            {order.status === 'Received' && (
                              <div className="action-group">
                                <button
                                  className="action-btn btn-pdf"
                                  onClick={() => generateOrderReceiptPDF(order)}
                                  title="Generate PDF Receipt"
                                >
                                  <FaFileAlt className="btn-icon" />
                                  <span>PDF</span>
                                </button>
                                <button
                                  className="action-btn btn-rate"
                                  onClick={() => {
                                    const url = `/procurement-officer/rate_supplier?supplierId=${order.supplierId?._id || order.supplierId}&orderId=${order._id}&viewOnly=false`;
                                    window.location.href = url;
                                  }}
                                  title="Rate Supplier"
                                >
                                  <FaStar className="btn-icon" />
                                  <span>Rate</span>
                                </button>
                              </div>
                            )}
                            
                            {(order.status === 'Preparing' || order.status === 'Approved') && (
                              <span className="status-indicator">
                                <FaHourglassHalf className="status-icon" />
                                <span>{order.status === 'Preparing' ? 'In Progress' : 'Waiting'}</span>
                              </span>
                            )}
                            
                            {(!order.status || order.status === 'Pending') && (
                              <span className="status-indicator">
                                <FaRegClock className="status-icon" />
                                <span>Pending</span>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="empty-row">
                        <div className="empty-state">
                          <FaClipboardList className="empty-icon" />
                          <div className="empty-content">
                            <h3>No orders found</h3>
                            <p>Try adjusting your search criteria or create a new order</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orders;

