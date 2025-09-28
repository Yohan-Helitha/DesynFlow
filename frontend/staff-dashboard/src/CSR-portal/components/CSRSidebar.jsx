import React from 'react';

const CSRSidebar = ({ activeSection, onSelect, onLogout }) => {
  const sections = [
    { 
      id: 'requests', 
      name: 'Inspection Requests', 
      icon: '📋', 
      description: 'View and manage client inspection requests'
    },
    { 
      id: 'payments', 
      name: 'Payment Management', 
      icon: '💰', 
      description: 'Handle inspection costs and payments'
    },
    { 
      id: 'assign', 
      name: 'Inspector Assignment', 
      icon: '👨‍🔧', 
      description: 'Assign inspectors to requests'
    }
  ];

  return (
    <div className="bg-white shadow-lg h-screen w-80 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800 mb-1">CSR Portal</h1>
        <p className="text-sm text-gray-600">Customer Service Representative</p>
        <div className="flex items-center mt-3">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Online</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSelect(section.id)}
              className={`w-full text-left p-4 rounded-lg transition-all duration-200 group ${
                activeSection === section.id
                  ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                  : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl flex-shrink-0">{section.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm mb-1">{section.name}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">
                    {section.description}
                  </div>
                </div>
              </div>
              {activeSection === section.id && (
                <div className="mt-2 w-full h-0.5 bg-blue-500 rounded"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Footer with Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <span className="text-lg">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default CSRSidebar;