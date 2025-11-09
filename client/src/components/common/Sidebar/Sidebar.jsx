import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { useMode } from '../../../../context/ModeContext';
import './Sidebar.css';

const Sidebar = () => {
  const { userProfile } = useAuth();
  const { currentMode } = useMode();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Admin Sidebar
  const adminMenu = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/institutions', icon: '🏫', label: 'Institutions' },
    { path: '/admin/companies', icon: '🏢', label: 'Companies' },
    { path: '/admin/admissions', icon: '🎓', label: 'Admissions' },
    { path: '/admin/reports', icon: '📈', label: 'Reports' }
  ];

  // Institute Sidebar
  const instituteMenu = [
    { path: '/institute/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/institute/faculties', icon: '🏛️', label: 'Faculties' },
    { path: '/institute/courses', icon: '📚', label: 'Courses' },
    { path: '/institute/applications', icon: '📄', label: 'Applications' },
    { path: '/institute/admissions', icon: '✅', label: 'Admissions' },
    { path: '/institute/profile', icon: '👤', label: 'Profile' }
  ];

  // Student Education Sidebar
  const studentEducationMenu = [
    { path: '/student/education', icon: '📊', label: 'Dashboard' },
    { path: '/student/education/institutions', icon: '🏫', label: 'Browse Institutions' },
    { path: '/student/education/apply', icon: '📝', label: 'Apply to Courses' },
    { path: '/student/education/applications', icon: '📋', label: 'My Applications' },
    { path: '/student/education/results', icon: '🎓', label: 'Admission Results' }
  ];

  // Student Career Sidebar
  const studentCareerMenu = [
    { path: '/student/career', icon: '📊', label: 'Dashboard' },
    { path: '/student/career/jobs', icon: '💼', label: 'Job Listings' },
    { path: '/student/career/applications', icon: '📄', label: 'My Applications' },
    { path: '/student/career/documents', icon: '📁', label: 'My Documents' }
  ];

  // Company Sidebar
  const companyMenu = [
    { path: '/company/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/company/post-job', icon: '➕', label: 'Post Job' },
    { path: '/company/applicants', icon: '👥', label: 'Applicants' },
    { path: '/company/candidates', icon: '🔍', label: 'Find Candidates' },
    { path: '/company/profile', icon: '👤', label: 'Profile' }
  ];

  const getMenuItems = () => {
    if (!userProfile) return [];
    
    switch (userProfile.role) {
      case 'admin':
        return adminMenu;
      case 'institute':
        return instituteMenu;
      case 'company':
        return companyMenu;
      case 'student':
        return currentMode === 'education' ? studentEducationMenu : studentCareerMenu;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path} className="sidebar-item">
              <Link
                to={item.path}
                className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;