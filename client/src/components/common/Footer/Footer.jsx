import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Career Guidance Platform</h3>
          <p>Connecting students with institutions and career opportunities in Lesotho.</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/institutions">Institutions</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact Info</h4>
          <p>Email: toka70518@gmail.com</p>
          <p>Phone: +266 5973 4278</p>
          <p>Address: Maseru, Lesotho</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 Career Guidance Platform. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;