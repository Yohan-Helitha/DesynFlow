import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const handleVerify = async () => {
    
  if (otp.length !== 6) {
    setError("Please enter a 6-digit OTP");
    return;
  }

  try {
    const response = await fetch("http://localhost:4000/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (response.ok) {
      navigate("/verify-success");
    } else {
      setError(data.message || "Invalid OTP");
    }
  } catch (err) {
    setError("Server error, please try again.");
  }
};
