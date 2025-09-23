
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './loginPage.css';
import greenLivingroom from './green-livingroom.jpg';


const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        // If backend requires 2FA, redirect to OTP page
        if (data.require2FA) {
          navigate(`/verify-otp?email=${email}`);
        } else {
          // Store token/session if provided
          if (data.token) localStorage.setItem('token', data.token);
          // Redirect to dashboard or home
          navigate('/dashboard');
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Server error, please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left" style={{ backgroundImage: `url(https://in.pinterest.com/pin/13581236383486555/)` }}>
        <div className="login-overlay">
          <h1>Transform spaces with your vision</h1>
          <p>Manage your interior design projects with ease and elegance.</p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-box">
          <div className="login-logo">
            <span role="img" aria-label="logo" className="logo-icon">🏠</span>
            <span className="logo-text">InteriDesign</span>
          </div>
          <h2>Welcome back</h2>
          <p className="login-subtitle">Login in to your account to continue</p>
          <form onSubmit={handleLogin}>
            {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              placeholder="name@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <label htmlFor="password">Password</label>
            <div className="password-row">
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>
            <button type="submit" className="login-btn">Sign in</button>
          </form>
          <div className="login-footer">
            <span>Don't have an account?</span>
            <a href="#" className="admin-link">Contact admin</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
