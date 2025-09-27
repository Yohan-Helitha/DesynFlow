import React, { useState, useEffect } from "react";
import "./Dashboard_proc.css";
import { Link } from "react-router-dom";
import Notifications_proc from "../Notifications_proc/Notifications_proc";
import Sidebar from "../Sidebar/Sidebar";

function Dashboard_proc() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    suppliers: { total: 0, active: 0, pending: 0 },
    orders: { total: 0, pending: 0, completed: 0, approved: 0 },
    budget: { totalRequests: 0, pendingApproval: 0, approvedThisMonth: 0 },
    recentActivities: [],
    topSuppliers: [],
    systemMetrics: { orderVolume: 0, avgDeliveryTime: 0, supplierSatisfaction: 0 }
  });
  const [loading, setLoading] = useState(true);

  const toggleNotifications = () => setPanelOpen(!panelOpen);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch suppliers data
        const suppliersResponse = await fetch("http://localhost:3000/api/suppliers");
        const suppliers = await suppliersResponse.json();

        // Fetch orders data
        const ordersResponse = await fetch("http://localhost:3000/api/dashboard/orders");
        const orders = await ordersResponse.json();

        // Fetch top rated suppliers
        const topSuppliersResponse = await fetch("http://localhost:3000/api/supplier-ratings/top");
        const topSuppliers = await topSuppliersResponse.json();

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
          approved: orders.filter(o => o.approvalStatus === 'approved').length
        };

        // Generate recent activities
        const recentActivities = [
          ...suppliers.slice(-3).map(s => ({
            type: 'supplier',
            message: `New supplier "${s.name}" registered`,
            timestamp: s.createdAt || new Date()
          })),
          ...orders.slice(-3).map(o => ({
            type: 'order',
            message: `Order #${o._id?.slice(-6)} ${o.status}`,
            timestamp: o.updatedAt || new Date()
          }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

        // Calculate system metrics
        const completedOrders = orders.filter(o => o.status === 'completed');
        const systemMetrics = {
          orderVolume: orders.length,
          avgDeliveryTime: completedOrders.length > 0 ? 
            Math.round(completedOrders.reduce((acc, o) => acc + (o.estimatedDeliveryDays || 7), 0) / completedOrders.length) : 0,
          supplierSatisfaction: topSuppliers.length > 0 ? 
            Math.round(topSuppliers.reduce((acc, s) => acc + (s.averageRating || 0), 0) / topSuppliers.length * 20) : 0
        };

        setDashboardData({
          suppliers: supplierStats,
          orders: orderStats,
          budget: { totalRequests: orders.length, pendingApproval: orderStats.pending, approvedThisMonth: orderStats.approved },
          recentActivities,
          topSuppliers: topSuppliers.slice(0, 5),
          systemMetrics
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
      <Sidebar />

      {/* Main content */}
      <main className="main">
        <div className="topbar">
          <h1>Welcome Back</h1>
          <div className="user">
            <div className="notification" onClick={toggleNotifications} style={{ position: 'relative', cursor: 'pointer' }}>
              🔔
              {notifCount > 0 && (
                <span style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', background: 'red', borderRadius: '50%', border: '1px solid #fff', display: 'inline-block' }}></span>
              )}
            </div>
            <span>Procurement Officer</span>
            
          </div>
        </div>

        {/* Dashboard Stats Cards */}
        <div className="dashboard-stats">
          <div className="stats-row">
            <div className="stat-card suppliers">
              <div className="stat-header">
                <h3>Suppliers</h3>
                <span className="stat-icon">👥</span>
              </div>
              <div className="stat-content">
                <div className="stat-main">{loading ? "..." : dashboardData.suppliers.total}</div>
                <div className="stat-details">
                  <span className="active">Active: {dashboardData.suppliers.active}</span>
                  <span className="pending">Pending: {dashboardData.suppliers.pending}</span>
                </div>
              </div>
              <Link to="/Update_delete_suppliers" className="stat-action">Manage Suppliers</Link>
            </div>

            <div className="stat-card orders">
              <div className="stat-header">
                <h3>Orders</h3>
                <span className="stat-icon">📦</span>
              </div>
              <div className="stat-content">
                <div className="stat-main">{loading ? "..." : dashboardData.orders.total}</div>
                <div className="stat-details">
                  <span className="pending">Pending: {dashboardData.orders.pending}</span>
                  <span className="completed">Completed: {dashboardData.orders.completed}</span>
                </div>
              </div>
              <Link to="/Orders" className="stat-action">View Orders</Link>
            </div>

            <div className="stat-card budget">
              <div className="stat-header">
                <h3>Budget Approvals</h3>
                <span className="stat-icon">💰</span>
              </div>
              <div className="stat-content">
                <div className="stat-main">{loading ? "..." : dashboardData.budget.pendingApproval}</div>
                <div className="stat-details">
                  <span className="approved">Approved: {dashboardData.budget.approvedThisMonth}</span>
                  <span className="total">Total Requests: {dashboardData.budget.totalRequests}</span>
                </div>
              </div>
              <Link to="/Budget_approval" className="stat-action">Review Budgets</Link>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="system-metrics">
          <h2>System Performance</h2>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-value">{dashboardData.systemMetrics.orderVolume}</div>
              <div className="metric-label">Total Order Volume</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">{dashboardData.systemMetrics.avgDeliveryTime} days</div>
              <div className="metric-label">Avg Delivery Time</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">{dashboardData.systemMetrics.supplierSatisfaction}%</div>
              <div className="metric-label">Supplier Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Dashboard Content Grid */}
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
                      {activity.type === 'supplier' ? '👤' : '📦'}
                    </div>
                    <div className="activity-content">
                      <div className="activity-message">{activity.message}</div>
                      <div className="activity-time">
                        {new Date(activity.timestamp).toLocaleDateString()}
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
                <div className="no-suppliers">No rated suppliers yet</div>
              ) : (
                dashboardData.topSuppliers.map((supplier, index) => (
                  <div key={supplier._id} className="supplier-item">
                    <div className="supplier-rank">#{index + 1}</div>
                    <div className="supplier-info">
                      <div className="supplier-name">{supplier.name}</div>
                      <div className="supplier-rating">
                        ⭐ {supplier.averageRating?.toFixed(1) || 'N/A'}
                      </div>
                    </div>
                    <div className="supplier-orders">
                      {supplier.totalOrders || 0} orders
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Notifications Panel (dynamic) */}
      <Notifications_proc
        panelOpen={panelOpen}
        togglePanel={toggleNotifications}
      />
    </div>
  );
}

export default Dashboard_proc;
