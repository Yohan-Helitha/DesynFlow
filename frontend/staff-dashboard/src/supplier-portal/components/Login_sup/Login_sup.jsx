import React, { useState } from "react";
import "./Login_sup.css";

function LoginSup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/suppliers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || `Login failed (${res.status})`);
        console.error("Supplier login failed:", body);
      } else {
        const body = await res.json().catch(() => ({}));
        setSuccess("Login successful. Redirecting...");
        console.log("Supplier logged in:", body);
        // TODO: redirect or set auth context
      }
    } catch (err) {
      console.error("Network error while logging in:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-sup-page">
      <form className="login-sup-card" onSubmit={handleSubmit} aria-label="Supplier login form">
        <h1 className="login-title">Supplier Login</h1>

        {error && <div role="alert" className="login-error">{error}</div>}
        {success && <div role="status" className="login-success">{success}</div>}

        <label className="login-label">
          Email
          <input
            className="login-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            aria-required="true"
          />
        </label>

        <label className="login-label">
          Password
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            aria-required="true"
          />
        </label>

        <div className="login-actions">
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>

        <p className="login-help">If you don't have an account, contact your procurement team.</p>
      </form>
    </div>
  );
}

export default LoginSup;
