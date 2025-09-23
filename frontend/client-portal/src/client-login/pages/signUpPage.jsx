import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Register user function: sends data to backend and returns OTP
  const registerUser = async (username, email, password, phone) => {
    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, phone })
      });
      const data = await response.json();
      if (response.ok) {
        // Backend should send OTP in response or via email
        return data.otp || "";
      } else {
        setErrors({ form: data.message || "Registration failed" });
        return "";
      }
    } catch (err) {
      setErrors({ form: "Server error, please try again." });
      return "";
    }
  };

 
  const checkPassword = (pass) => {
    return {
      hasMinLength: pass.length >= 8,
      hasNumber: /\d/.test(pass),
      hasUppercase: /[A-Z]/.test(pass),
    };
  };

  
  const validate = () => {
    const newErrors = {};
    if (!username) newErrors.username = "Username is required";
    if (!email.includes("@")) newErrors.email = "Valid email is required";
    if (!/^\d{10}$/.test(phone)) newErrors.phone = "Phone must be 10 digits";
    const pwdCheck = checkPassword(password);
    if (!pwdCheck.hasMinLength || !pwdCheck.hasNumber || !pwdCheck.hasUppercase) {
      newErrors.password = "Password must be 8+ chars, 1 number, 1 uppercase";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      const otp = await registerUser(username, email, password, phone);
      navigate(`/verify-otp?email=${email}&otp=${otp}`);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
        {errors.username && <p style={{ color: "red" }}>{errors.username}</p>}

        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}

        <label>Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        {errors.phone && <p style={{ color: "red" }}>{errors.phone}</p>}

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}
