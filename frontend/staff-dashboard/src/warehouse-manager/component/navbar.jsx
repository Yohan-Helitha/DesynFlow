// import React from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   Home,
//   Package,
//   Layers,
//   MapPin,
//   MoveRight,
//   Send,
//   RotateCcw,
//   Trash2,
//   FileText,
//   Bell,
//   Building2,
//   User,
//   ShieldCheck,
//   Clipboard,
//   Boxes
// } from "lucide-react";
// import { useNotifications } from "../context/notificationContext.jsx";
// import logo from "./desynflow_logo.png";

// const Navbar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { unread } = useNotifications(); // get unread state

//   const navigationIcons = [
//     { icon: Home, label: "Home", path: "" },
//     { icon: Package, label: "Manufactured Products", path: "manufactured-products" },
//     { icon: Layers, label: "Raw Materials", path: "raw-materials" },
//     { icon: MapPin, label: "Warehouse Locations", path: "inventory-locations" },
//     { icon: MoveRight, label: "Stock Movements", path: "stock-movement" },
//     { icon: Send, label: "Transfer Requests", path: "transfer-request" },
//     { icon: RotateCcw, label: "Stock Reorder Requests", path: "reorder-request" },
//     { icon: Boxes, label: "Material Requests", path: "material-requests" },
//     { icon: Trash2, label: "Disposal Materials", path: "disposal-materials" },
//     { icon: ShieldCheck, label: "Warranty Claims", path: "warranty-claims" },
//     { icon: FileText, label: "Audit Log", path: "audit-logs" },
//     { icon: Clipboard, label: "Submit Reports", path: "submit-reports" },
//     { icon: Bell, label: "Notifications", path: "notifications" },
//   ];

//   return (
//     <div className="navbar-container bg-brown-primary text-cream-primary shadow-sm border-b border-brown-primary-300">
//       {/* Top Header */}
//       <div className="flex items-center justify-between px-6 py-4">
//         <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/home")}>
//           {/* <div className="navbar-logo-icon">
//             <Building2 />
//           </div>
//           <h1 className="navbar-title">
//             Warehouse Management
//           </h1> */}
//           {/* <img
//             src={logo}
//             alt="Logo"
//             className="w-30 h-30 object-contain"
//           /> */}
//         </div>

//         <div className="flex items-center space-x-3 cursor-pointer">
//           <div className="navbar-profile-icon">
//             <User />
//           </div>
//           <span className="navbar-profile-text">
//             Profile
//           </span>
//         </div>
//       </div>

//       {/* Bottom Navigation Icons */}
//       <div className="px-6 pb-4">
//         <div className="flex items-center justify-center space-x-4">
//           {navigationIcons.map((item, index) => {
//             const IconComponent = item.icon;
//             // For home route, check if we're at the warehouse-manager root
//             const isHome = item.path === "" && (location.pathname === "/warehouse-manager" || location.pathname === "/warehouse-manager/");
//             // For other routes, check if the current path ends with the item path
//             const isActive = isHome || (item.path !== "" && location.pathname.endsWith("/" + item.path));

//             return (
//               <button
//                 key={index}
//                 onClick={() => navigate(`/warehouse-manager/${item.path}`)}
//                 className={`
//                   cursor-pointer relative group flex items-center px-3 py-2 rounded-lg transition-all duration-200
//                   ${isActive ? "bg-green-primary text-brown-primary" : "text-cream-primary hover:bg-brown-primary-300 hover:text-cream-primary"}
//                 `}
//               >
//                 <IconComponent className="w-5 h-5" />

//                 {/* Red dot for unread notifications */}
//                 {item.label === "Notifications" && unread && (
//                   <span className="absolute top-0 right-2 block w-2 h-2 rounded-full bg-red-500 "></span>
//                 )}

//                 {isActive && <span className="ml-2 text-sm">{item.label}</span>}

