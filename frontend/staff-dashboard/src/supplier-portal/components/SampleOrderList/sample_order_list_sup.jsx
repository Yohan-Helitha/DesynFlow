import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaTimes, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaClock, FaCheck, FaBan, FaBox, FaClipboardList, FaDollarSign, FaRuler, FaCalendarAlt, FaTruck, FaHourglassHalf, FaMapMarkerAlt, FaBuilding } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./sample_order_list_sup.css";
import "../Dashboard_sup/Dashboard_sup.css";

function SampleOrderListSup() {
  const [sampleOrders, setSampleOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [processingId, setProcessingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Toggle sidebar function
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch all sample orders for the supplier
  const fetchSampleOrders = async () => {
    try {
      setLoading(true);
      
      // Get logged-in user's email from localStorage (same as other components)
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      console.log("Logged in user:", user);
      
      if (!user.email) {
        console.error("User email not found in localStorage");
        alert("Error: User email not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Fetch all suppliers and find the one matching the logged-in user's email
      const suppliersResponse = await axios.get("/api/suppliers");
      const suppliers = suppliersResponse.data;
      console.log("All suppliers:", suppliers);

      // Find supplier by email (same logic as other components)
      const supplier = suppliers.find(s => s.email === user.email);
      console.log("Matched supplier:", supplier);

      if (!supplier) {
        console.error("No supplier found matching user email:", user.email);
        console.log("Available supplier emails:", suppliers.map(s => s.email));
        
        // For now, show all samples if no specific supplier is found (like Dashboard_sup does)
        console.log("Showing all samples since no specific supplier found");
        const allSamplesResponse = await axios.get("/api/samples/all");
        setSampleOrders(allSamplesResponse.data);
        setLoading(false);
        return;
      }

      console.log("Fetching samples for supplier ID:", supplier._id);

      // Fetch sample orders for this supplier
      const response = await axios.get(`/api/samples/${supplier._id}`);
      console.log("Sample orders response:", response.data);

      // Show ALL sample orders (Requested, Approved, Rejected, Dispatched)
      setSampleOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching sample orders:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert(`Failed to load sample orders: ${error.response?.data?.error || error.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSampleOrders();
  }, []);

  // Handle approve
  const handleApprove = async (orderId) => {
    try {
      setProcessingId(orderId);
      await axios.patch(`/api/samples/${orderId}/review`, { 
        status: "Approved",
        reviewNote: "Sample approved by supplier"
      });
      
      // Refresh the list
      await fetchSampleOrders();
      
      // Show success notification
      alert("Sample request approved successfully!");
    } catch (error) {
      console.error("Error approving sample:", error);
      alert("Failed to approve sample. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  // Handle mark as dispatched
  const handleDispatch = async (orderId) => {
    try {
      setProcessingId(orderId);
      await axios.patch(`/api/samples/${orderId}/review`, { 
        status: "Dispatched",
        reviewNote: "Sample dispatched by supplier"
      });
      
      // Refresh the list
      await fetchSampleOrders();
      
      // Show success notification
      alert("Sample marked as dispatched successfully!");
    } catch (error) {
      console.error("Error dispatching sample:", error);
      alert("Failed to mark as dispatched. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  // Handle reject
  const handleReject = (orderId) => {
    setSelectedOrderId(orderId);
    setShowRejectModal(true);
  };

  // Confirm rejection with reason
  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessingId(selectedOrderId);
      await axios.patch(`/api/samples/${selectedOrderId}/review`, { 
        status: "Rejected",
        reviewNote: rejectReason
      });
      
      // Refresh the list
      await fetchSampleOrders();
      
      // Reset modal state
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedOrderId(null);
      
      // Show success notification
      alert("Sample request rejected successfully!");
    } catch (error) {
      console.error("Error rejecting sample:", error);
      alert("Failed to reject sample. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  // Handle view details for rejected orders
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  // Close reject modal
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedOrderId(null);
  };

  // Filter orders based on selected status
  const filteredOrders = filterStatus === "All" 
    ? sampleOrders 
    : sampleOrders.filter(order => order.status === filterStatus);

  return (
    <>
      {/* Hamburger */}
      {!sidebarOpen && (
        <button className="hamburger" onClick={toggleSidebar}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}
      
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Supplier Panel</h2>
          <button className="close-btn" onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>

        <ul className="nav">
          <li>
            <Link to="/procurement-officer/dashboard_sup">Dashboard</Link>
          </li>
          <li>
            <Link to="/procurement-officer/order_details_sup">My Orders</Link>
          </li>
          <li>
            <Link to="/procurement-officer/sample_order_list_sup" className="active">Sample Orders</Link>
          </li>
          <li>
            <span className="profile-settings-disabled">Profile Settings</span>
          </li>
        </ul>
      </aside>
      
      <div className="sample-order-list-container">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Sample Orders</h1>
          <p className="page-subtitle">Manage and view all sample requests</p>
        </div>
        
        <div className="filter-controls">
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select 
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter-select"
          >
            <option value="All">All Orders</option>
            <option value="Requested">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading sample orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <FaInfoCircle className="empty-icon" />
          <h3>No Sample Orders Found</h3>
          <p>
            {filterStatus === "All" 
              ? "You don't have any sample orders yet."
              : `No ${filterStatus.toLowerCase()} sample orders found.`}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="sample-orders-table">
            <thead>
              <tr>
                <th>Material Name</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Review Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="table-row">
                  <td>
                    <div className="material-info">
                      <span className="material-name">
                        {order.materialId?.materialName || order.materialId?.name || "Unknown Material"}
                      </span>
                      {order.materialId?.category && (
                        <span className="material-category">{order.materialId.category}</span>
                      )}
                    </div>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</td>
                  <td>
                    <span className={`status-badge-list ${order.status.toLowerCase()}`}>
                      {order.status === "Approved" && <><FaCheckCircle /> Approved</>}
                      {order.status === "Dispatched" && <><FaCheckCircle /> Dispatched</>}
                      {order.status === "Rejected" && <><FaTimesCircle /> Rejected</>}
                      {order.status === "Requested" && <><FaClock /> Pending</>}
                    </span>
                  </td>
                  <td>
                    {order.reviewedAt 
                      ? new Date(order.reviewedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : "-"}
                  </td>
                  <td>
                    <div className="action-cell">
                      {order.status === "Requested" && (
                        <>
                          <button 
                            className="btn-approve"
                            onClick={() => handleApprove(order._id)}
                            disabled={processingId === order._id}
                          >
                            <FaCheck /> {processingId === order._id ? "Processing..." : "Approve"}
                          </button>
                          <button 
                            className="btn-reject"
                            onClick={() => handleReject(order._id)}
                            disabled={processingId === order._id}
                          >
                            <FaBan /> {processingId === order._id ? "Processing..." : "Reject"}
                          </button>
                        </>
                      )}
                      {order.status === "Approved" && (
                        <button 
                          className="btn-dispatch"
                          onClick={() => handleDispatch(order._id)}
                          disabled={processingId === order._id}
                        >
                          <FaCheck /> {processingId === order._id ? "Processing..." : "Dispatch"}
                        </button>
                      )}
                      {order.status === "Dispatched" && (
                        <span className="status-completed">
                          <FaCheckCircle /> Completed
                        </span>
                      )}
                      {order.status === "Rejected" && (
                        <button 
                          className="btn-view"
                          onClick={() => handleViewDetails(order)}
                          title="View rejection details"
                        >
                          <FaEye /> View
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sample Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay-details" onClick={closeModal}>
          <div className="modal-content-details" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-details">
              <h2>
                <FaInfoCircle className="modal-icon-info" />
                Sample Order Details
              </h2>
              <button className="modal-close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body-details">
              {/* Main Details Section */}
              <div className="details-grid-top">
                <div className="detail-item-main">
                  <div className="detail-icon"><FaClipboardList /></div>
                  <div className="detail-content">
                    <label>Sample Request ID</label>
                    <span className="detail-value">{selectedOrder._id?.slice(-8) || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="detail-item-main">
                  <div className="detail-icon"><FaInfoCircle /></div>
                  <div className="detail-content">
                    <label>Status</label>
                    <span className="detail-value status-display">
                      {selectedOrder.status === "Approved" && <><FaCheckCircle /> Approved</>}
                      {selectedOrder.status === "Dispatched" && <><FaTruck /> Dispatched</>}
                      {selectedOrder.status === "Rejected" && <><FaTimesCircle /> Rejected</>}
                      {selectedOrder.status === "Requested" && <><FaHourglassHalf /> Pending</>}
                    </span>
                  </div>
                </div>
                
                <div className="detail-item-main">
                  <div className="detail-icon"><FaRuler /></div>
                  <div className="detail-content">
                    <label>Quantity</label>
                    <span className="detail-value">{selectedOrder.quantity || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="detail-item-main">
                  <div className="detail-icon"><FaCalendarAlt /></div>
                  <div className="detail-content">
                    <label>Created Date</label>
                    <span className="detail-value">
                      {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Material Information Section */}
              <div className="client-info-section">
                <h3>
                  <FaBox className="section-icon" />
                  Material Information
                </h3>
                <div className="info-grid">
                  <div className="info-row">
                    <label>Material Name</label>
                    <span>{selectedOrder.materialId?.materialName || selectedOrder.materialId?.name || "Unknown Material"}</span>
                  </div>
                  <div className="info-row">
                    <label>Category</label>
                    <span>{selectedOrder.materialId?.category || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Review Information Section */}
              <div className="property-details-section">
                <h3>
                  <FaInfoCircle className="section-icon" />
                  Review Details
                </h3>
                <div className="property-grid">
                  <div className="property-row">
                    <div className="property-item">
                      <div className="property-icon"><FaMapMarkerAlt /></div>
                      <div className="property-content">
                        <label>Review Date</label>
                        <span>{selectedOrder.reviewedAt 
                          ? new Date(selectedOrder.reviewedAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric'
                            })
                          : "Not reviewed yet"}</span>
                      </div>
                    </div>
                    <div className="property-item">
                      <div className="property-icon"><FaBuilding /></div>
                      <div className="property-content">
                        <label>Review Note</label>
                        <span>{selectedOrder.reviewNote || "No notes available"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-details">
              <button className="btn-close-modal" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay-reject" onClick={closeRejectModal}>
          <div className="modal-content-reject" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-reject">
              <h2>
                <FaBan className="modal-icon-reject" />
                Reject Sample Request
              </h2>
              <button className="modal-close-btn" onClick={closeRejectModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body-reject">
              <label htmlFor="rejectReason">Reason for rejection:</label>
              <select 
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="reject-reason-select"
              >
                <option value="">Select a reason...</option>
                <option value="Material not available">Material not available</option>
                <option value="Quality specifications cannot be met">Quality specifications cannot be met</option>
                <option value="Insufficient sample quantity">Insufficient sample quantity</option>
                <option value="Delivery timeline too tight">Delivery timeline too tight</option>
                <option value="Cost considerations">Cost considerations</option>
                <option value="Technical specifications unclear">Technical specifications unclear</option>
                <option value="Currently at capacity">Currently at capacity</option>
                <option value="Other">Other</option>
              </select>
              {rejectReason === 'Other' && (
                <textarea 
                  placeholder="Please specify the reason..."
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="custom-reason-textarea"
                />
              )}
            </div>

            <div className="modal-footer-reject">
              <button className="btn-cancel" onClick={closeRejectModal}>
                Cancel
              </button>
              <button 
                className="btn-confirm-reject"
                onClick={confirmReject}
                disabled={!rejectReason.trim() || processingId}
              >
                {processingId ? "Processing..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default SampleOrderListSup;

