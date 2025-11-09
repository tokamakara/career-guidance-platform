import React, { useState, useEffect } from 'react';
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
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [applicationsResult] = await Promise.all([
        applicationService.getStudentApplications()
      ]);

      const applications = applicationsResult.data || [];
      
      setStats({
        applications: applications.length,
        pending: applications.filter(app => app.status === 'pending').length,
        admitted: applications.filter(app => app.status === 'admitted').length,
        institutions: new Set(applications.map(app => app.institutionId)).size
      });

      setRecentApplications(applications.slice(0, 3));

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
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>{stats.applications}</h3>
            <p>Total Applications</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Pending Reviews</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-info">
            <h3>{stats.admitted}</h3>
            <p>Admission Offers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏫</div>
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
            <div className="action-icon">🔍</div>
            <h4>Browse Institutions</h4>
            <p>Discover universities and colleges in Lesotho</p>
          </Link>

          <Link to="/student/education/apply" className="action-card">
            <div className="action-icon">📝</div>
            <h4>Apply to Courses</h4>
            <p>Submit applications to your preferred programs</p>
          </Link>

          <Link to="/student/education/applications" className="action-card">
            <div className="action-icon">📋</div>
            <h4>My Applications</h4>
            <p>Track your application status and updates</p>
          </Link>

          <Link to="/student/education/results" className="action-card">
            <div className="action-icon">✅</div>
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