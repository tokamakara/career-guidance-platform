import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../../services/api/applicationService';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import './EducationDashboard.css';

const EducationDashboard = () => {
  const [stats, setStats] = useState({
    applications: 0,
    pending: 0,
    admitted: 0,
    institutions: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { userProfile } = useAuth();
  const { addNotification, notifications } = useNotification();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const applicationsResult = await applicationService.getStudentApplications();

      // Handle different response formats
      let applications = [];
      
      if (applicationsResult && applicationsResult.success && applicationsResult.data) {
        // Standard API response: { success: true, data: [...] }
        applications = Array.isArray(applicationsResult.data) ? applicationsResult.data : [];
      } else if (applicationsResult && Array.isArray(applicationsResult)) {
        // Direct array response
        applications = applicationsResult;
      } else if (applicationsResult && applicationsResult.data) {
        // Response with data property
        applications = Array.isArray(applicationsResult.data) ? applicationsResult.data : [];
      } else {
        // Empty or unexpected format
        applications = [];
        console.warn('Unexpected response format:', applicationsResult);
      }
      
      // Calculate stats
      const pendingCount = applications.filter(app => app.status === 'pending' || app.status === 'under-review').length;
      const admittedCount = applications.filter(app => app.status === 'admitted' || app.status === 'accepted').length;
      const institutionsCount = new Set(applications.map(app => app.institutionId).filter(Boolean)).size;

      setStats({
        applications: applications.length,
        pending: pendingCount,
        admitted: admittedCount,
        institutions: institutionsCount
      });

      setRecentApplications(applications.slice(0, 3));

    } catch (error) {
      // Only log actual errors (not empty data scenarios)
      if (error.message && !error.message.includes('returning empty')) {
        console.warn('Error fetching dashboard data:', error.message);
      }
      
      // Set default stats (empty data is normal, not an error)
      setStats({
        applications: 0,
        pending: 0,
        admitted: 0,
        institutions: 0
      });
      setRecentApplications([]);
      
      // Only show notification for auth errors or actual failures
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        // Auth errors are handled by auth context, don't show notification here
        return;
      }
      
      // Don't show notifications for empty data - it's normal if user has no applications
      // Only show for actual unexpected errors
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'badge-warning', text: 'Pending' },
      admitted: { class: 'badge-success', text: 'Admitted' },
      rejected: { class: 'badge-danger', text: 'Rejected' },
      waiting: { class: 'badge-info', text: 'Waiting List' }
    };
    
    const config = statusConfig[status] || { class: 'badge-secondary', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return <div className="loading">Loading education dashboard...</div>;
  }

  return (
    <div className="education-dashboard">
      
      <div className="dashboard-header">
        <h1>Education Dashboard</h1>
        <p>Welcome back, {userProfile?.firstName}! Manage your institution applications and track admissions</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" />
          <div className="stat-info">
            <h3>{stats.applications}</h3>
            <p>Total Applications</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" />
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Pending Reviews</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" />
          <div className="stat-info">
            <h3>{stats.admitted}</h3>
            <p>Admission Offers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" />
          <div className="stat-info">
            <h3>{stats.institutions}</h3>
            <p>Institutions Applied</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/student/education/institutions" className="action-card">
            <div className="action-icon" />
            <h4>Browse Institutions</h4>
            <p>Discover universities and colleges in Lesotho</p>
          </Link>

          <Link to="/student/education/apply" className="action-card">
            <div className="action-icon" />
            <h4>Apply to Courses</h4>
            <p>Submit applications to your preferred programs</p>
          </Link>

          <Link to="/student/education/applications" className="action-card">
            <div className="action-icon" />
            <h4>My Applications</h4>
            <p>Track your application status and updates</p>
          </Link>

          <Link to="/student/education/results" className="action-card">
            <div className="action-icon" />
            <h4>Admission Results</h4>
            <p>View your admission decisions</p>
          </Link>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Applications</h2>
          <Link to="/student/education/applications" className="view-all-link">
            View All
          </Link>
        </div>

        <div className="applications-list">
          {recentApplications.length === 0 ? (
            <div className="empty-state">
              <p>No applications yet. Start by browsing institutions!</p>
              <Link to="/student/education/institutions" className="btn-primary">
                Browse Institutions
              </Link>
            </div>
          ) : (
            recentApplications.map(application => (
              <div key={application.id} className="application-card">
                <div className="application-info">
                  <h4>{application.courseName}</h4>
                  <p className="institution">{application.institutionName}</p>
                  <span className="applied-date">
                    Applied: {new Date(application.applicationDate?.toDate?.() || application.applicationDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="application-status">
                  {getStatusBadge(application.status)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationDashboard;