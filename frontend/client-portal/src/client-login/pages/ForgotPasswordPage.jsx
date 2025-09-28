import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError("Email is required");

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("OTP sent to your email.");
        setError("");
        // ✅ Redirect to reset page with email passed
        setTimeout(() => navigate(`/reset-password?email=${email}`), 1500);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch {
      setError("Server error");
    } finally {
      setIsLoading(false);
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
          <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-600">{message}</p>}
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border p-2 mb-3 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {isLoading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
