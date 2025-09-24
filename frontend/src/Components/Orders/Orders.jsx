import React, { useEffect, useState } from 'react';
import './Orders.css';
import axios from "axios";
import { Link } from "react-router-dom";

const URL = "http//localhost:3000/Orders";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch purchase orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/purchase-orders"); // backend API
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };
    fetchOrders();
  }, []);

  // Filtered orders by supplier or material
  const filteredOrders = orders.filter(order => {
    const supplierName = (order.supplierId?.companyName || order.supplierId || "").toString().toLowerCase();
    const materialList = (order.items || [])
      .map(i => (i.materialId?.materialName || i.materialName || i.materialId || "").toString().toLowerCase())
      .join(" ");
    const term = (searchTerm || "").toLowerCase();
    return supplierName.includes(term) || materialList.includes(term);
  });

  return (
    <div className="orders-container">
      <h2>Orders</h2>
      <table className="orders-table" id="ordersTable">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Supplier</th>
            <th>Ordered Materials</th>
            <th>Quantity</th>
            <th>Price per Unit</th>
            <th>Total Price</th>
            <th>Status</th> {/* Added Status column */}
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order, idx) => (
              <tr key={order._id || idx}>
                <td>{order._id || idx + 1}</td>
                <td>{order.supplierId?.companyName || order.supplierId || "Unknown"}</td>
                <td>{order.items?.map((item, i) => (
                  <div key={i}>{item.materialId?.materialName || item.materialName || item.materialId || "Unknown"}</div>
                ))}</td>
                <td>{order.items?.map((item, i) => (
                  <div key={i}>{item.qty || item.quantity}</div>
                ))}</td>
                <td>{order.items?.map((item, i) => (
                  <div key={i}>{item.unitPrice || item.pricePerUnit}</div>
                ))}</td>
                <td>{order.items?.map((item, i) => (
                  <div key={i}>{((item.unitPrice || item.pricePerUnit) * (item.qty || item.quantity)) || 0}</div>
                ))}</td>
                <td>
                  {order.status === "Approved" ? (
                    <span style={{ color: '#22c55e', fontWeight: 'bold' }}>Approved</span>
                  ) : order.status === "Rejected" ? (
                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Rejected</span>
                  ) : (
                    <span style={{ color: '#64748b', fontWeight: 'bold' }}>{order.status || "Sent"}</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <button><Link to="/OrderForm">Place an Order</Link></button>
    </div>
  );
}

export default Orders;
