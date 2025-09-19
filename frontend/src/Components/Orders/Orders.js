import React from 'react';
import './Orders.css';

function Orders() {
  // Search function
  function searchOrders() {
    let input = document.getElementById("search").value.toLowerCase();
    let rows = document.querySelectorAll("#ordersTable tbody tr");
    rows.forEach(row => {
      let supplier = row.cells[3].innerText.toLowerCase();
      let material = row.cells[1].innerText.toLowerCase();
      row.style.display = supplier.includes(input) || material.includes(input) ? "" : "none";
    });
  }

  return (
    <div className="orders-container">
      <h2>Orders Management</h2>

      {/* Search bar */}
      <div className="search-bar">
        <input 
          type="text" 
          id="search" 
          placeholder=" Search by Supplier or Material..." 
          onKeyUp={searchOrders} 
        />
      </div>

      {/* Orders Table */}
      <table className="orders-table" id="ordersTable">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Material</th>
            <th>Quantity</th>
            <th>Supplier</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ORD-301</td>
            <td>Granite Tiles</td>
            <td>200</td>
            <td>Global Interiors Ltd</td>
            <td><span className="status completed">Completed</span></td>
          </tr>
          <tr>
            <td>ORD-302</td>
            <td>Eco Paint</td>
            <td>50</td>
            <td>EcoLiving Supplies</td>
            <td><span className="status pending">Pending</span></td>
          </tr>
          <tr>
            <td>ORD-303</td>
            <td>LED Chandeliers</td>
            <td>20</td>
            <td>BrightSpaces Lighting</td>
            <td><span className="status inprogress">In Progress</span></td>
          </tr>
          <tr>
            <td>ORD-304</td>
            <td>Rugs & Curtains</td>
            <td>120</td>
            <td>Prime Decor Hub</td>
            <td><span className="status completed">Completed</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Orders;
