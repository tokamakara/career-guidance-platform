import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api/adminService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './AdminDashboard.css';
import '../../components/common/SkeletonLoader.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInstitutions: 0,
    totalCompanies: 0,
    totalApplications: 0,
    totalJobs: 0,
    pendingApprovals: {
      institutions: 0,
      companies: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { userProfile } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      
      if (response.success && response.data) {
        setStats({
          totalUsers: response.data.totalUsers || 0,
          totalInstitutions: response.data.totalInstitutions || 0,
          totalCompanies: response.data.totalCompanies || 0,
          totalApplications: response.data.totalApplications || 0,
          totalJobs: response.data.totalJobs || 0,
          pendingApprovals: {
            institutions: response.data.pendingApprovals?.institutions || 0,
            companies: response.data.pendingApprovals?.companies || 0
          }
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      const errorMessage = error.message || 'Failed to load dashboard data';
      setError(errorMessage);
      
      // Only show notification for actual errors (not empty data scenarios)
      if (errorMessage && !errorMessage.includes('returning empty') && !errorMessage.includes('No data')) {
        addNotification({
          type: 'error',
          title: 'Failed to Load Dashboard',
          message: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <div className="skeleton-line" style={{ width: '300px', height: '40px', marginBottom: '10px' }}></div>
          <div className="skeleton-line" style={{ width: '200px', height: '20px' }}></div>
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton-stat-card">
              <div className="skeleton-stat-icon"></div>
              <div className="skeleton-stat-content">
                <div className="skeleton-line skeleton-stat-value"></div>
                <div className="skeleton-line skeleton-stat-label"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {userProfile?.firstName}!</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">👥</div>
          <div className="stat-info">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon institutions">🏫</div>
          <div className="stat-info">
            <h3>{stats.totalInstitutions}</h3>
            <p>Total Institutions</p>
            {stats.pendingApprovals.institutions > 0 && (
              <span className="pending-badge">{stats.pendingApprovals.institutions} pending</span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon companies">🏢</div>
          <div className="stat-info">
            <h3>{stats.totalCompanies}</h3>
            <p>Total Companies</p>
            {stats.pendingApprovals.companies > 0 && (
              <span className="pending-badge">{stats.pendingApprovals.companies} pending</span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon applications">📄</div>
          <div className="stat-info">
            <h3>{stats.totalApplications}</h3>
            <p>Total Applications</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon jobs">💼</div>
          <div className="stat-info">
            <h3>{stats.totalJobs}</h3>
            <p>Total Jobs</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/admin/institutions" className="action-card">
            <div className="action-icon">🏫</div>
            <h4>Manage Institutions</h4>
            <p>Approve, edit, or remove educational institutions</p>
            {stats.pendingApprovals.institutions > 0 && (
              <span className="badge">{stats.pendingApprovals.institutions} pending</span>
            )}
          </Link>

          <Link to="/admin/companies" className="action-card">
            <div className="action-icon">🏢</div>
            <h4>Manage Companies</h4>
            <p>Approve, edit, or remove company accounts</p>
            {stats.pendingApprovals.companies > 0 && (
              <span className="badge">{stats.pendingApprovals.companies} pending</span>
            )}
          </Link>

          <Link to="/admin/applications-overview" className="action-card">
            <div className="action-icon">📋</div>
            <h4>Applications Overview</h4>
            <p>View all institute and company applications</p>
          </Link>

          <Link to="/admin/analytics" className="action-card">
            <div className="action-icon">📊</div>
            <h4>Analytics & Reports</h4>
            <p>Comprehensive analytics and reporting</p>
          </Link>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Quick Links */}
      <div className="quick-links">
        <h2>Quick Links</h2>
        <div className="links-grid">
          <Link to="/admin/applications-overview" className="link-card">
            <h4>Applications Overview</h4>
            <p>View institute and company applications</p>
          </Link>
          <Link to="/admin/analytics" className="link-card">
            <h4>Analytics & Reports</h4>
            <p>View comprehensive analytics</p>
          </Link>
          <Link to="/admin/admissions" className="link-card">
            <h4>Admissions Monitor</h4>
            <p>Monitor admission processes</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;