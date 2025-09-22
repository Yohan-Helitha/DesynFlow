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
        const res = await fetch("http://localhost:3000/purchase-orders"); // backend API
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
    const supplier = order.supplierId?.name?.toLowerCase() || "";
    const materialList = order.items?.map(i => i.materialName?.toLowerCase()).join(" ") || "";
    return supplier.includes(searchTerm.toLowerCase()) || materialList.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="orders-container">
      <h2>Orders Management</h2>

      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by Supplier or Material..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Orders Table */}
      <table className="orders-table" id="ordersTable">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Materials</th>
            <th>Quantity</th>
            <th>Supplier</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <tr key={order._id || index}>
                <td>{order._id}</td>
                <td>
                  {order.items?.map((item, i) => (
                    <div key={i}>{item.materialName}</div>
                  ))}
                </td>
                <td>
                  {order.items?.map((item, i) => (
                    <div key={i}>{item.quantity}</div>
                  ))}
                </td>
                <td>{order.supplierId?.name || "Unknown Supplier"}</td>
                <td>
                  <span className={`status ${order.status?.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No orders found
              </td>
            </tr>
          )}
        </tbody>
          
          <button><Link to ="/OrderForm">Place an Order</Link></button>

      </table>
    </div>
  );
}

export default Orders;
