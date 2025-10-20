import React from 'react';
import { Link } from 'react-router-dom';
export const Footer = () => {
  return <footer className="bg-brown-secondary-800 text-cream-primary pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-serif font-bold mb-4">Interiora</h3>
            <p className="text-cream-medium mb-4">
              Transforming spaces into extraordinary experiences with our
              premium interior design management system.
            </p>
            <div className="flex space-x-4">
              {/* Social Icons */}
              {['Facebook', 'Instagram', 'Pinterest', 'LinkedIn'].map(social => <a key={social} href={`https://www.${social.toLowerCase()}.com/`} target="_blank" rel="noopener noreferrer" className="text-cream-medium hover:text-brown-primary-400 transition-colors" aria-label={social}>
                    <div className="w-8 h-8 border border-cream-medium rounded-full flex items-center justify-center hover:border-brown-primary-400">
                      {/* Placeholder for icon */}
                      <span className="text-xs">{social[0]}</span>
                    </div>
                  </a>)}
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'Gallery', 'About Us', 'Contact Us', 'Services', 'Projects'].map(item => <li key={item}>
                  <Link to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} className="text-cream-medium hover:text-brown-primary-400 transition-colors">
                    {item}
                  </Link>
                </li>)}
            </ul>
          </div>
          {/* Services */}
          <div>
            <h3 className="text-lg font-medium mb-4">Our Services</h3>
            <ul className="space-y-2">
              {['3D Modeling & Design', 'Interior Decoration', 'Space Planning', 'Remote Consultations', 'Project Management', 'Warranty Tracking'].map(item => <li key={item}>
                  <Link to="/services" className="text-cream-medium hover:text-brown-primary-400 transition-colors">
                    {item}
                  </Link>
                </li>)}
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h3 className="text-lg font-medium mb-4">Contact Us</h3>
            <address className="not-italic text-cream-medium space-y-2">
              <p>123 Design Avenue</p>
              <p>Luxury District, LD 10001</p>
              <p className="mt-4">Email: info@interiora.com</p>
              <p>Phone: +1 (555) 123-4567</p>
            </address>
          </div>
        </div>
        <div className="border-t border-brown-secondary-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-cream-medium text-sm">
              &copy; {new Date().getFullYear()} Interiora. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6">
                <li>
                  <Link to="/privacy-policy" className="text-cream-medium hover:text-brown-primary-400 text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="text-cream-medium hover:text-brown-primary-400 text-sm">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};