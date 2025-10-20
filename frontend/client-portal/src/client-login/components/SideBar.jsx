import React from "react";

const Sidebar = ({ activeSection, onSelect, onLogout }) => {
  return (
    <div className="w-64 bg-cream-primary shadow-lg p-6 flex flex-col justify-between border-r border-brown-primary-300">
      <div>
        <h2 className="text-xl font-bold mb-6 text-brown-primary">Dashboard</h2>
        <ul className="space-y-3">
          <li
            onClick={() => onSelect("dashboard")}
            className={`cursor-pointer p-2 rounded ${
              activeSection === "dashboard"
                ? "bg-brown-primary-200 text-brown-primary"
                : "hover:bg-cream-medium text-brown-secondary"
            }`}
          >
            Recent Activities
          </li>
          <li
            onClick={() => onSelect("inspection")}
            className={`cursor-pointer p-2 rounded ${
              activeSection === "inspection"
                ? "bg-brown-primary-200 text-brown-primary"
                : "hover:bg-cream-medium text-brown-secondary"
            }`}
          >
            Inspection
          </li>
          <li
            onClick={() => onSelect("project")}
            className={`cursor-pointer p-2 rounded ${
              activeSection === "project"
                ? "bg-brown-primary-200 text-brown-primary"
                : "hover:bg-cream-medium text-brown-secondary"
            }`}
          >
            Project
          </li>
          <li
            onClick={() => onSelect("payments")}
            className={`cursor-pointer p-2 rounded ${
              activeSection === "payments"
                ? "bg-brown-primary-200 text-brown-primary"
                : "hover:bg-cream-medium text-brown-secondary"
            }`}
          >
            Payments
          </li>
          <li
            onClick={() => onSelect("warranty")}
            className={`cursor-pointer p-2 rounded ${
              activeSection === "warranty"
                ? "bg-brown-primary-200 text-brown-primary"
                : "hover:bg-cream-medium text-brown-secondary"
            }`}
          >
            Warranty
          </li>
          <li
            onClick={() => onSelect("profile")}
            className={`cursor-pointer p-2 rounded ${
              activeSection === "profile"
                ? "bg-brown-primary-200 text-brown-primary"
                : "hover:bg-cream-medium text-brown-secondary"
            }`}
          >
            Profile
          </li>
        </ul>
      </div>
      <button
        onClick={onLogout}
        className="mt-6 bg-brown-primary text-white py-2 px-4 rounded hover:bg-brown-primary-700"
      >
        Log out
      </button>
    </div>
  );
};

export default Sidebar;
