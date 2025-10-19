import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const email = params.get("email") || "";
  const token = params.get("token") || ""; // for email verification

  useEffect(() => {
    if (token) {
      fetch(`http://localhost:3000/api/auth/verify-email?token=${token}`)
        .then(res => res.json())
        .then(data => data.message ? setMessage(data.message) : setError("Verification failed"))
        .catch(() => setError("Server error"))
        .finally(() => setTimeout(() => navigate("/login"), 2000));
    }
  }, [token]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return setError("Enter 6-digit OTP");
    try {
      const res = await fetch("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin: otp }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("authToken", data.token);
        setMessage("OTP verified! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else setError(data.message || "Invalid OTP");
    } catch {
      setError("Server error");
    }
  };

  if (token) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md text-center w-full max-w-md">
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Verify OTP</h2>
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            value={otp}
            onChange={e => setOtp(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Verify</button>
        </form>
        <p className="text-gray-500 text-sm mt-2 text-center">OTP sent to: {email}</p>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
