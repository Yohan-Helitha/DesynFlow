import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import StaffLogin from './staff-login/staffLogin'
import CSRDashboard from './CSR-portal/pages/CSRDashboard'
import InspectorDashboard from './inspector-portal/pages/InspectorDashboard'
import RequestTable from './CSR-portal/component/requestTable'
import ProjectManagerDashboard from './project/ProjectManagerDashboard.jsx';
import TeamLeaderMainDashboard from './project/TeamLeaderMainDashboard.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">        
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
            
            {/* Add more role-based routes as needed */}
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
