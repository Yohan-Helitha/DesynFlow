import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Package,
  Layers,
  MapPin,
  MoveRight,
  Send,
  RotateCcw,
  Trash2,
  FileText,
  Bell,
  Building2,
  User,
} from "lucide-react";
import { useNotifications } from "../context/notificationContext.jsx";
import logo from "./desynflow_logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unread } = useNotifications(); // get unread state

  const navigationIcons = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Package, label: "Manufactured Products", path: "/manu-products" },
    { icon: Layers, label: "Raw Materials", path: "/raw-materials" },
    { icon: MapPin, label: "Warehouse Locations", path: "/inv-location" },
    { icon: MoveRight, label: "Stock Movements", path: "/stock-movement" },
    { icon: Send, label: "Transfer Requests", path: "/transfer-request" },
    { icon: RotateCcw, label: "Stock Reorder Requests", path: "/s-reorder-requests" },
    { icon: Trash2, label: "Disposal Materials", path: "/disposal-materials" },
    { icon: FileText, label: "Audit Log", path: "/audit-logs" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
  ];

  return (
    <div className="shadow-sm border-b border-gray-700" style={{ backgroundColor: "#2B1B0E"}}>
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/home")}>
          {/* <div className="p-2 rounded-lg" style={{ backgroundColor: "#FFFFFF" }}>
            <Building2 className="w-6 h-6" style={{ color: "#000000" }} />
          </div>
          <h1 className="text-xl font-semibold" style={{ color: "#FFFFFF" }}>
            Warehouse Management
          </h1> */}
          <img
            src={logo}
            alt="Logo"
            className="w-30 h-30 object-contain"
          />
        </div>

        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="p-2 rounded-full" style={{ backgroundColor: "#FFFFFF" }}>
            <User className="w-5 h-5" style={{ color: "#2B1B0E" }} />
          </div>
          <span className="font-medium" style={{ color: "#FFFFFF" }}>
            Profile
          </span>
        </div>
      </div>

      {/* Bottom Navigation Icons */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-center space-x-4">
          {navigationIcons.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`
                  cursor-pointer relative group flex items-center px-3 py-2 rounded-lg transition-all duration-200
                  ${isActive ? "bg-[#AAB396] text-[#37353E]" : "text-white hover:bg-[#3D2914]"}
                `}
              >
                <IconComponent className="w-5 h-5" />

                {/* Red dot for unread notifications */}
                {item.label === "Notifications" && unread && (
                  <span className="absolute top-0 right-2 block w-2 h-2 rounded-full bg-red-500 "></span>
                )}

                {isActive && <span className="ml-2 text-sm">{item.label}</span>}

                {/* Tooltip on hover if not active */}
                {!isActive && (
                  <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                                px-2 py-1 bg-white text-black text-xs rounded opacity-0 
                                group-hover:opacity-100 transition-opacity duration-200 
                                whitespace-nowrap pointer-events-none"
                  >
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
