import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const navigate = useNavigate();

  // Validation function
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

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    console.log('🔐 Starting login process...', { email, password: '***' });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('📡 Response received:', { status: response.status, ok: response.ok });
      
      const data = await response.json();
      console.log('📄 Response data:', data);

      if (response.ok) {
        if (data.require2FA) {
          console.log('🔒 2FA required, redirecting to OTP...');
          navigate(`/verify-otp?email=${email}`);
        } else {
          // Store token and user data if provided
          if (data.token) {
            localStorage.setItem("authToken", data.token);
            console.log('🎫 Token stored successfully');
          }
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            console.log('👤 User data stored:', data.user);
            
            // Store supplier-specific ID if user is a supplier
            if (data.user.role === "supplier" && data.user.id) {
              localStorage.setItem("supplierUserId", data.user.id);
            }
          }

          // Role-based navigation
          const userRole = data.user?.role;
          console.log('🎭 User role detected:', userRole);
          
          if (userRole === "customer service representative") {
            console.log('🏢 Redirecting to CSR dashboard...');
            navigate("/csr-dashboard");
          } else if (userRole === "inspector") {
            navigate("/inspector-dashboard");
          } else if (userRole === "project manager") {
            navigate("/project-manager");
          } else if (userRole === "team leader") {
            navigate("/team-leader");
          } else if (userRole === "team member") {
            navigate("/team-member");
          } else if (userRole === "warehouse manager") {
            navigate("/warehouse-manager");
          } else if (userRole === "procurement officer") {
            navigate("/procurement-officer");
          } else if (userRole === "finance manager") {
            navigate("/finance-manager");
          } else if (userRole === "supplier") {
            navigate("/dashboard_sup");
          } else {
            // If role doesn't match any staff role, show error
            console.log('❌ Role not recognized:', userRole);
            setError("Access denied. This portal is for staff members only.");
          }
        }
      } else {
        console.log('❌ Response not OK:', data);
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error('🚨 Login error:', err);
      setError("Server error, please try again.");
    }
  };

  // Navigation handlers
  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side (image + overlay) */}
      <div 
        className="w-1/2 bg-cover bg-center relative"
        style={{ 
          backgroundImage: `url(https://i.pinimg.com/736x/f1/66/57/f166573bf0ff954b62f5d168ec71dcf0.jpg)`
        }}
      >
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-start p-12 text-white">
          <h1 className="text-4xl font-bold mb-4">Transform spaces with your vision</h1>
          <p className="text-lg">Manage your interior design projects with ease and elegance.</p>
        </div>
      </div>

      {/* Right side (form) */}
      <div className="w-1/2 flex items-center justify-center bg-gray-50">
  <div className="w-full max-w-md p-10 bg-cream-light shadow-lg rounded-lg">
          <div className="text-center mb-6">
            <span className="text-4xl">🏠</span>
            <h2 className="text-2xl font-bold mt-2">Staff Portal</h2>
            <p className="text-gray-500 mt-1">Login to your staff account</p>
          </div>

          {error && <div className="text-red-600 mb-4">{error}</div>}
          {resetMsg && <div className="text-green-600 mb-4">{resetMsg}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full mt-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full mt-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-between items-center text-sm text-blue-600">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-brown-primary text-white py-2 rounded hover:bg-brown-primary-300"
            >
              Login 
            </button>
          </form>

          <div className="text-center mt-6 text-gray-500 text-sm">
            Don't have an account?{" "}
            <button 
              type="button"
              onClick={handleSignUp}
              className="text-blue-600 hover:underline"
            >
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
