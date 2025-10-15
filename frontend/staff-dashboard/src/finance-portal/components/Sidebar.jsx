import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  Calculator,
  FileText,
  CreditCard,
  ShoppingCart,
  DollarSign,
  Shield,
  ChevronDown,
  LogOut,
  Settings,
  BarChart3,
} from 'lucide-react';

export const Sidebar = ({ onNavigate, currentSection }) => {
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, section: 'dashboard' },
    { name: 'Inspection Management', icon: <ClipboardCheck size={18} />, section: 'inspections' },
    { name: 'Estimations', icon: <Calculator size={18} />, section: 'estimations' },
    { name: 'Quotations', icon: <FileText size={18} />, section: 'quotations' },
    { name: 'Payments', icon: <CreditCard size={18} />, section: 'payments' },
    { name: 'Purchase Orders', icon: <ShoppingCart size={18} />, section: 'purchaseOrders' },
    { name: 'Expenses', icon: <DollarSign size={18} />, section: 'expenses' },
    { name: 'Warranty', icon: <Shield size={18} />, section: 'warranty' },
    { name: 'Reports', icon: <BarChart3 size={18} />, section: 'reports' },
  ];

  const handleNavItemClick = (section) => {
    if (onNavigate) onNavigate(section);
  };

  return (
    <div className="w-60 bg-[#674636] text-[#FFF8E8] flex flex-col h-full">
      {/* Logo / Title */}
      <div className="p-6 text-2xl font-bold border-b border-[#AAB396]">DesynFlow</div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <ul>
          {navItems.map((item, index) => (
            <li key={index}>
              <a
                href="#"
                className={`flex items-center px-6 py-3 hover:bg-[#AAB396] hover:text-[#674636] transition-colors ${
                  currentSection === item.section ? 'bg-[#AAB396] text-[#674636]' : ''
                }`}
                onClick={() => handleNavItemClick(item.section)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings & Logout */}
      <div className="p-4 border-t border-[#AAB396]">
        <div className="flex items-center mb-4 cursor-pointer hover:bg-[#AAB396] hover:text-[#674636] p-2 rounded-md">
          <Settings size={18} className="mr-3 text-[#F7EED3]" />
          <span className="text-sm">Settings</span>
        </div>
        <div className="flex items-center cursor-pointer hover:bg-[#AAB396] hover:text-[#674636] p-2 rounded-md">
          <LogOut size={18} className="mr-3 text-[#F7EED3]" />
          <span className="text-sm">Logout</span>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-[#AAB396] flex items-center">
        <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] font-bold mr-3">
          AR
        </div>
        <div>
          <div className="font-medium">Ali Raza</div>
          <div className="text-xs text-[#F7EED3]">Finance Manager</div>
        </div>
        <ChevronDown size={16} className="ml-auto text-[#F7EED3]" />
      </div>
    </div>
  );
};
