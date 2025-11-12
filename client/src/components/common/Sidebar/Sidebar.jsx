import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useMode } from '../../../context/ModeContext';
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
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/institutions', label: 'Institutions' },
    { path: '/admin/companies', label: 'Companies' },
    { path: '/admin/admissions', label: 'Admissions' },
    { path: '/admin/reports', label: 'Reports' }
  ];

  // Institute Sidebar
  const instituteMenu = [
    { path: '/institute/dashboard', label: 'Dashboard' },
    { path: '/institute/faculties', label: 'Faculties' },
    { path: '/institute/courses', label: 'Courses' },
    { path: '/institute/applications', label: 'Applications' },
    { path: '/institute/admissions', label: 'Admissions' },
    { path: '/institute/profile', label: 'Profile' }
  ];

  // Student Education Sidebar
  const studentEducationMenu = [
    { path: '/student/education', label: 'Dashboard' },
    { path: '/student/education/institutions', label: 'Browse Institutions' },
    { path: '/student/education/apply', label: 'Apply to Courses' },
    { path: '/student/education/applications', label: 'My Applications' },
    { path: '/student/education/results', label: 'Admission Results' }
  ];

  // Student Career Sidebar
  const studentCareerMenu = [
    { path: '/student/career', label: 'Dashboard' },
    { path: '/student/career/jobs', label: 'Job Listings' },
    { path: '/student/career/applications', label: 'My Applications' },
    { path: '/student/career/documents', label: 'My Documents' }
  ];

  // Company Sidebar
  const companyMenu = [
    { path: '/company/dashboard', label: 'Dashboard' },
    { path: '/company/post-job', label: 'Post Job' },
    { path: '/company/applicants', label: 'Applicants' },
    { path: '/company/candidates', label: 'Find Candidates' },
    { path: '/company/profile', label: 'Profile' }
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