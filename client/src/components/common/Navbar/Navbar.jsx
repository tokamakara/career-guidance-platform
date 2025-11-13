import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { useMode } from '../../../context/ModeContext';
import ModeSwitcher from '../ModeSwitcher';
import NotificationBell from '../NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const { notifications, unreadCount } = useNotification();
  const { currentMode } = useMode();
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
      case 'student': return currentMode === 'education' ? '/student/education' : '/student/career';
      default: return '/';
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Get navigation menu items based on role
  const getNavMenuItems = () => {
    if (!userProfile) return [];
    
    switch (userProfile.role) {
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard' },
          { path: '/admin/institutions', label: 'Institutions' },
          { path: '/admin/companies', label: 'Companies' },
          { path: '/admin/admissions', label: 'Admissions' },
          { path: '/admin/reports', label: 'Reports' }
        ];
      case 'institute':
        return [
          { path: '/institute/dashboard', label: 'Dashboard' },
          { path: '/institute/faculties', label: 'Faculties' },
          { path: '/institute/courses', label: 'Courses' },
          { path: '/institute/applications', label: 'Applications' },
          { path: '/institute/admissions', label: 'Admissions' }
        ];
      case 'company':
        return [
          { path: '/company/dashboard', label: 'Dashboard' },
          { path: '/company/post-job', label: 'Post Job' },
          { path: '/company/applicants', label: 'Applicants' },
          { path: '/company/candidates', label: 'Find Candidates' }
        ];
      case 'student':
        return currentMode === 'education' 
          ? [
              { path: '/student/education', label: 'Dashboard' },
              { path: '/student/education/institutions', label: 'Browse Institutions' },
              { path: '/student/education/apply', label: 'Apply to Courses' },
              { path: '/student/education/applications', label: 'My Applications' },
              { path: '/student/education/results', label: 'Admission Results' }
            ]
          : [
              { path: '/student/career', label: 'Dashboard' },
              { path: '/student/career/jobs', label: 'Job Listings' },
              { path: '/student/career/applications', label: 'My Applications' },
              { path: '/student/career/documents', label: 'My Documents' }
            ];
      default:
        return [];
    }
  };

  const navMenuItems = getNavMenuItems();
  
  // Find the current active menu item based on the current route
  const getCurrentMenuLabel = () => {
    if (!navMenuItems.length) return 'Dashboard';
    
    // Find the active route
    const activeItem = navMenuItems.find(item => isActiveRoute(item.path));
    if (activeItem) return activeItem.label;
    
    // If no active route found, return the first item (usually Dashboard)
    return navMenuItems[0]?.label || 'Dashboard';
  };
  
  const currentMenuLabel = getCurrentMenuLabel();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-brand">
          <Link to="/" className="logo">
            <div className="logo-text">
              <span className="logo-line1">Career & Education</span>
              <span className="logo-line2">Gateway</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-menu">
          {currentUser ? (
            <>
              {/* Navigation Dropdown Menu */}
              {navMenuItems.length > 0 && (
                <div className={`nav-dropdown-container ${isNavDropdownOpen ? 'open' : ''}`}>
                  <button 
                    className="nav-dropdown-toggle"
                    onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                    onBlur={() => setTimeout(() => setIsNavDropdownOpen(false), 200)}
                  >
                    <span className="nav-dropdown-label">{currentMenuLabel}</span>
                    <span className="nav-dropdown-arrow">▼</span>
                  </button>
                  {isNavDropdownOpen && (
                    <div className="nav-dropdown-menu">
                      {navMenuItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`nav-dropdown-item ${isActiveRoute(item.path) ? 'active' : ''}`}
                          onClick={() => setIsNavDropdownOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Right side items */}
              <div className="navbar-right-items">
                {/* Student Mode Switcher */}
                {userProfile?.role === 'student' && <ModeSwitcher />}
                
                {/* Notifications - Show for all authenticated users */}
                {currentUser && <NotificationBell />}
                
                {/* User Menu - Show for all authenticated users */}
                {currentUser && (
                  <div className="navbar-user">
                    <div className="user-info">
                      <span className="user-name">
                        {userProfile?.firstName && userProfile?.lastName 
                          ? `${userProfile.firstName} ${userProfile.lastName}`
                          : userProfile?.email?.split('@')[0] || 'User'}
                      </span>
                      <span className="user-role">{userProfile?.role || 'user'}</span>
                    </div>
                    <div className="user-dropdown">
                      <button className="dropdown-toggle">
                        <div className="user-avatar">
                          {userProfile?.firstName?.charAt(0) && userProfile?.lastName?.charAt(0)
                            ? `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`
                            : userProfile?.email?.charAt(0).toUpperCase() || 'U'}
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
                )}
              </div>
            </>
          ) : (
            <>
              {/* Public Navigation Links */}
              <div className="navbar-public-links">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/institutions" className="nav-link">Institutions</Link>
                <Link to="/about" className="nav-link">About</Link>
                <Link to="/contact" className="nav-link">Contact</Link>
              </div>
              
              {/* Auth Buttons */}
              <div className="navbar-auth">
                <Link to="/login" className="auth-link">
                  Sign In
                </Link>
                <Link to="/register" className="auth-button">
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="navbar-mobile-controls">
          {currentUser && (
            <button 
              className="mobile-logout-button"
              onClick={handleLogout}
              aria-label="Logout"
            >
              Logout
            </button>
          )}
          <button 
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

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
                  {/* Navigation Menu Items */}
                  {navMenuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`nav-link ${isActiveRoute(item.path) ? 'active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  {/* Student Mode Switcher for Mobile */}
                  {userProfile?.role === 'student' && (
                    <div className="mobile-mode-switcher">
                      <ModeSwitcher />
                    </div>
                  )}
                  
                  <div className="mobile-nav-divider"></div>
                  
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
                  
                  <button 
                    onClick={handleLogout}
                    className="nav-link logout"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Public Navigation Links for Mobile */}
                <div className="mobile-nav-links">
                  <Link 
                    to="/" 
                    className="nav-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/institutions" 
                    className="nav-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Institutions
                  </Link>
                  <Link 
                    to="/about" 
                    className="nav-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link 
                    to="/contact" 
                    className="nav-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </div>
                
                <div className="mobile-nav-divider"></div>
                
                {/* Auth Buttons for Mobile */}
                <div className="mobile-auth">
                  <Link 
                    to="/login" 
                    className="auth-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="auth-button"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;