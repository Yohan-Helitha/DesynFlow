import React, { useState } from 'react';
import "tailwindcss";
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
  ClipboardList
} from 'lucide-react';

const Navbar = () => {
  const [activeIcon, setActiveIcon] = useState(0);

  const navigationIcons = [
    { icon: Home, label: 'Home' },
    { icon: Package, label: 'Manufactured Products' },
    { icon: Layers, label: 'Raw Materials' },
    { icon: MapPin, label: 'Warehouse Locations' },
    { icon: MoveRight, label: 'Stock Movements' },
    { icon: Send, label: 'Transfer Requests' },
    { icon: RotateCcw, label: 'Stock Reorder Requests' },
    { icon: Trash2, label: 'Disposal Materials' },
    { icon: FileText, label: 'Audit Log' },
    { icon: Bell, label: 'Notifications' },
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800">
            Warehouse Management
          </h1>
        </div>

        {/* Right side - User Info */}
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-gray-700 font-medium">
            Warehouse Manager
          </span>
        </div>
      </div>

      {/* Bottom Navigation Icons */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-center space-x-2">
          {navigationIcons.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = index === activeIcon;
            
            return (
              <button
                key={index}
                onClick={() => setActiveIcon(index)}
                className={`
                  p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 relative group
                  ${isActive 
                    ? 'bg-blue-100 text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                  }
                `}
                title={item.label}
              >
                <IconComponent className="w-5 h-5" />
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
