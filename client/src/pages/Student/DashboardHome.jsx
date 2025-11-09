import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMode } from '../../context/ModeContext';
import { useAuth } from '../../context/AuthContext';
import './StudentDashboard.css';

const StudentDashboardHome = () => {
  const { switchMode } = useMode();
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Default to education mode on first visit
    switchMode('education');
    navigate('/student/education');
  }, [switchMode, navigate]);

  const handleModeSelection = (mode) => {
    switchMode(mode);
    navigate(`/student/${mode}`);
  };

  return (
    <div className="dashboard-home">
      <div className="dashboard-hero">
        <h1>Welcome, {userProfile?.firstName}!</h1>
        <p>Choose your dashboard to get started</p>
      </div>

      <div className="dashboard-cards">
        <div 
          className="dashboard-card education-card"
          onClick={() => handleModeSelection('education')}
        >
          <div className="card-icon">🎓</div>
          <h3>Education Dashboard</h3>
          <p>Discover institutions, apply for courses, and track your admissions</p>
          <ul className="card-features">
            <li>Browse institutions in Lesotho</li>
            <li>Apply to courses (max 2 per institution)</li>
            <li>Track application status</li>
            <li>View admission results</li>
          </ul>
          <button className="card-button primary">Enter Education Dashboard</button>
        </div>

        <div 
          className="dashboard-card career-card"
          onClick={() => handleModeSelection('career')}
        >
          <div className="card-icon">💼</div>
          <h3>Career Dashboard</h3>
          <p>Upload transcripts, find jobs, and connect with employers</p>
          <ul className="card-features">
            <li>Upload academic transcripts</li>
            <li>Browse job opportunities</li>
            <li>Apply to matching positions</li>
            <li>Get job notifications</li>
          </ul>
          <button className="card-button secondary">Enter Career Dashboard</button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">0</div>
          <div className="stat-label">Course Applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">0</div>
          <div className="stat-label">Job Applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">0</div>
          <div className="stat-label">Admission Offers</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">0</div>
          <div className="stat-label">Documents Uploaded</div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardHome;