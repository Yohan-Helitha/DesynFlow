import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-cream py-2 shadow-md' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="font-serif text-2xl font-bold text-brown-primary-700">
              Interiora
            </Link>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {['Home', 'Gallery', 'About Us', 'Contact Us'].map(item => <Link key={item} to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} className="text-brown-secondary-600 hover:text-brown-primary-700 font-medium transition-colors">
                {item}
              </Link>)}
            <Link to="/login" className="bg-brown-primary-700 text-cream px-4 py-2 rounded hover:bg-brown-primary-800 transition-colors flex items-center">
              Get Started
            </Link>
          </nav>
          {/* Mobile Menu Button */}
          <button className="md:hidden text-brown-secondary-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              {isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-3">
              {['Home', 'Gallery', 'About Us', 'Contact Us'].map(item => <Link key={item} to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} className="text-brown-secondary-600 hover:text-brown-primary-700 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                  {item}
                </Link>)}
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="bg-brown-primary-700 text-cream px-4 py-2 rounded hover:bg-brown-primary-800 transition-colors w-full mt-2 flex items-center justify-center">
                Get Started
              </Link>
            </div>
          </div>}
      </div>
    </header>;
};