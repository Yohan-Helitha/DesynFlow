import React, { useState, useEffect } from "react";
import "./Dashboard_proc.css";
import { Link, useNavigate } from "react-router-dom";
import NotificationsProc from "../Notifications_proc/Notifications_proc";
import { FaBell, FaUserFriends, FaBox, FaMoneyBillWave, FaTrophy, FaStar, FaUser, FaTruck, FaExchangeAlt } from 'react-icons/fa';
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
import { Line, Bar } from 'react-chartjs-2';

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

// Generate TRULY dynamic chart data from real backend data
const generateChartData = (orders, suppliers, topSuppliers) => {
  // Current date for dynamic calculations
  const now = new Date();
  const months = [];
  const monthlyOrderCounts = [];
  const monthlyBudgetSpent = [];

  // Generate last 6 months dynamically
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date.toLocaleDateString('en', { month: 'short' }));
    
    // Count actual orders for this month
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.orderDate || now);
      return orderDate >= monthStart && orderDate <= monthEnd;
    });
    
    monthlyOrderCounts.push(monthOrders.length);
    
    // Calculate actual budget spent for this month from real orders
    const monthBudget = monthOrders.reduce((sum, order) => {
      return sum + (parseFloat(order.totalAmount) || parseFloat(order.amount) || 0);
    }, 0);
    monthlyBudgetSpent.push(monthBudget);
  }

  // Real order status distribution from actual data
  const pendingCount = orders.filter(o => o.status === 'pending' || o.status === 'Pending').length;
  const approvedCount = orders.filter(o => o.approvalStatus === 'approved' || o.status === 'approved').length;
  const completedCount = orders.filter(o => o.status === 'completed' || o.status === 'Completed').length;
  const rejectedCount = orders.filter(o => o.approvalStatus === 'rejected' || o.status === 'rejected').length;

  const orderStatusData = {
    labels: ['Pending', 'Approved', 'Completed', 'Rejected'],
    datasets: [{
      data: [pendingCount, approvedCount, completedCount, rejectedCount],
      backgroundColor: ['#fbbf24', '#10b981', '#674636', '#ef4444'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Real supplier performance from actual ratings
  const supplierPerformanceData = {
    labels: topSuppliers.slice(0, 5).map(s => s.name || s.companyName || `Supplier ${s._id?.slice(-4) || ''}`),
    datasets: [{
      label: 'Average Rating',
      data: topSuppliers.slice(0, 5).map(s => parseFloat(s.averageRating || 0).toFixed(1)),
      backgroundColor: 'rgba(103, 70, 54, 0.6)',
      borderColor: '#674636',
      borderWidth: 2
    }]
  };

  // Real budget trends from actual order amounts
  const budgetTrendsData = {
    labels: months,
    datasets: [{
      label: 'Budget Spent (LKR)',
      data: monthlyBudgetSpent,
      borderColor: '#674636',
      backgroundColor: 'rgba(103, 70, 54, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  // Real material demand from actual orders
  const materialCounts = {};
  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const materialType = item.materialType || item.material || item.name || 'Other';
        materialCounts[materialType] = (materialCounts[materialType] || 0) + (item.quantity || 1);
      });
    } else if (order.materialType) {
      materialCounts[order.materialType] = (materialCounts[order.materialType] || 0) + 1;
    }
  });

  const materialEntries = Object.entries(materialCounts);
  const topMaterials = materialEntries.sort(([,a], [,b]) => b - a).slice(0, 6);

  const materialDemandData = {
    labels: topMaterials.map(([material]) => material),
    datasets: [{
      label: 'Quantity Ordered',
      data: topMaterials.map(([, count]) => count),
      backgroundColor: [
        'rgba(103, 70, 54, 0.8)',
        'rgba(139, 69, 19, 0.8)',
        'rgba(160, 82, 45, 0.8)',
        'rgba(210, 180, 140, 0.8)',
        'rgba(222, 184, 135, 0.8)',
        'rgba(205, 133, 63, 0.8)'
      ]
    }]
  };

  return {
    monthlyOrders: {
      labels: months,
      datasets: [{
        label: 'Orders',
        data: monthlyOrderCounts,
        borderColor: '#674636',
        backgroundColor: 'rgba(103, 70, 54, 0.1)',
        tension: 0.4
      }]
    },
    supplierPerformance: supplierPerformanceData,
    budgetTrends: budgetTrendsData,
    orderStatusDistribution: orderStatusData,
    materialDemand: materialDemandData
  };
};

function Dashboard_proc() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    suppliers: { total: 0, active: 0, pending: 0 },
    orders: { total: 0, pending: 0, completed: 0, approved: 0, rejected: 0 },
    budget: { totalRequests: 0, pendingApproval: 0, approvedThisMonth: 0, totalValue: 0, avgOrderValue: 0 },
    recentActivities: [],
    topSuppliers: [],
    systemMetrics: { orderVolume: 0, avgDeliveryTime: 0, supplierSatisfaction: 0 },
    chartData: {
      monthlyOrders: { labels: [], datasets: [] },
      supplierPerformance: { labels: [], datasets: [] },
      budgetTrends: { labels: [], datasets: [] },
      orderStatusDistribution: { labels: [], datasets: [] },
      materialDemand: { labels: [], datasets: [] }
    }
  });
  const [loading, setLoading] = useState(true);

  const toggleNotifications = () => setPanelOpen(!panelOpen);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch suppliers data
        const suppliersResponse = await fetch("http://localhost:4000/api/suppliers");
        const suppliers = await suppliersResponse.json();

        // Fetch orders data
        const ordersResponse = await fetch("http://localhost:4000/api/dashboard/orders");
        const orders = await ordersResponse.json();

        // Fetch top rated suppliers
        console.log('Fetching top suppliers...');
        const topSuppliersResponse = await fetch("http://localhost:4000/api/supplier-ratings/top");
        const topSuppliers = await topSuppliersResponse.json();
        console.log('Top suppliers fetched:', topSuppliers);

        // Process supplier statistics
        const supplierStats = {
          total: suppliers.length,
          active: suppliers.filter(s => s.status === 'active').length,
          pending: suppliers.filter(s => s.status === 'pending').length
        };

        // Process order statistics
        const orderStats = {
          total: orders.length,
          pending: orders.filter(o => o.status === 'pending').length,
          completed: orders.filter(o => o.status === 'completed').length,
          approved: orders.filter(o => o.approvalStatus === 'approved').length,
          rejected: orders.filter(o => o.approvalStatus === 'rejected').length
        };

        // Calculate budget statistics
        const totalBudgetValue = orders.reduce((sum, order) => {
          return sum + (order.totalAmount || order.totalPrice || 0);
        }, 0);
        const avgOrderValue = orders.length > 0 ? totalBudgetValue / orders.length : 0;

        // Fetch recent activities from backend
        let recentActivities = [];
        try {
          const activitiesResponse = await fetch('http://localhost:4000/api/dashboard/recent-activities');
          if (activitiesResponse.ok) {
            recentActivities = await activitiesResponse.json();
          } else {
            console.error('Failed to fetch recent activities');
            // Fallback to generated activities if API fails
            recentActivities = [
              ...suppliers.slice(-3).map(s => ({
                type: 'supplier',
                message: `New supplier "${s.name}" registered`,
                timestamp: s.createdAt || new Date(),
                icon: 'supplier'
              })),
              ...orders.slice(-3).map(o => ({
                type: 'order',
                message: `Order #${o._id?.slice(-6)} ${o.status}`,
                timestamp: o.updatedAt || new Date(),
                icon: 'order'
              }))
            ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
          }
        } catch (error) {
          console.error('Error fetching recent activities:', error);
          // Fallback to generated activities if API fails
          recentActivities = [
            ...suppliers.slice(-3).map(s => ({
              type: 'supplier',
              message: `New supplier "${s.name}" registered`,
              timestamp: s.createdAt || new Date(),
              icon: 'supplier'
            })),
            ...orders.slice(-3).map(o => ({
              type: 'order',
              message: `Order #${o._id?.slice(-6)} ${o.status}`,
              timestamp: o.updatedAt || new Date(),
              icon: 'order'
            }))
          ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
        }

        // Calculate system metrics
        const completedOrders = orders.filter(o => o.status === 'completed');
        const systemMetrics = {
          orderVolume: orders.length,
          avgDeliveryTime: completedOrders.length > 0 ? 
            Math.round(completedOrders.reduce((acc, o) => acc + (o.estimatedDeliveryDays || 7), 0) / completedOrders.length) : 0,
          supplierSatisfaction: topSuppliers.length > 0 ? 
            Math.round(topSuppliers.reduce((acc, s) => acc + (s.averageRating || 0), 0) / topSuppliers.length * 20) : 0
        };

        // Generate chart data
        const chartData = generateChartData(orders, suppliers, topSuppliers);

        setDashboardData({
          suppliers: supplierStats,
          orders: orderStats,
          budget: { 
            totalRequests: orders.length, 
            pendingApproval: orderStats.pending, 
            approvedThisMonth: orderStats.approved,
            totalValue: totalBudgetValue,
            avgOrderValue: avgOrderValue
          },
          recentActivities,
          topSuppliers: topSuppliers.slice(0, 5),
          systemMetrics,
          chartData
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up auto-refresh every 30 seconds for real-time data
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Check notification count from localStorage
  useEffect(() => {
    const checkNotifs = () => {
      const localNotifs = JSON.parse(localStorage.getItem("dashboard_notifications") || "[]");
      setNotifCount(localNotifs.length);
    };
    checkNotifs();
    window.addEventListener("storage", checkNotifs);
    return () => window.removeEventListener("storage", checkNotifs);
  }, [panelOpen]);

  return (
    <div className="dashboard-page">
      {/* Main content */}
      <main className="main">
        <div className="topbar">
          <h1>Welcome Back</h1>
          <div className="user">
            <div className="notification-button" onClick={toggleNotifications}>
              <FaBell className="header-icon" />
              {notifCount > 0 && (
                <span className="notification-badge"></span>
              )}
            </div>
            <span>Procurement Officer</span>
            
          </div>
        </div>

        {/* Floating Dashboard Toggle Button */}
        <div className="floating-toggle-btn" onClick={() => navigate('/procurement-officer/dashboard_sup')}>
          <FaTruck className="toggle-icon" />
          <span>Switch to Supplier View</span>
        </div>

        {/* Dashboard Stats Cards */}
        <div className="dashboard-stats">
          <div className="stats-row">
            <div className="stat-card suppliers">
              <div className="stat-header">
                <h3>Suppliers</h3>
                <span className="stat-icon"><FaUserFriends /></span>
              </div>
              <div className="stat-content">
                <div className="stat-main">{loading ? "..." : dashboardData.suppliers.total}</div>
                <div className="stat-details">
                  <span className="active">Active: {dashboardData.suppliers.active}</span>
                  <span className="pending">Pending: {dashboardData.suppliers.pending}</span>
                </div>
              </div>
              <Link to="/procurement-officer/update_delete_suppliers" className="stat-action">Manage Suppliers</Link>
            </div>

            <div className="stat-card orders">
              <div className="stat-header">
                <h3>Orders</h3>
                <span className="stat-icon"><FaBox /></span>
              </div>
              <div className="stat-content">
                <div className="stat-main">{loading ? "..." : dashboardData.orders.total}</div>
                <div className="stat-details">
                  <span className="pending">Pending: {dashboardData.orders.pending}</span>
                  <span className="completed">Completed: {dashboardData.orders.completed}</span>
                </div>
              </div>
              <Link to="/procurement-officer/orders" className="stat-action">View Orders</Link>
            </div>

            <div className="stat-card budget">
              <div className="stat-header">
                <h3>Budget Overview</h3>
                <span className="stat-icon"><FaMoneyBillWave /></span>
              </div>
              <div className="stat-content">
                <div className="stat-main">LKR {loading ? "..." : (dashboardData.budget.totalValue / 1000).toFixed(0)}K</div>
                <div className="stat-details">
                  <span className="approved">Avg Order: LKR {(dashboardData.budget.avgOrderValue / 1000).toFixed(0)}K</span>
                  <span className="pending">Pending: {dashboardData.budget.pendingApproval}</span>
                </div>
              </div>
              <Link to="/procurement-officer/budget_approval" className="stat-action">Review Budgets</Link>
            </div>
          </div>
        </div>

        {/* Recent Activities and Top Suppliers */}
        <div className="dashboard-content">
          {/* Recent Activities */}
          <div className="activity-feed">
            <h3>Recent Activities</h3>
            <div className="activities">
              {loading ? (
                <div className="loading">Loading activities...</div>
              ) : dashboardData.recentActivities.length === 0 ? (
                <div className="no-activities">No recent activities</div>
              ) : (
                dashboardData.recentActivities.map((activity, index) => (
                  <div key={index} className={`activity-item ${activity.type}`}>
                    <div className="activity-icon">
                      {activity.icon === 'supplier' || activity.type === 'supplier' ? <FaUser /> : <FaBox />}
                    </div>
                    <div className="activity-content">
                      <div className="activity-message">{activity.message}</div>
                      <div className="activity-time">
                        {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Suppliers */}
          <div className="top-suppliers">
            <h3>Top Rated Suppliers</h3>
            <div className="suppliers-list">
              {loading ? (
                <div className="loading">Loading suppliers...</div>
              ) : dashboardData.topSuppliers.length === 0 ? (
                <div className="no-suppliers">
                  <p>No rated suppliers yet</p>
                  <small>Suppliers will appear here after receiving ratings from completed orders</small>
                </div>
              ) : (
                dashboardData.topSuppliers.map((supplier, index) => (
                  <div key={supplier._id} className="supplier-item">
                    <div className="supplier-rank">#{index + 1}</div>
                    <div className="supplier-info">
                      <div className="supplier-name">
                        {supplier.name || supplier.companyName || 'Unknown Supplier'}
                        {supplier.greenFlag && <span className="green-flag"><FaTrophy /></span>}
                      </div>
                      <div className="supplier-rating">
                        <FaStar className="inline-star" /> {supplier.averageRating?.toFixed(1) || supplier.rating?.toFixed(1) || 'N/A'}
                        {supplier.successRate !== undefined && (
                          <span className="success-rate"> • {supplier.successRate}% success</span>
                        )}
                      </div>
                    </div>
                    <div className="supplier-orders">
                      {supplier.totalOrders || 0} orders
                      {supplier.completedOrders !== undefined && (
                        <div className="completed-orders">({supplier.completedOrders} completed)</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="analytics-section">
          <h2>Analytics & Insights</h2>
          <div className="charts-grid">
            {/* Order Trends Chart */}
            <div className="chart-container">
              <h3>Monthly Order Trends</h3>
              <div className="chart-wrapper">
                <Line
                  data={dashboardData.chartData.monthlyOrders}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      title: { display: false }
                    },
                    scales: {
                      y: { beginAtZero: true }
                    }
                  }}
                />
              </div>
            </div>

            {/* Supplier Performance */}
            <div className="chart-container">
              <h3>Top Supplier Ratings</h3>
              <div className="chart-wrapper">
                <Bar
                  data={dashboardData.chartData.supplierPerformance}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: { beginAtZero: true, max: 5 }
                    }
                  }}
                />
              </div>
            </div>

            {/* Budget Trends */}
            <div className="chart-container">
              <h3>Budget Spending Trends</h3>
              <div className="chart-wrapper">
                <Line
                  data={dashboardData.chartData.budgetTrends}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
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
          </div>
        </div>


      </main>

      {/* Notifications Panel (dynamic) */}
      <NotificationsProc
        panelOpen={panelOpen}
        togglePanel={toggleNotifications}
      />
    </div>
  );
}

export default Dashboard_proc;
