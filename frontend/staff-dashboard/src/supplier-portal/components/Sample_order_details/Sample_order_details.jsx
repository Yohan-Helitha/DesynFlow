import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Sample_order_details.css";

function Sample_order_details() {
  const { id } = useParams();
  const [sample, setSample] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/samples/${id}`)
      .then(res => res.json())
      .then(data => {
        setSample(data);
        setLoading(false);
      })
      .catch(() => {
        setSample(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="sample-order-details-page"><p>Loading...</p></div>;
  if (!sample) return <div className="sample-order-details-page"><p>Sample order not found.</p></div>;

  return (
    <div className="sample-order-details-page">
      <h2>Sample Order Details</h2>
      <div className="details-card">
        <p><b>Supplier:</b> {sample.supplierId?.companyName || sample.supplierId}</p>
        <p><b>Material:</b> {sample.materialId?.name || sample.materialId}</p>
        <p><b>Requested By:</b> {sample.requestedBy?.name || sample.requestedBy}</p>
        <p><b>Status:</b> {sample.status}</p>
        <p><b>Note:</b> {sample.reviewNote || '-'}</p>
        <p><b>Date:</b> {new Date(sample.createdAt).toLocaleString()}</p>
        {sample.files && sample.files.length > 0 && (
          <div><b>Files:</b> {sample.files.join(", ")}</div>
        )}
      </div>
    </div>
  );
}

export default Sample_order_details;

