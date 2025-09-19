import React from 'react'
import { useNavigate } from 'react-router-dom'
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
} from 'lucide-react'

export const Sidebar = ({ onNavigate }) => {
  const navigate = useNavigate();
  const navItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      active: true,
      section: 'dashboard',
    },
    {
      name: 'Inspection Management',
      icon: <ClipboardCheck size={18} />,
      section: 'inspections',
    },
    {
      name: 'Estimations',
      icon: <Calculator size={18} />,
    },
    {
      name: 'Quotations',
      icon: <FileText size={18} />,
    },
    {
      name: 'Payments',
      icon: <CreditCard size={18} />,
    },
    {
      name: 'Purchase Orders',
      icon: <ShoppingCart size={18} />,
    },
    {
      name: 'Expenses',
      icon: <DollarSign size={18} />,
    },
    {
      name: 'Warranty',
      icon: <Shield size={18} />,
    },
  ]

  const handleNavItemClick = (section) => {
    // Use react-router navigation for main sections
    if (section === 'dashboard') {
      navigate('/');
    } else if (section === 'inspections') {
      navigate('/inspection-management');
    } else if (onNavigate) {
      onNavigate(section);
    }
  }

  return (
    <div className="w-60 bg-indigo-600 text-white flex flex-col h-full">
      <div className="p-6 text-2xl font-bold">DesynFlow</div>
      <nav className="flex-1">
        <ul>
          {navItems.map((item, index) => (
            <li key={index}>
              <a
                href="#"
                className={`flex items-center px-6 py-3 hover:bg-indigo-700 transition-colors ${
                  item.active ? 'bg-indigo-700' : ''
                }`}
                onClick={() => handleNavItemClick(item.section || '')}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-indigo-500 flex items-center">
        <div className="w-10 h-10 rounded-full bg-indigo-400 flex items-center justify-center text-indigo-800 font-bold mr-3">
          AR
        </div>
        <div>
          <div className="font-medium">Ali Raza</div>
          <div className="text-xs text-indigo-200">Web Developer</div>
        </div>
        <ChevronDown size={16} className="ml-auto" />
      </div>
    </div>
  )
}
