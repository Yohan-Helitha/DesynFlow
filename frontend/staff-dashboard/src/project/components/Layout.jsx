import React from 'react';
import SidebarDynamic from './SidebarDynamic';
import Header from './Header';

export default function Layout({ children, activeIndex, setActiveIndex, userRole = "project-manager" }) {
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen bg-cream-primary">
      <SidebarDynamic 
        activeIndex={activeIndex} 
        setActiveIndex={setActiveIndex} 
        userRole={userRole}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col">
        <Header />
        <section className="p-6 flex-1">
          {children}
        </section>
      </main>
    </div>
  );
}
