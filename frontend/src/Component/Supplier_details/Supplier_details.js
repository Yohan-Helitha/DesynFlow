import React, { useState } from "react";
import "./Supplier_details.css";

function Supplier_details() {
  const suppliers = {
    "Global Interiors Ltd": {
      desc: "Premium furniture and luxury interior solutions.",
      items: ["Sofas", "Dining Tables", "Wardrobes"],
      rating: "★★★★☆ (4.5)"
    },
    "EcoLiving Supplies": {
      desc: "Sustainable and eco-friendly interior materials.",
      items: ["Bamboo Flooring", "Eco Paint", "Recycled Panels"],
      rating: "★★★★☆ (4.0)"
    },
    "BrightSpaces Lighting": {
      desc: "Smart and elegant lighting solutions for modern spaces.",
      items: ["LED Chandeliers", "Smart Bulbs", "Track Lights"],
      rating: "★★★★★ (5.0)"
    },
    "Prime Decor Hub": {
      desc: "Trendy décor for homes and offices.",
      items: ["Wall Art", "Rugs", "Curtains"],
      rating: "★★★☆☆ (3.8)"
    }
  };

  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Search filter
  const [search, setSearch] = useState("");
  const filteredSuppliers = Object.keys(suppliers).filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="suppliers-container">
      <h2>Interior Design Suppliers</h2>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder=" Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <table id="supplierTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Supplier Name</th>
            <th>Years with Us</th>
            <th>Rating</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredSuppliers.map((name, index) => (
            <tr key={index}>
              <td>SUP-00{index + 1}</td>
              <td>{name}</td>
              <td>
                {index === 0
                  ? "5 years"
                  : index === 1
                  ? "3 years"
                  : index === 2
                  ? "7 years"
                  : "2 years"}
              </td>
              <td>
                <span className="rating">{suppliers[name].rating.split(" ")[0]}</span>{" "}
                {suppliers[name].rating.split(" ")[1]}
              </td>
              <td>
                <button
                  className="info-btn"
                  onClick={() => setSelectedSupplier(name)}
                >
                  More Info
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="Manage-btn-wrapper">
        <button className="Manage-btn">Manage Suppliers</button>
      </div>

      {/* Modal */}
      {selectedSupplier && (
        <div className="modal">
          <div className="modal-content">
            <span
              className="close-btn"
              onClick={() => setSelectedSupplier(null)}
            >
              &times;
            </span>
            <h3>{selectedSupplier}</h3>
            <p>{suppliers[selectedSupplier].desc}</p>
            <ul>
              {suppliers[selectedSupplier].items.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
            <p>
              <b>Rating:</b> {suppliers[selectedSupplier].rating}
            </p>
            <button className="place-order-btn">Place Order</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Supplier_details;
