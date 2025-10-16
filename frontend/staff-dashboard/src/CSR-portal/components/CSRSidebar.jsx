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
      description: 'Search properties, view inspector locations, and assign inspectors'
    },
    { 
      id: 'status', 
      name: 'Assignment Status', 
      icon: '📊', 
      description: 'Track assignment progress and updates'
    },
    { 
      id: 'history', 
      name: 'Assignment History', 
      icon: '📚', 
      description: 'View completed and declined assignments'
    }
  ];

  return (
    <div className="bg-dark-brown shadow-lg h-screen w-80 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-brown-secondary">
        <h1 className="text-xl font-bold text-cream-primary mb-1">CSR Portal</h1>
        <p className="text-sm text-cream-light">Customer Service Representative</p>
        <div className="flex items-center mt-3">
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
                  ? 'bg-green-secondary border-l-4 border-soft-green text-cream-primary'
                  : 'hover:bg-brown-secondary/30 text-cream-light hover:text-cream-primary'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl flex-shrink-0">{section.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm mb-1">{section.name}</div>
                  <div className="text-xs text-cream-light/80 leading-relaxed">
                    {section.description}
                  </div>
                </div>
              </div>
              {activeSection === section.id && (
                <div className="mt-2 w-full h-0.5 bg-soft-green rounded"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Footer with Logout */}
      <div className="p-4 border-t border-brown-secondary">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-3 p-3 bg-warm-brown text-cream-primary rounded-lg shadow-sm hover:bg-red-brown transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-soft-green/40"
        >
          {/* Label */}
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default CSRSidebar;
