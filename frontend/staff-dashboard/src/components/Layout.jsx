import React from 'react';
import SidebarDynamic from '../components/SidebarDynamic';
import Header from '../components/Header';

export default function Layout({ children, activeIndex, setActiveIndex, userRole = "project-manager" }) {
  return (
    <div className="flex min-h-screen bg-cream-primary">
      <SidebarDynamic 
        activeIndex={activeIndex} 
        setActiveIndex={setActiveIndex} 
        userRole={userRole}
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
