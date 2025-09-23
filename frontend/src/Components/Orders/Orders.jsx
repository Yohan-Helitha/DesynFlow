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
    const supplier = order.supplierId?.name?.toLowerCase() || "";
    const materialList = order.items?.map(i => i.materialName?.toLowerCase()).join(" ") || "";
    return supplier.includes(searchTerm.toLowerCase()) || materialList.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="orders-container">
      <h2>Orders</h2>
      <table className="orders-table" id="ordersTable">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Supplier ID</th>
            <th>Order Items</th>
            <th>Price per Unit</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order, idx) => (
              <tr key={order._id || idx}>
                <td>{idx + 1}</td>
                <td>{order.supplierId || (order.supplierId?._id || "Unknown")}</td>
                <td>
                  {order.items?.map((item, i) => (
                    <div key={i}>{item.materialName}</div>
                  ))}
                </td>
                <td>
                  {order.items?.map((item, i) => (
                    <div key={i}>{item.unitPrice || item.pricePerUnit}</div>
                  ))}
                </td>
                <td>
                  {order.items?.map((item, i) => (
                    <div key={i}>{item.qty || item.quantity}</div>
                  ))}
                </td>
                <td>
                  {order.items?.map((item, i) => (
                    <div key={i}>{((item.unitPrice || item.pricePerUnit) * (item.qty || item.quantity)) || 0}</div>
                  ))}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
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
