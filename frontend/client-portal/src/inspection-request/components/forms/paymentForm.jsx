// PaymentForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const PaymentForm = () => {
  const { token } = useParams(); // get token from URL
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check allowed types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setMessage("Only JPG, PNG, or PDF files are allowed.");
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selectedFile);
    setMessage("");

    // Preview only for images
    if (selectedFile.type.startsWith("image")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("receiptFile", file);

    try {
      setLoading(true);
      const res = await axios.post(`/api/payment-receipt/upload/${token}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data.message || "Payment receipt uploaded successfully!");
      setFile(null);
      setPreview(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>Upload Payment Receipt</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <input type="file" onChange={handleFileChange} />
        </div>
        {preview && (
          <div style={{ marginBottom: "15px" }}>
            <img
              src={preview}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "200px" }}
            />
          </div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Submit"}
        </button>
      </form>
      {message && <p style={{ marginTop: "15px" }}>{message}</p>}
    </div>
  );
};

export default PaymentForm;
