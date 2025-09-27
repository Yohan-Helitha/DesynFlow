import React from "react";

const Sidebar = ({ activeSection, onSelect, onLogout }) => {
  return (
    <div className="w-64 bg-white shadow-lg p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <ul className="space-y-3">
          <li
            onClick={() => onSelect("dashboard")}
            className={`cursor-pointer p-2 rounded ${
              activeSection === "dashboard"
                ? "bg-yellow-200"
                : "hover:bg-gray-200"
            }`}
          >
            Recent Activities
          </li>
          <li
            onClick={() => onSelect("inspection")}
            className={`cursor-pointer p-2 rounded ${
              activeSection === "inspection"
                ? "bg-yellow-200"
                : "hover:bg-gray-200"
            }`}
          >
            Inspection
          </li>
          <li
            onClick={() => onSelect("project")}
            className={`cursor-pointer p-2 rounded ${
              activeSection === "project"
                ? "bg-yellow-200"
                : "hover:bg-gray-200"
            }`}
          >
            Project
          </li>
          <li
            onClick={() => onSelect("warranty")}
            className={`cursor-pointer p-2 rounded ${
              activeSection === "warranty"
                ? "bg-yellow-200"
                : "hover:bg-gray-200"
            }`}
          >
            Warranty
          </li>
          <li
            onClick={() => onSelect("profile")}
            className={`cursor-pointer p-2 rounded ${
              activeSection === "profile"
                ? "bg-yellow-200"
                : "hover:bg-gray-200"
            }`}
          >
            Profile
          </li>
        </ul>
      </div>
      <button
        onClick={onLogout}
        className="mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Log out
      </button>
    </div>
  );
};

export default Sidebar;
