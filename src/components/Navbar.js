// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/upload-video">Upload Video</Link></li>
        <li><Link to="/see-results">See Results</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
