import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Authentication Pages
import LoginPage from './pages/loginPage';
import SignUpPage from './pages/signUpPage';
import VerifyOTPPage from './pages/verifyOTPpage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Main Application Pages
import InspectionRequestDashboard from '../inspection-request/pages/inspectionRequestDashboard';
import InspectionRequestForm from '../inspection-request/pages/inspectionRequestForm';
import PaymentForm from '../inspection-request/components/forms/paymentForm';
import Profile from './components/Profile'; //
import ProjectOverviewClient from './project/ProjectOverviewClient';
// Public site pages
import { Home } from '../web/pages/Home';
import { Gallery } from '../web/pages/Gallery';
import { AboutUs } from '../web/pages/AboutUS';
import { ContactUs } from '../web/pages/ContactUS';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/';
    return null;
  }
  return children;
};

// Redirect authenticated users away from auth pages like /login
const RedirectIfAuth = ({ children }) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    window.location.href = '/dashboard';
    return null;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
  {/* ===== Public Site Routes (Home is default) ===== */}
  <Route path="/" element={<Home />} />
  <Route path="/gallery" element={<Gallery />} />
  <Route path="/about-us" element={<AboutUs />} />
  <Route path="/contact-us" element={<ContactUs />} />

  {/* ===== Authentication Routes (Public) ===== */}
  <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />

        {/* ===== Profile Route (Protected) ===== */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* ===== Main Application Routes (Protected) ===== */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Profile />
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
          path="/project-summary" 
          element={
            <ProtectedRoute>
              <ProjectOverviewClient />
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
