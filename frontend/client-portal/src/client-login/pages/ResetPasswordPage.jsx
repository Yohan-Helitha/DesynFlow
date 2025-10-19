import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPasswordPage = () => {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) return setError("OTP required");
    if (password !== confirm) return setError("Passwords do not match");

    try {
      const res = await fetch("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, newPassword: password }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Password reset successful. Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch {
      setError("Server error");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left image */}
      <div
        className="w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url(https://i.pinimg.com/736x/f1/66/57/f166573bf0ff954b62f5d168ec71dcf0.jpg)" }}
      ></div>

      {/* Right form */}
      <div className="w-1/2 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-white shadow rounded">
          <h2 className="text-xl font-bold mb-4">Reset Password</h2>
          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-600">{message}</p>}

          {!message && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                className="w-full border p-2 mb-3 rounded"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <input
                type="password"
                placeholder="New Password"
                className="w-full border p-2 mb-3 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full border p-2 mb-3 rounded"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <button className="w-full bg-blue-600 text-white py-2 rounded">
                Reset Password
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
