import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import './ScrollToTop.css';

const ScrollToTop = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {showScrollTop && (
        <button className="scroll-to-top-btn" onClick={scrollToTop}>
          <FaArrowUp />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;