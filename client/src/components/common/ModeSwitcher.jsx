import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMode } from '../../context/ModeContext'; // FIXED: ../../context not ../../../context
import { useAuth } from '../../context/AuthContext'; // FIXED: ../../context not ../../../context
import './ModeSwitcher.css';

const ModeSwitcher = () => {
  const { currentMode, switchMode, isEducationMode, isCareerMode } = useMode();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Only show for students
  if (userProfile?.role !== 'student') {
    return null;
  }

  const handleModeSwitch = (mode) => {
    switchMode(mode);
    
    // Navigate to appropriate dashboard based on mode
    if (mode === 'education') {
      if (!location.pathname.includes('/student/education')) {
        navigate('/student/education');
      }
    } else {
      if (!location.pathname.includes('/student/career')) {
        navigate('/student/career');
      }
    }
  };

  return (
    <div className="mode-switcher">
      <button
        className={`mode-button ${isEducationMode ? 'active' : ''}`}
        onClick={() => handleModeSwitch('education')}
      >
        <span className="mode-icon"></span>
        <span className="mode-text">Education</span>
      </button>
      
      <button
        className={`mode-button ${isCareerMode ? 'active' : ''}`}
        onClick={() => handleModeSwitch('career')}
      >
        <span className="mode-icon"></span>
        <span className="mode-text">Career</span>
      </button>
    </div>
  );
};

export default ModeSwitcher;