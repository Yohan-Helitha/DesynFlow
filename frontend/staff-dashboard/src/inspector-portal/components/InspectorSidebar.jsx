import React from 'react';

const InspectorSidebar = ({ activeSection, onSelect, onLogout, inspectorName }) => {
  const sidebarItems = [
    {
      id: 'location',
      name: 'Location Management',
      icon: '📍',
      description: 'Update location & availability'
    },
    {
      id: 'inspection',
      name: 'Inspection Forms',
      icon: '📋',
      description: 'Dynamic inspection forms'
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: '📄',
      description: 'View generated reports'
    }
  ];

  return (
    <div className="w-80 bg-cream-primary shadow-xl flex flex-col">
      {/* Header */}
      <div className="p-6 bg-brown-primary text-cream-primary">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-cream-light rounded-full flex items-center justify-center">
            <span className="text-2xl">👨‍🔧</span>
          </div>
          <div>
            <h2 className="text-xl text-cream-light font-bold">Inspector Portal</h2>
            <p className="text-cream-light text-sm">Welcome, {inspectorName}</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-6">
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`group cursor-pointer p-4 rounded-lg transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-cream-light border-l-4 border-soft-green shadow-md'
                  : 'hover:bg-cream-light hover:shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className={`font-semibold ${
                    activeSection === item.id ? 'text-soft-green' : 'text-brown-primary'
                  }`}>
                    {item.name}
                  </div>
                  <div className={`text-sm ${
                    activeSection === item.id ? 'text-soft-green' : 'text-brown-secondary'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </div>
              {activeSection === item.id && (
                <div className="ml-11 mt-2">
                  <div className="w-full h-1 bg-green-primary rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-brown-secondary">
        <button
          onClick={onLogout}
          className="w-full bg-red-brown text-cream-primary py-3 px-4 rounded-lg font-semibold hover:bg-dark-brown transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default InspectorSidebar;
