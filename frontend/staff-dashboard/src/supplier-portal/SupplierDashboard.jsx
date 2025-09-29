import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";

function SupplierDashboard() {
  const location = useLocation();
  
  // Don't show the procurement sidebar on supplier-specific routes
  const isSupplierRoute = location.pathname.includes('/dashboard_sup') || 
                         location.pathname.includes('/order_details_sup') || 
                         location.pathname.includes('/sample_order_list');
  
  return (
    <div className="page-with-sidebar">
      {!isSupplierRoute && <Sidebar />}
      <div className="supplier-dashboard-content">
        <Outlet />
      </div>
    </div>
  );
}

export default SupplierDashboard;