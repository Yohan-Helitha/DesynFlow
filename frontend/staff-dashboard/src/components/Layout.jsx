import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function Layout({ children, activeIndex, setActiveIndex }) {
  return (
    <div className="flex min-h-screen bg-cream-primary">
      <Sidebar activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      <main className="flex-1 flex flex-col">
        <Header />
        <section className="p-6 flex-1">
          {children}
        </section>
      </main>
    </div>
  );
}
