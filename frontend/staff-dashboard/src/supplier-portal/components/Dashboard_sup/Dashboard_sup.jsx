import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard_sup.css";
import { Link, useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { FaBell, FaBox, FaMoneyBillWave, FaClipboardList, FaTimes, FaCheckCircle, FaChartLine, FaStar, FaTruck } from 'react-icons/fa';
import { fetchCurrentSupplier, normalizeStatus, getMaterialName } from '../../utils/supplierUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Generate TRULY dynamic supplier chart data from real backend data
const generateSupplierChartData = (orders, materials, earnings) => {
  const now = new Date();
  const months = [];
  const monthlyEarningsData = [];
  const monthlyDeliveryPercentage = [];
  const monthlyQualityScores = [];

  // Generate last 6 months dynamically with real data
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date.toLocaleDateString('en', { month: 'short' }));

    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // Calculate real monthly earnings from completed orders
    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.orderDate || now);
      return orderDate >= monthStart && orderDate <= monthEnd && 
             (order.status === 'completed' || order.status === 'Completed');
    });

    const monthEarnings = monthOrders.reduce((sum, order) => {
      return sum + (parseFloat(order.totalAmount) || parseFloat(order.amount) || 0);
    }, 0);
    monthlyEarningsData.push(monthEarnings);

    // Calculate real delivery performance
    const completedOnTime = monthOrders.filter(order => {
      const deliveryDate = new Date(order.deliveryDate || order.completedDate || order.updatedAt || now);
      const expectedDate = new Date(order.expectedDelivery || order.dueDate || deliveryDate);
      return deliveryDate <= expectedDate;
    }).length;

    const deliveryPercentage = monthOrders.length > 0 ? (completedOnTime / monthOrders.length) * 100 : 0;
    monthlyDeliveryPercentage.push(Math.round(deliveryPercentage));

    // Calculate quality scores from actual ratings or order completion data
    const monthQualityScore = monthOrders.length > 0 ? 
      (monthOrders.filter(o => o.status === 'completed').length / monthOrders.length) * 100 : 0;
    monthlyQualityScores.push(Math.round(monthQualityScore));
  }

  // Real order fulfillment rate from actual order statuses
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'Completed').length;
  const inProgressOrders = orders.filter(o => o.status === 'in-progress' || o.status === 'processing' || o.status === 'In Progress').length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'Pending').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled' || o.status === 'rejected' || o.status === 'Cancelled').length;

  const fulfillmentData = {
    labels: ['Completed', 'In Progress', 'Pending', 'Cancelled'],
    datasets: [{
      data: [completedOrders, inProgressOrders, pendingOrders, cancelledOrders],
      backgroundColor: ['#10b981', '#fbbf24', '#3b82f6', '#ef4444'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Real material catalog performance from actual order data
  const materialOrderCounts = {};
  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const materialName = item.materialId?.materialName || item.materialType || item.name || 'Unknown Material';
        materialOrderCounts[materialName] = (materialOrderCounts[materialName] || 0) + (item.quantity || 1);
      });
    }
  });

  const topMaterialEntries = Object.entries(materialOrderCounts).sort(([,a], [,b]) => b - a).slice(0, 5);
  
  const materialPerformance = {
    labels: topMaterialEntries.length > 0 ? 
      topMaterialEntries.map(([name]) => name) : 
      materials.slice(0, 5).map(m => m.materialId?.materialName || m.name || 'Material'),
    datasets: [{
      label: 'Total Orders',
      data: topMaterialEntries.length > 0 ? 
        topMaterialEntries.map(([, count]) => count) :
        materials.slice(0, 5).map(() => 0),
      backgroundColor: 'rgba(103, 70, 54, 0.6)',
      borderColor: '#674636',
      borderWidth: 2
    }]
  };

  // Real performance metrics trend from actual delivery data
  const performanceTrend = {
    labels: months,
    datasets: [
      {
        label: 'On-Time Delivery %',
        data: monthlyDeliveryPercentage,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      },
      {
        label: 'Quality Score %',
        data: monthlyQualityScores,
        borderColor: '#674636',
        backgroundColor: 'rgba(103, 70, 54, 0.1)',
        tension: 0.4
      }
    ]
  };

  return {
    monthlyEarnings: {
      labels: months,
      datasets: [{
        label: 'Earnings (LKR)',
        data: monthlyEarningsData,
        borderColor: '#674636',
        backgroundColor: 'rgba(103, 70, 54, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    orderFulfillment: fulfillmentData,
    materialPerformance: materialPerformance,
    performanceTrend: performanceTrend
  };
};

function Dashboard_sup() {
  console.log('🏢 Dashboard_sup component loaded');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const [hiddenRequests, setHiddenRequests] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [supplierData, setSupplierData] = useState({
    profile: { name: "", email: "", rating: 0, totalOrders: 0 },
    orders: { active: 0, completed: 0, pending: 0, rejected: 0 },
    materials: [],
    materialsStats: { totalMaterials: 0, materialCategories: 0, lowStockCount: 0, topDemandMaterial: 'N/A' },
    performance: { 
      onTimeDelivery: 0, 
      qualityScore: 0, 
      responseTime: 0, 
      totalOrders: 0, 
      successRate: 0, 
      customerSatisfaction: 0 
    },
    recentOrders: [],
    notifications: [],
    earnings: { thisMonth: 0, lastMonth: 0, totalEarnings: 0, pendingEarnings: 0, growthRate: 0 },
    chartData: {
      monthlyEarnings: { labels: [], datasets: [] },
      orderFulfillment: { labels: [], datasets: [] },
      materialPerformance: { labels: [], datasets: [] },
      performanceTrend: { labels: [], datasets: [] }
    }
  });
  const [loading, setLoading] = useState(true);
  const [processingSampleId, setProcessingSampleId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Store supplierUserId in localStorage on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.id && user.role === "supplier") {
      localStorage.setItem("supplierUserId", user.id);
    }
  }, []);

  // Fetch pending approval orders
  const fetchPendingOrders = async () => {
    try {
      // Get current supplier first
      const supplier = await fetchCurrentSupplier();
      if (!supplier || !supplier._id) {
        console.error("No supplier found for current user");
        setPendingOrders([]);
        return;
      }

      const response = await axios.get("/api/purchase-orders");
      const allOrders = response.data;
      
      // Filter orders for this specific supplier only
      const supplierOrders = allOrders.filter(order => {
        const orderSupplierId = order.supplierId?._id || order.supplierId;
        return orderSupplierId && orderSupplierId.toString() === supplier._id.toString();
      });
      
      // Sort supplier's orders by creation date - newest first
      const sortedOrders = supplierOrders.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(parseInt(a._id.substring(0, 8), 16) * 1000);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(parseInt(b._id.substring(0, 8), 16) * 1000);
        return dateB - dateA; // Newest first
      });
      
      // Only show Draft status orders in pending approval
      const pending = sortedOrders.filter(order => order.status === "Draft");
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
      await axios.put(`/api/purchase-orders/${id}`, { status: "Approved" });
      
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
  console.error('Failed to approve order. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle order rejection
  const handleReject = async (id) => {
    try {
      setProcessingId(id);
      await axios.put(`/api/purchase-orders/${id}`, { status: "Rejected" });
      
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
  console.error('Failed to reject order. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle sample order approval
  const handleSampleApprove = async (sampleId) => {
    try {
      setProcessingSampleId(sampleId);
      await axios.patch(`/api/samples/${sampleId}/review`, { 
        status: "Approved",
        reviewNote: "Sample approved by supplier"
      });
      
      // Add notification to localStorage
      const sampleToApprove = requests.find(r => r._id === sampleId);
      if (sampleToApprove) {
        const notification = {
          id: Date.now(),
          type: "success",
          message: `Sample request for ${sampleToApprove.materialId?.materialName || 'material'} has been approved!`
        };
        const notifs = JSON.parse(localStorage.getItem("dashboard_notifications") || "[]");
        notifs.push(notification);
        localStorage.setItem("dashboard_notifications", JSON.stringify(notifs));
      }
      
      // Refresh requests
      fetchSupplierDashboardData();
    } catch (error) {
      console.error("Error approving sample:", error);
    } finally {
      setProcessingSampleId(null);
    }
  };

  // Handle sample order rejection with reason
  const handleSampleReject = (sampleId) => {
    setSelectedSampleId(sampleId);
    setShowRejectModal(true);
  };

  const confirmSampleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessingSampleId(selectedSampleId);
      await axios.patch(`/api/samples/${selectedSampleId}/review`, { 
        status: "Rejected",
        reviewNote: rejectReason
      });
      
      // Add notification to localStorage
      const sampleToReject = requests.find(r => r._id === selectedSampleId);
      if (sampleToReject) {
        const notification = {
          id: Date.now(),
          type: "warning",
          message: `Sample request for ${sampleToReject.materialId?.materialName || 'material'} has been rejected.`
        };
        const notifs = JSON.parse(localStorage.getItem("dashboard_notifications") || "[]");
        notifs.push(notification);
        localStorage.setItem("dashboard_notifications", JSON.stringify(notifs));
      }
      
      // Reset state and refresh
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedSampleId(null);
      fetchSupplierDashboardData();
    } catch (error) {
      console.error("Error rejecting sample:", error);
    } finally {
      setProcessingSampleId(null);
    }
  };

  useEffect(() => {
    fetchPendingOrders();

    // Auto-refresh removed - users can manually refresh if needed
  }, []);

  useEffect(() => {
    const fetchSupplierDashboardData = async () => {
      setLoading(true);

      try {
        // Ensure supplier is authenticated and available
        const supplier = await fetchCurrentSupplier();
        if (!supplier || !supplier._id) {
          navigate('/login');
          return;
        }

        // Fetch a supplier-scoped dashboard payload from the backend
        // Backend should return profile, orders, materials, earnings and requests for this supplier
        const res = await axios.get('/api/suppliers/me/dashboard');
        const payload = res.data || {};

        const orders = Array.isArray(payload.orders) ? payload.orders : [];
        const materials = Array.isArray(payload.materials) ? payload.materials : [];
        const earnings = payload.earnings || { thisMonth: 0, lastMonth: 0, totalEarnings: 0, pendingEarnings: 0, growthRate: 0 };
        const requestsData = Array.isArray(payload.requests) ? payload.requests : [];

        const chartData = generateSupplierChartData(orders, materials, earnings);

        // Map payload into supplierData shape expected by the UI
        setSupplierData(prev => ({
          ...prev,
          profile: payload.profile || { name: supplier.companyName || supplier.name || 'Supplier', email: supplier.email || '' , rating: supplier.rating || 0, totalOrders: orders.length },
          orders: payload.ordersStats || prev.orders,
          materials: materials.slice(0,8),
          materialsStats: payload.materialsStats || prev.materialsStats,
          performance: payload.performance || prev.performance,
          recentOrders: payload.recentOrders || prev.recentOrders,
          notifications: requestsData.slice(0,3),
          earnings: earnings,
          chartData
        }));

      } catch (error) {
        console.error("Error fetching supplier dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierDashboardData();

    // Auto-refresh removed - users can manually refresh if needed
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
            <FaTimes />
          </button>
        </div>

        <ul className="nav">
          <li>
            <Link to="/dashboard_sup">Dashboard</Link>
          </li>
          <li>
            <Link to="/order_details_sup">My Orders</Link>
          </li>
          <li>
            <Link to="/sample_order_list_sup">Sample Orders</Link>
          </li>
          <li>
            <span className="profile-settings-disabled">Profile Settings</span>
          </li>
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
                  ⭐ {supplierData.profile.rating?.toFixed(1) || 0} ({supplierData.profile.totalOrders} orders)
                </div>
              </div>
              <div className="profile-avatar">
                <img src="/avatar.png" alt="profile" onError={(e) => {e.target.classList.add('hidden')}} />
                <div className="avatar-fallback">{supplierData.profile.name?.charAt(0) || 'S'}</div>
              </div>
            </div>
          </div>
          <div className="topbar-right">
            <button className="notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
              <FaBell className="bell-icon" />
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
                <h3>Total Orders</h3>
                <span className="stat-icon"><FaBox /></span>
              </div>
              <div className="stat-main">
                {loading ? "..." : (supplierData.orders.active + supplierData.orders.completed + supplierData.orders.pending + supplierData.orders.rejected)}
              </div>
              <div className="stat-breakdown">
                <span className="active">Active: {supplierData.orders.active}</span>
                <span className="completed">Completed: {supplierData.orders.completed}</span>
                <span className="pending">Pending: {supplierData.orders.pending}</span>
                <span className="rejected">Rejected: {supplierData.orders.rejected}</span>
              </div>
            </div>

            <div className="stat-card earnings-card">
              <div className="stat-header">
                <h3>Monthly Revenue</h3>
                <span className="stat-icon"><FaMoneyBillWave /></span>
              </div>
              <div className="stat-main">
                LKR {loading ? "..." : (supplierData.earnings.thisMonth / 1000).toFixed(0)}K
              </div>
              <div className="stat-breakdown">
                <span className="growth">
                  {supplierData.earnings.growthRate >= 0 ? "📈" : "📉"} 
                  {Math.abs(supplierData.earnings.growthRate).toFixed(1)}% vs Last Month
                </span>
                <span className="pending">
                  Pending: LKR {(supplierData.earnings.pendingEarnings / 1000).toFixed(0)}K
                </span>
              </div>
            </div>

            <div className="stat-card performance-card">
              <div className="stat-header">
                <h3>Performance Score</h3>
                <span className="stat-icon"><FaChartLine /></span>
              </div>
              <div className="stat-main">{loading ? "..." : supplierData.performance.onTimeDelivery}%</div>
              <div className="stat-breakdown">
                <span className="quality">Quality: {supplierData.performance.qualityScore}%</span>
                <span className="response">Response: {supplierData.performance.responseTime}h avg</span>
                <span className="success">Success Rate: {supplierData.performance.successRate}%</span>
              </div>
            </div>

            <div className="stat-card materials-card">
              <div className="stat-header">
                <h3>Material Catalog</h3>
                <span className="stat-icon"><FaTruck /></span>
              </div>
              <div className="stat-main">
                {loading ? "..." : supplierData.materialsStats.totalMaterials}
              </div>
              <div className="stat-breakdown">
                <span className="categories">Categories: {supplierData.materialsStats.materialCategories}</span>
                <span className="low-stock">Low Stock: {supplierData.materialsStats.lowStockCount}</span>
                <span className="top-demand">Top: {supplierData.materialsStats.topDemandMaterial}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {!loading && supplierData.chartData && (
          <div className="charts-section">
            <div className="charts-grid">
              <div className="chart-card earnings-chart">
                <h3>Monthly Earnings Trend</h3>
                <div className="chart-container">
                  {supplierData.chartData.monthlyEarnings?.labels?.length > 0 ? (
                    <Line 
                      data={supplierData.chartData.monthlyEarnings}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'top' },
                          title: { display: true, text: 'Monthly Earnings (LKR)' }
                        }
                      }}
                    />
                  ) : (
                    <div className="chart-placeholder">Loading chart data...</div>
                  )}
                </div>
              </div>

              <div className="chart-card orders-chart">
                <h3>Order Fulfillment Distribution</h3>
                <div className="chart-container">
                  {supplierData.chartData.orderFulfillment?.labels?.length > 0 ? (
                    <Doughnut 
                      data={supplierData.chartData.orderFulfillment}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom' },
                          title: { display: true, text: 'Order Fulfillment' }
                        }
                      }}
                    />
                  ) : (
                    <div className="chart-placeholder">Loading chart data...</div>
                  )}
                </div>
              </div>

              <div className="chart-card performance-chart">
                <h3>Material Performance</h3>
                <div className="chart-container">
                  {supplierData.chartData.materialPerformance?.labels?.length > 0 ? (
                    <Bar 
                      data={supplierData.chartData.materialPerformance}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'top' },
                          title: { display: true, text: 'Top Materials by Revenue' }
                        },
                        scales: {
                          y: { beginAtZero: true }
                        }
                      }}
                    />
                  ) : (
                    <div className="chart-placeholder">Loading chart data...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Pending Approval Results Panel */}
      <div className={`notif-panel ${notifOpen ? "open" : ""}`}>
        <div className="panel-header">
          <h3><FaClipboardList /> Pending Approval Results</h3>
          <button className="close-btn" aria-label="Close notifications" onClick={() => setNotifOpen(false)}>
            <FaTimes />
          </button>
        </div>
        <div className="panel-content">
          {pendingOrders.length === 0 ? (
            <div className="empty-notifications">
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

      {/* Sample Rejection Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Reject Sample Request</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedSampleId(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
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
                  value={rejectReason === 'Other' ? '' : rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="custom-reason-textarea"
                />
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedSampleId(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm-reject"
                onClick={confirmSampleReject}
                disabled={!rejectReason.trim() || processingSampleId}
              >
                {processingSampleId ? "Processing..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard_sup;

