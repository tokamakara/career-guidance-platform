import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { useNotification } from '../../../../context/NotificationContext';
import { useMode } from '../../../../context/ModeContext';
import ModeSwitcher from '../ModeSwitcher';
import NotificationBell from '../NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const { notifications, unreadCount } = useNotification();
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getDashboardPath = () => {
    if (!userProfile) return '/';
    
    switch (userProfile.role) {
      case 'admin': return '/admin/dashboard';
      case 'institute': return '/institute/dashboard';
      case 'company': return '/company/dashboard';
      case 'student': return '/student/dashboard';
      default: return '/';
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-brand">
          <Link to="/" className="logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">CareerGuideLS</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-menu">
          {currentUser ? (
            <>
              {/* Student Mode Switcher */}
              {userProfile?.role === 'student' && <ModeSwitcher />}
              
              {/* Notifications */}
              <NotificationBell />
              
              {/* User Menu */}
              <div className="navbar-user">
                <div className="user-info">
                  <span className="user-name">
                    {userProfile?.firstName} {userProfile?.lastName}
                  </span>
                  <span className="user-role">{userProfile?.role}</span>
                </div>
                <div className="user-dropdown">
                  <button className="dropdown-toggle">
                    <div className="user-avatar">
                      {userProfile?.firstName?.charAt(0)}{userProfile?.lastName?.charAt(0)}
                    </div>
                  </button>
                  
                  <div className="dropdown-menu">
                    <Link 
                      to={getDashboardPath()} 
                      className="dropdown-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/settings" 
                      className="dropdown-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button 
                      onClick={handleLogout}
                      className="dropdown-item logout"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="auth-link">
                Login
              </Link>
              <Link to="/register" className="auth-button">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            {currentUser ? (
              <>
                <div className="mobile-user-info">
                  <div className="user-avatar">
                    {userProfile?.firstName?.charAt(0)}{userProfile?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <div className="user-name">
                      {userProfile?.firstName} {userProfile?.lastName}
                    </div>
                    <div className="user-role">{userProfile?.role}</div>
                  </div>
                </div>
                
                <div className="mobile-nav-links">
                  <Link 
                    to={getDashboardPath()} 
                    className={`nav-link ${isActiveRoute(getDashboardPath()) ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/profile" 
                    className="nav-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="nav-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  
                  {/* Student Mode Switcher for Mobile */}
                  {userProfile?.role === 'student' && (
                    <div className="mobile-mode-switcher">
                      <ModeSwitcher />
                    </div>
                  )}
                  
                  <button 
                    onClick={handleLogout}
                    className="nav-link logout"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="mobile-auth">
                <Link 
                  to="/login" 
                  className="nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="nav-link auth-button"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;