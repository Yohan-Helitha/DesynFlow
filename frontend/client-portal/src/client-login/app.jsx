import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Authentication Pages
import LoginPage from './pages/loginPage';
import SignUpPage from './pages/signUpPage';
import VerifyOTPPage from './pages/verifyOTPpage';

// Main Application Pages
import InspectionRequestDashboard from '../inspection-request/pages/inspectionRequestDashboard';
import InspectionRequestForm from '../inspection-request/pages/inspectionRequestForm';
import PaymentForm from '../inspection-request/components/forms/paymentForm';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/';
    return null;
  }
  return children;
};


function App() {
  return (
    <Router>
      <Routes>
        {/* ===== Authentication Routes (Public) ===== */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />

        {/* ===== Main Application Routes (Protected) ===== */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <InspectionRequestDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/inspection-request" 
          element={
            <ProtectedRoute>
              <InspectionRequestDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/inspection-request/new" 
          element={
            <ProtectedRoute>
              <InspectionRequestForm />
            </ProtectedRoute>
          } 
        />
        
        {/* ===== Payment Routes (Public - uses secure token) ===== */}
        <Route path="/payment/:token" element={<PaymentForm />} />
        
        {/* ===== Fallback Route ===== */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
