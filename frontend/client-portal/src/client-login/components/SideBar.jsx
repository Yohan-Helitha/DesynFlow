// src/components/Sidebar.jsx
import React from "react";

const Sidebar = ({ sections, activeSection, onSelect }) => {
  return (
    <div className="w-64 bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Profile</h2>
      <ul className="space-y-2">
        {sections.map((sec) => (
          <li
            key={sec.key}
            className={`p-2 rounded cursor-pointer ${
              activeSection === sec.key
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-100 text-gray-800"
            }`}
            onClick={() => onSelect(sec.key)}
          >
            {sec.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
