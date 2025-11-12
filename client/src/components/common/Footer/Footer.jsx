import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Career Guidance Platform</h3>
          <p>Connecting students with institutions and career opportunities in Lesotho.</p>
          <p className="footer-description">
            Empowering Lesotho's future leaders through education and career guidance.
          </p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/institutions">Institutions</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/faq">Frequently Asked Questions</Link></li>
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
        <div className="footer-bottom-content">
          <p className="footer-copyright">
            &copy; {currentYear} Career Guidance Platform. All rights reserved.
          </p>
          <p className="footer-credits">
            Developed by <strong>Toka Makaka</strong> - Limkokwing University Senior Student
          </p>
          <p className="footer-institution">
            Limkokwing University of Creative Technology, Lesotho
          </p>
        </div>
        <div className="footer-legal-links">
          <Link to="/terms">Terms and Conditions</Link>
          <span className="separator">|</span>
          <Link to="/privacy">Privacy Statement</Link>
          <span className="separator">|</span>
          <Link to="/faq">Accessibility</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
