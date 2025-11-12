import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
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
      // Remove mock data; use empty defaults until real data is wired
      setStats({
        jobApplications: 0,
        interviews: 0,
        documents: 0,
        matchingJobs: 0
      });

      // No hardcoded jobs
      setRecentJobs([]);

      // Basic completion default to 0 until computed from profile
      setProfileCompletion(0);

    } catch (error) {
      // Only log if it's an actual error (not empty data scenario)
      if (error.message && !error.message.includes('returning empty')) {
        console.warn('Error fetching dashboard data:', error.message);
      }
      
      // Set default stats (empty data is normal, not an error)
      setStats({
        jobApplications: 0,
        interviews: 0,
        documents: 0,
        matchingJobs: 0
      });
      setRecentJobs([]);
      setProfileCompletion(0);
      
      // Only show notification for auth errors
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        // Auth errors are handled by auth context, don't show notification here
        return;
      }
      
      // Don't show notifications for empty data - it's normal if user has no job data
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
    // Keep current simple value; can be replaced with real calculation
    return profileCompletion;
  };

  if (loading) {
    return <div className="loading">Loading career dashboard...</div>;
  }

  return (
    <div className="career-dashboard">
      
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
          <div className="stat-icon" />
          <div className="stat-info">
            <h3>{stats.jobApplications}</h3>
            <p>Job Applications</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" />
          <div className="stat-info">
            <h3>{stats.interviews}</h3>
            <p>Interviews</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" />
          <div className="stat-info">
            <h3>{stats.documents}</h3>
            <p>Documents</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" />
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
            <div className="action-icon" />
            <h4>Browse Jobs</h4>
            <p>Discover job opportunities matching your profile</p>
          </Link>

          <Link to="/student/career/applications" className="action-card">
            <div className="action-icon" />
            <h4>My Applications</h4>
            <p>Track your job applications and status</p>
          </Link>

          <Link to="/student/career/documents" className="action-card">
            <div className="action-icon" />
            <h4>My Documents</h4>
            <p>Upload and manage your career documents</p>
          </Link>

          <Link to="/student/profile" className="action-card">
            <div className="action-icon" />
            <h4>My Profile</h4>
            <p>Update your skills and preferences</p>
          </Link>
        </div>
      </div>

      {/* Recommended Jobs (hidden until connected to real data) */}
      {recentJobs.length > 0 && (
        <div className="recommended-jobs">
          <div className="section-header">
            <h2>Recommended for You</h2>
            <Link to="/student/career/jobs" className="view-all-link">
              View All Jobs
            </Link>
          </div>

          <div className="jobs-list">
            {recentJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-info">
                  <h4>{job.title}</h4>
                  <p className="company">{job.company}</p>
                  <div className="job-meta">
                    <span className="location">{job.location}</span>
                    <span className="type">{job.type}</span>
                    <span className="date">{job.postedDate.toLocaleDateString()}</span>
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
            ))}
          </div>
        </div>
      )}

      {/* Career Tips */}
      <div className="career-tips">
        <h3>Career Tips</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon" />
            <h4>Tailor Your Resume</h4>
            <p>Customize your resume for each job application to highlight relevant skills</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon" />
            <h4>Research Companies</h4>
            <p>Learn about companies before interviews to show genuine interest</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon" />
            <h4>Network</h4>
            <p>Connect with professionals in your desired industry</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon" />
            <h4>Set Goals</h4>
            <p>Define clear career objectives and work towards them systematically</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerDashboard;