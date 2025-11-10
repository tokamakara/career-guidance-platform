import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import ModeSwitcher from '../../../components/common/ModeSwitcher';
import './CareerDashboard.css';

const CareerDashboard = () => {
  const [stats, setStats] = useState({
    jobApplications: 0,
    interviews: 0,
    documents: 0,
    matchingJobs: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const { userProfile } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data - replace with actual Firestore queries
      setStats({
        jobApplications: 2,
        interviews: 1,
        documents: 3,
        matchingJobs: 12
      });

      setRecentJobs([
        {
          id: 1,
          title: 'Junior Software Developer',
          company: 'Vodacom Lesotho',
          location: 'Maseru',
          type: 'Full-time',
          postedDate: new Date('2024-01-20'),
          matchScore: 85
        },
        {
          id: 2,
          title: 'IT Support Specialist',
          company: 'Econet Telecom',
          location: 'Maseru',
          type: 'Full-time',
          postedDate: new Date('2024-01-18'),
          matchScore: 72
        },
        {
          id: 3,
          title: 'Data Analyst Intern',
          company: 'Central Bank of Lesotho',
          location: 'Maseru',
          type: 'Internship',
          postedDate: new Date('2024-01-15'),
          matchScore: 90
        }
      ]);

      setProfileCompletion(65);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load dashboard data'
      });
    } finally {
      setLoading(false);
    }
  };

  const getMatchBadge = (score) => {
    if (score >= 80) return 'badge-high';
    if (score >= 60) return 'badge-medium';
    return 'badge-low';
  };

  const calculateProfileCompletion = () => {
    // This would calculate based on actual profile data
    return profileCompletion;
  };

  if (loading) {
    return <div className="loading">Loading career dashboard...</div>;
  }

  return (
    <div className="career-dashboard">
      <ModeSwitcher />
      
      <div className="dashboard-header">
        <h1>Career Dashboard</h1>
        <p>Find your dream job and manage your career applications</p>
      </div>

      {/* Profile Completion */}
      <div className="profile-completion">
        <div className="completion-header">
          <h3>Profile Completion</h3>
          <span className="completion-percent">{calculateProfileCompletion()}%</span>
        </div>
        <div className="completion-bar">
          <div 
            className="completion-progress"
            style={{ width: `${calculateProfileCompletion()}%` }}
          ></div>
        </div>
        <p className="completion-note">
          Complete your profile to increase your chances with employers
        </p>
        <Link to="/student/profile" className="btn-outline">
          Complete Profile
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <h3>{stats.jobApplications}</h3>
            <p>Job Applications</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <h3>{stats.interviews}</h3>
            <p>Interviews</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-info">
            <h3>{stats.documents}</h3>
            <p>Documents</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-info">
            <h3>{stats.matchingJobs}</h3>
            <p>Matching Jobs</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/student/career/jobs" className="action-card">
            <div className="action-icon">🔍</div>
            <h4>Browse Jobs</h4>
            <p>Discover job opportunities matching your profile</p>
          </Link>

          <Link to="/student/career/applications" className="action-card">
            <div className="action-icon">📋</div>
            <h4>My Applications</h4>
            <p>Track your job applications and status</p>
          </Link>

          <Link to="/student/career/documents" className="action-card">
            <div className="action-icon">📁</div>
            <h4>My Documents</h4>
            <p>Upload and manage your career documents</p>
          </Link>

          <Link to="/student/profile" className="action-card">
            <div className="action-icon">👤</div>
            <h4>My Profile</h4>
            <p>Update your skills and preferences</p>
          </Link>
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="recommended-jobs">
        <div className="section-header">
          <h2>Recommended for You</h2>
          <Link to="/student/career/jobs" className="view-all-link">
            View All Jobs
          </Link>
        </div>

        <div className="jobs-list">
          {recentJobs.length === 0 ? (
            <div className="empty-state">
              <p>No recommended jobs yet. Complete your profile to get better matches!</p>
              <Link to="/student/profile" className="btn-primary">
                Complete Profile
              </Link>
            </div>
          ) : (
            recentJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-info">
                  <h4>{job.title}</h4>
                  <p className="company">{job.company}</p>
                  <div className="job-meta">
                    <span className="location">📍 {job.location}</span>
                    <span className="type">🕒 {job.type}</span>
                    <span className="date">
                      📅 {job.postedDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="job-actions">
                  <span className={`match-badge ${getMatchBadge(job.matchScore)}`}>
                    {job.matchScore}% Match
                  </span>
                  <Link to={`/student/career/jobs/apply/${job.id}`} className="btn-primary small">
                    Apply
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Career Tips */}
      <div className="career-tips">
        <h3>Career Tips</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">📝</div>
            <h4>Tailor Your Resume</h4>
            <p>Customize your resume for each job application to highlight relevant skills</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🔍</div>
            <h4>Research Companies</h4>
            <p>Learn about companies before interviews to show genuine interest</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">💡</div>
            <h4>Network</h4>
            <p>Connect with professionals in your desired industry</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🎯</div>
            <h4>Set Goals</h4>
            <p>Define clear career objectives and work towards them systematically</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerDashboard;