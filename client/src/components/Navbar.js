// Navbar.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="container">
        <div className="logo">Ambulo Properties</div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/">Properties</Link></li>
          <li><Link to="/">About Us</Link></li>
          <li><Link to="/">Contact Us</Link></li>
          <li><Link to="/" className="nav-link">Apply as Tenant</Link></li>
          <li><Link to="/login" className="nav-link">Login</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default NavBar;