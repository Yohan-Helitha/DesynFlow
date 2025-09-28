import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import StaffLogin from './staff-login/staffLogin'
import CSRDashboard from './CSR-portal/pages/CSRDashboard'
import InspectorDashboard from './inspector-portal/pages/InspectorDashboard'
import RequestTable from './CSR-portal/component/requestTable'
import ProjectManagerDashboard from './project/ProjectManagerDashboard.jsx';
import TeamLeaderMainDashboard from './project/TeamLeaderMainDashboard.jsx';
import WarehouseDashboard from './warehouse-manager/WarehouseDashboard.jsx';
import SupplierDashboard from './supplier-portal/SupplierDashboard.jsx';
import FinanceDashboard from './finance-portal/FinanceDashboard.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen">        
        <main>
          <Routes>
            {/* Staff Login as default route */}
            <Route path="/" element={<StaffLogin />} />
            <Route path="/login" element={<StaffLogin />} />
            
            {/* Role-based Dashboard Routes */}
            <Route path="/csr-dashboard" element={<CSRDashboard />} />
            <Route path="/inspector-dashboard" element={<InspectorDashboard />} />
            
            {/* Legacy Routes */}
            <Route path="/csr" element={<CSRDashboard />} />
            <Route path="/csr/requests" element={<RequestTable />} />
            
            {/* Project Manager route */}
            <Route path="/project-manager" element={<ProjectManagerDashboard />} />
            <Route path="/team-leader" element={<TeamLeaderMainDashboard />} />
            
            {/* Warehouse Manager routes */}
            <Route path="/warehouse-manager/*" element={<WarehouseDashboard />} />
            
            {/* Supplier Management routes */}
            <Route path="/supplier/*" element={<SupplierDashboard />} />
            
            {/* Finance Management routes */}
            <Route path="/finance/*" element={<FinanceDashboard />} />
            
            {/* Role-specific finance access */}
            <Route path="/finance-manager" element={<FinanceDashboard />} />
            <Route path="/accountant" element={<FinanceDashboard />} />
            
            {/* Procurement Officer route (maps to supplier portal) */}
            <Route path="/procurement-officer" element={<SupplierDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App