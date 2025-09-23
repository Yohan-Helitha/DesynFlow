import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from './pages/loginPage';
import SignUpPage from './pages/signUpPage';
import VerifyOTPPage from './pages/verifyOTPpage';


function App() {
  return (
    <Router>
      <Routes>
  <Route path="/" element={<LoginPage />} />
  <Route path="/signup" element={<SignUpPage />} />
  <Route path="/verify-otp" element={<VerifyOTPPage />} />
      </Routes>
    </Router>
  );
}

export default App;