//                 {/* Tooltip on hover if not active */}
//                 {!isActive && (
//                   <div
//                     className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
//                                 px-2 py-1 bg-white text-black text-xs rounded opacity-0 
//                                 group-hover:opacity-100 transition-opacity duration-200 
//                                 whitespace-nowrap pointer-events-none"
//                   >
//                     {item.label}
//                   </div>
//                 )}
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Navbar;


import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Palette,
  Box,
  Warehouse,
  ArrowRightLeft,
  Truck,
  ClipboardList,
  ShoppingBasket,
  Recycle,
  Award,
  BarChart3,
  Bell,
  User,
  FileText,
  Building2,
  Megaphone,
  Container,
  Factory
} from "lucide-react";
import { useNotifications } from "../context/notificationContext.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unread } = useNotifications();

  // Professional set with shortened labels for display, but full names for tooltips
  const professionalIcons = [
    { icon: LayoutDashboard, label: "Overview", fullLabel: "Overview", path: "" },
    { icon: Factory, label: "Products", fullLabel: "Manufactured Products", path: "manufactured-products" },
    { icon: Container, label: "Materials", fullLabel: "Raw Materials", path: "raw-materials" },
    { icon: Warehouse, label: "Locations", fullLabel: "Warehouse Locations", path: "inventory-locations" },
    { icon: ArrowRightLeft, label: "Movements", fullLabel: "Stock Movements", path: "stock-movement" },
    { icon: Truck, label: "Transfers", fullLabel: "Transfer Requests", path: "transfer-request" },
    { icon: ClipboardList, label: "Reorder", fullLabel: "Stock Reorder Requests", path: "reorder-request" },
    { icon: ShoppingBasket, label: "Requests", fullLabel: "Material Requests", path: "material-requests" },
    { icon: Recycle, label: "Disposal", fullLabel: "Disposal Materials", path: "disposal-materials" },
    { icon: Award, label: "Warranty", fullLabel: "Warranty Claims", path: "warranty-claims" },
    { icon: BarChart3, label: "Audit", fullLabel: "Audit Log", path: "audit-logs" },
    { icon: FileText, label: "Reports", fullLabel: "Submit Reports", path: "submit-reports" },
    { icon: Bell, label: "Alerts", fullLabel: "Notifications", path: "notifications" },
  ];

  return (
    <div className="navbar-container bg-brown-primary text-cream-primary shadow-sm border-b border-brown-primary-300">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/home")}>
          {/* Add your logo or title here if needed */}
        </div>

        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="navbar-profile-icon">
            <User />
          </div>
          <span className="navbar-profile-text">
            Profile
          </span>
        </div>
      </div>

      {/* Bottom Navigation Icons */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-center space-x-4">
          {professionalIcons.map((item, index) => {
            const IconComponent = item.icon;
            const isHome = item.path === "" && (location.pathname === "/warehouse-manager" || location.pathname === "/warehouse-manager/");
            const isActive = isHome || (item.path !== "" && location.pathname.endsWith("/" + item.path));

            return (
              <button
                key={index}
                onClick={() => navigate(`/warehouse-manager/${item.path}`)}
                className={`
                  cursor-pointer relative group flex items-center px-3 py-2 rounded-lg transition-all duration-200
                  ${isActive ? "bg-green-primary text-brown-primary" : "text-cream-primary hover:bg-brown-primary-300 hover:text-cream-primary"}
                `}
              >
                <IconComponent className="w-5 h-5" />

                {/* Red dot for unread notifications */}
                {item.fullLabel === "Notifications" && unread && (
                  <span className="absolute top-0 right-2 block w-2 h-2 rounded-full bg-red-500"></span>
                )}

                {/* Show shortened label when active */}
                {isActive && <span className="ml-2 text-sm font-medium">{item.label}</span>}

                {/* Enhanced tooltip showing full label on hover */}
                {!isActive && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                                px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 
                                group-hover:opacity-100 transition-opacity duration-200 
                                whitespace-nowrap pointer-events-none shadow-lg">
                    {item.fullLabel}
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