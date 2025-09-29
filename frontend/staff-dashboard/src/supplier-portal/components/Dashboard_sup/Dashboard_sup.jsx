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
import { FaBell, FaBox, FaMoneyBillWave, FaClipboardList, FaTimes, FaCheckCircle, FaChartLine, FaStar, FaUserTie, FaTruck } from 'react-icons/fa';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const [hiddenRequests, setHiddenRequests] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [supplierData, setSupplierData] = useState({
    profile: { name: "", email: "", rating: 0, totalOrders: 0 },
    orders: { active: 0, completed: 0, pending: 0 },
    materials: [],
    performance: { onTimeDelivery: 0, qualityScore: 0, responseTime: 0 },
    recentOrders: [],
    notifications: [],
    earnings: { thisMonth: 0, lastMonth: 0, totalEarnings: 0 },
    chartData: {
      monthlyEarnings: { labels: [], datasets: [] },
      orderFulfillment: { labels: [], datasets: [] },
      materialPerformance: { labels: [], datasets: [] },
      performanceTrend: { labels: [], datasets: [] }
    }
  });
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch pending approval orders
  const fetchPendingOrders = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/purchase-orders");
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
      await axios.put(`http://localhost:4000/api/purchase-orders/${id}`, { status: "Approved" });
      
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
      await axios.put(`http://localhost:4000/api/purchase-orders/${id}`, { status: "Rejected" });
      
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

  useEffect(() => {
    fetchPendingOrders();

    // Set up auto-refresh every 30 seconds for real-time data
    const intervalId = setInterval(() => {
      fetchPendingOrders();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchSupplierDashboardData = async () => {
      setLoading(true);
      // Get supplier ID from authentication/session or use a dynamic method
      let supplierId = localStorage.getItem('currentSupplierId') || 
                      sessionStorage.getItem('supplierId') || 
                      new URLSearchParams(window.location.search).get('supplierId');

      // If no supplier ID is found, try to get the first available supplier for demo purposes
      if (!supplierId) {
        try {
          const suppliersResponse = await fetch("http://localhost:4000/api/suppliers");
          const suppliers = await suppliersResponse.json();
          if (suppliers && suppliers.length > 0) {
            supplierId = suppliers[0]._id;
            localStorage.setItem('currentSupplierId', supplierId);
          } else {
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error fetching suppliers:', error);
          setLoading(false);
          return;
        }
      }

      try {
        const samplesResponse = await fetch(`http://localhost:4000/api/samples/${supplierId}`);
        const samplesData = await samplesResponse.json();

        if (Array.isArray(samplesData)) setRequests(samplesData);
        else if (samplesData && Array.isArray(samplesData.samples)) setRequests(samplesData.samples);
        else setRequests([]);

        const suppliersResponse = await fetch("http://localhost:4000/api/suppliers");
        const suppliers = await suppliersResponse.json();
        const currentSupplier = suppliers.find(s => s._id === supplierId);
        if (!currentSupplier) { setLoading(false); return; }

        const ordersResponse = await fetch("http://localhost:4000/api/purchase-orders");
        const allOrders = await ordersResponse.json();
        const supplierOrders = allOrders.filter(order => 
          order.supplierId === supplierId || order.supplier?.toString() === supplierId
        );

        const materialsResponse = await fetch(`http://localhost:4000/api/materials?supplierId=${supplierId}`);
        const materials = await materialsResponse.json();

        let supplierRatings = [];
        try {
          const ratingsResponse = await fetch(`http://localhost:4000/api/supplier-ratings/${supplierId}`);
          if (ratingsResponse.ok) supplierRatings = await ratingsResponse.json();
        } catch (err) { console.log('Ratings not available:', err); }

        const orderStats = {
          active: supplierOrders.filter(o => o.status === 'active' || o.status === 'processing').length,
          completed: supplierOrders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
          pending: supplierOrders.filter(o => o.status === 'pending').length
        };

        const completedOrders = supplierOrders.filter(o => o.status === 'completed');
        const avgResponseTime = completedOrders.length > 0 ? 
          completedOrders.reduce((sum, order) => {
            const created = new Date(order.createdAt);
            const responded = new Date(order.respondedAt || order.updatedAt || created);
            const diffHours = Math.abs(responded - created) / (1000 * 60 * 60);
            return sum + (diffHours > 0 ? diffHours : 12);
          }, 0) / completedOrders.length : 12;

        const latestAverageRating = supplierRatings.length > 0 ? 
          supplierRatings.reduce((sum, rating) => sum + (rating.weightedScore || 0), 0) / supplierRatings.length : (currentSupplier?.rating || 0);

        const performance = {
          onTimeDelivery: completedOrders.length > 0 ? 
            Math.round((completedOrders.filter(o => o.deliveredOnTime !== false).length / completedOrders.length) * 100) : 0,
          qualityScore: Math.round(latestAverageRating * 20),
          responseTime: Math.round(avgResponseTime)
        };

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const thisMonthOrders = supplierOrders.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate >= thisMonthStart && (o.status === 'completed' || o.status === 'approved');
        });

        const lastMonthOrders = supplierOrders.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate >= lastMonthStart && orderDate <= lastMonthEnd && (o.status === 'completed' || o.status === 'approved');
        });

        const earnings = {
          thisMonth: thisMonthOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0),
          lastMonth: lastMonthOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0),
          totalEarnings: supplierOrders.filter(o => o.status === 'completed' || o.status === 'approved').reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0)
        };

        const recentOrders = supplierOrders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,5).map(order => ({
          id: order._id,
          date: order.createdAt,
          status: order.status,
          amount: parseFloat(order.totalAmount) || 0,
          items: order.items?.length || 1
        }));

        const chartData = generateSupplierChartData(supplierOrders, materials, earnings);

        setSupplierData({
          profile: {
            name: currentSupplier.companyName || currentSupplier.name || 'Unnamed Supplier',
            email: currentSupplier.email || currentSupplier.contactEmail || 'No email provided',
            rating: parseFloat(latestAverageRating),
            totalOrders: supplierOrders.length
          },
          orders: orderStats,
          materials: Array.isArray(materials) ? materials.slice(0,8) : [],
          performance,
          recentOrders,
          notifications: (Array.isArray(samplesData) ? samplesData : (samplesData?.samples || [])).slice(0,3),
          earnings,
          chartData
        });

      } catch (error) {
        console.error("Error fetching supplier dashboard data:", error);
        setRequests([]);
        setSupplierData(prevData => ({
          ...prevData,
          profile: { name: "Data Loading Error", email: "", rating: 0, totalOrders: 0 },
          orders: { active: 0, completed: 0, pending: 0 },
          materials: [],
          performance: { onTimeDelivery: 0, qualityScore: 0, responseTime: 0 },
          recentOrders: [],
          earnings: { thisMonth: 0, lastMonth: 0, totalEarnings: 0 },
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierDashboardData();

    // Set up auto-refresh every 30 seconds for real-time dashboard data
    const dashboardIntervalId = setInterval(() => {
      fetchSupplierDashboardData();
    }, 30000);

    return () => clearInterval(dashboardIntervalId);
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

        {/* Dashboard Toggle Section */}
        <div className="dashboard-toggle">
          <h3>View Mode</h3>
          <div className="toggle-buttons">
            <div 
              onClick={() => navigate('/procurement-officer')}
              className="toggle-btn"
              title="Procurement Officer Dashboard"
            >
              <FaUserTie />
              <span>Procurement View</span>
            </div>
            <div 
              className="toggle-btn active"
              title="Supplier Dashboard View"
            >
              <FaTruck />
              <span>Supplier View</span>
            </div>
          </div>
        </div>

        <ul className="nav">
          <li>
            <Link to="/procurement-officer/dashboard_sup">Dashboard</Link>
          </li>
          <li>
            <Link to="/procurement-officer/order_details_sup">My Orders</Link>
          </li>
          <li>
            <Link to="/procurement-officer/sample_order_list">Sample Orders</Link>
          </li>
          <li>
            <span style={{color: '#AAB3A0', cursor: 'default'}}>Profile Settings</span>
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

        {/* Floating Dashboard Toggle Button */}
        <div className="floating-toggle-btn" onClick={() => navigate('/procurement-officer')}>
          <FaUserTie className="toggle-icon" />
          <span>Switch to Procurement View</span>
        </div>

        {/* Supplier Stats Overview */}
        <div className="supplier-stats">
          <div className="stats-grid">
            <div className="stat-card orders-card">
              <div className="stat-header">
                <h3>Orders</h3>
                <span className="stat-icon">📦</span>
                <span className="stat-icon"><FaBox /></span>
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
                <span className="stat-icon"><FaMoneyBillWave /></span>
              </div>
              <div className="stat-main">LKR {loading ? "..." : (supplierData.earnings.thisMonth / 1000).toFixed(0)}K</div>
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
                <span className="stat-icon"><FaBox /></span>
              </div>
              <div className="stat-main">{loading ? "..." : supplierData.materials.length}</div>
              <div className="stat-breakdown">
                <span className="available">Available catalog items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="analytics-section">
          <h2>Business Analytics</h2>
          <div className="charts-grid">
            {/* Monthly Earnings Trend */}
            <div className="chart-container">
              <h3>Monthly Earnings Trend</h3>
              <div className="chart-wrapper">
                <Line
                  data={supplierData.chartData.monthlyEarnings}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      title: { display: false }
                    },
                    scales: {
                      y: { 
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return 'LKR ' + (value / 1000).toFixed(0) + 'K';
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Order Fulfillment Status */}
            <div className="chart-container">
              <h3>Order Fulfillment Status</h3>
              <div className="chart-wrapper">
                <Doughnut
                  data={supplierData.chartData.orderFulfillment}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' }
                    }
                  }}
                />
              </div>
            </div>

            {/* Material Performance */}
            <div className="chart-container">
              <h3>Top Material Orders</h3>
              <div className="chart-wrapper">
                <Bar
                  data={supplierData.chartData.materialPerformance}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: { beginAtZero: true }
                    }
                  }}
                />
              </div>
            </div>

            {/* Performance Metrics Trend */}
            <div className="chart-container">
              <h3>Performance Metrics</h3>
              <div className="chart-wrapper">
                <Line
                  data={supplierData.chartData.performanceTrend}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' }
                    },
                    scales: {
                      y: { beginAtZero: true, max: 100 }
                    }
                  }}
                />
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
              <div className="action-icon"><FaClipboardList /></div>
              <div className="action-title">Sample Orders</div>
              <div className="action-desc">Manage sample requests</div>
            </Link>
            <Link to="/Order_details_sup" className="action-card">
              <div className="action-icon">📦</div>
              <div className="action-icon"><FaBox /></div>
              <div className="action-title">Order Status</div>
              <div className="action-desc">Track order progress</div>
            </Link>
          </div>
        </div>
      </main>

      {/* Pending Approval Results Panel */}
      <div className={`notif-panel ${notifOpen ? "open" : ""}`}>
        <div className="panel-header">
          <h3>📋 Pending Approval Results</h3>
          <h3><FaClipboardList /> Pending Approval Results</h3>
          <button className="close-btn" onClick={() => setNotifOpen(false)}>
            ✕
            <FaTimes />
          </button>
        </div>
        <div className="panel-content">
          {pendingOrders.length === 0 ? (
            <div className="empty-notifications">
              <span className="empty-icon">✅</span>
              <FaCheckCircle className="empty-icon" />
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
