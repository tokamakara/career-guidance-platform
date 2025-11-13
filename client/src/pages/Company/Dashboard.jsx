import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { companyService } from '../../services/api/companyService';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const CompanyDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, userProfile } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get dashboard stats
      const statsResponse = await companyService.getDashboardStats();
      const dashboardStats = statsResponse.data || statsResponse || {};
      
      // Get jobs
      const jobs = await companyService.getCompanyJobs();
      
      // Get recent applicants (from all jobs)
      let allApplicants = [];
      try {
        // Get applicants from all jobs
        for (const job of jobs.slice(0, 5)) {
          try {
            const applicants = await companyService.getJobApplicants(job.id);
            if (applicants && applicants.data) {
              allApplicants.push(...(Array.isArray(applicants.data) ? applicants.data : []));
            } else if (Array.isArray(applicants)) {
              allApplicants.push(...applicants);
            }
          } catch (err) {
            // Skip if job has no applicants
            console.warn(`Failed to fetch applicants for job ${job.id}:`, err.message);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch recent applicants:', err.message);
      }

      setStats(dashboardStats);
      setRecentJobs(Array.isArray(jobs) ? jobs.slice(0, 5) : []);
      setRecentApplicants(allApplicants.slice(0, 5));
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  // If pending, this should be blocked by ProtectedRoute, but just in case
  if (userProfile?.status === 'pending') {
    return null; // ProtectedRoute will handle showing PendingApproval
  }

  return (
    <div className="company-dashboard">
      <div className="page-header">
        <h1>Company Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-content">
            <div className="stat-value">{stats.activeJobs || 0}</div>
            <div className="stat-label">Active Jobs</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-content">
            <div className="stat-value">{stats.totalApplicants || 0}</div>
            <div className="stat-label">Total Applicants</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-content">
            <div className="stat-value">{stats.shortlisted || 0}</div>
            <div className="stat-label">Shortlisted</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-content">
            <div className="stat-value">{stats.matchRate || '0%'}</div>
            <div className="stat-label">Avg Match Rate</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <Link to="/company/post-job" className="action-btn primary">
            Post New Job
          </Link>
          <Link to="/company/applicants" className="action-btn secondary">
            View Applicants
          </Link>
          <Link to="/company/filtered-candidates" className="action-btn success">
            Find Candidates
          </Link>
          <Link to="/company/profile" className="action-btn info">
            Update Profile
          </Link>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Recent Jobs */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Recent Job Postings</h3>
            <Link to="/company/jobs" className="view-all">View All</Link>
          </div>
          
          {recentJobs.length === 0 ? (
            <div className="empty-state">
              <p>No job postings yet</p>
              <Link to="/company/post-job" className="create-btn">
                Create Your First Job Post
              </Link>
            </div>
          ) : (
            <div className="jobs-list">
              {recentJobs.map(job => (
                <div key={job.id} className="job-item">
                  <div className="job-info">
                    <h4>{job.title}</h4>
                    <p className="job-meta">
                      Posted: {(() => {
                        if (!job.createdAt) return 'N/A';
                        try {
                          let date;
                          if (job.createdAt && typeof job.createdAt === 'object') {
                            if (job.createdAt.seconds) {
                              date = new Date(job.createdAt.seconds * 1000);
                            } else if (job.createdAt.toDate && typeof job.createdAt.toDate === 'function') {
                              date = job.createdAt.toDate();
                            } else if (job.createdAt._seconds) {
                              date = new Date(job.createdAt._seconds * 1000);
                            } else {
                              date = new Date(job.createdAt);
                            }
                          } else {
                            date = new Date(job.createdAt);
                          }
                          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                        } catch (e) {
                          return 'N/A';
                        }
                      })()} • 
                      Applicants: {job.applicants || 0}
                    </p>
                    <span className={`job-status ${job.status}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="job-actions">
                    <Link to={`/company/applicants?jobId=${job.id}`} className="view-btn">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applicants */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Recent Applicants</h3>
            <Link to="/company/applicants" className="view-all">View All</Link>
          </div>
          
          {recentApplicants.length === 0 ? (
            <div className="empty-state">
              <p>No applicants yet</p>
            </div>
          ) : (
            <div className="applicants-list">
              {recentApplicants.map(applicant => (
                <div key={applicant.id} className="applicant-item">
                  <div className="applicant-avatar">
                    {applicant.studentName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="applicant-info">
                    <h4>{applicant.studentName}</h4>
                    <p className="applicant-job">{applicant.jobTitle}</p>
                    <span className={`match-score ${applicant.matchScore >= 80 ? 'high' : 'medium'}`}>
                      {applicant.matchScore}% match
                    </span>
                  </div>
                  <div className="applicant-status">
                    <span className={`status-badge ${applicant.status}`}>
                      {applicant.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;