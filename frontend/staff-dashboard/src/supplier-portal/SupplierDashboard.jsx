import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";

function SupplierDashboard() {
  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="supplier-dashboard-content">
        <Outlet />
      </div>
    </div>
  );
}

export default SupplierDashboard;