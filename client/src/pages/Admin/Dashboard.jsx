import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingInstitutions: 0,
    pendingCompanies: 0,
    totalApplications: 0,
    activeJobs: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const { userProfile } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch users count
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      // Fetch pending institutions and companies
      const pendingInstitutionsQuery = query(
        collection(db, 'users'), 
        where('role', '==', 'institute'),
        where('status', '==', 'pending')
      );
      
      const pendingCompaniesQuery = query(
        collection(db, 'users'),
        where('role', '==', 'company'),
        where('status', '==', 'pending')
      );

      const [institutionsSnapshot, companiesSnapshot] = await Promise.all([
        getDocs(pendingInstitutionsQuery),
        getDocs(pendingCompaniesQuery)
      ]);

      setStats({
        totalUsers: usersSnapshot.size,
        pendingInstitutions: institutionsSnapshot.size,
        pendingCompanies: companiesSnapshot.size,
        totalApplications: 0, // You'll need to implement this
        activeJobs: 0 // You'll need to implement this
      });

      // Mock recent activities - replace with actual data
      setRecentActivities([
        {
          id: 1,
          type: 'registration',
          message: 'New institute registered: National University of Lesotho',
          timestamp: new Date(),
          user: 'John Doe'
        },
        {
          id: 2,
          type: 'application',
          message: 'Student applied for Computer Science at Limkokwing',
          timestamp: new Date(Date.now() - 3600000),
          user: 'Jane Smith'
        },
        {
          id: 3,
          type: 'job_post',
          message: 'New job posted by Vodacom Lesotho',
          timestamp: new Date(Date.now() - 7200000),
          user: 'Vodacom HR'
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
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
          <div className="stat-icon pending">⏳</div>
          <div className="stat-info">
            <h3>{stats.pendingInstitutions}</h3>
            <p>Pending Institutions</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">⏳</div>
          <div className="stat-info">
            <h3>{stats.pendingCompanies}</h3>
            <p>Pending Companies</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon applications">📄</div>
          <div className="stat-info">
            <h3>{stats.totalApplications}</h3>
            <p>Total Applications</p>
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
            <span className="badge">{stats.pendingInstitutions} pending</span>
          </Link>

          <Link to="/admin/companies" className="action-card">
            <div className="action-icon">🏢</div>
            <h4>Manage Companies</h4>
            <p>Approve, edit, or remove company accounts</p>
            <span className="badge">{stats.pendingCompanies} pending</span>
          </Link>

          <Link to="/admin/admissions" className="action-card">
            <div className="action-icon">🎓</div>
            <h4>Monitor Admissions</h4>
            <p>Track student applications and admissions</p>
          </Link>

          <Link to="/admin/reports" className="action-card">
            <div className="action-icon">📊</div>
            <h4>View Reports</h4>
            <p>Generate system reports and analytics</p>
          </Link>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="recent-activities">
        <h2>Recent Activities</h2>
        <div className="activities-list">
          {recentActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                {activity.type === 'registration' && '📝'}
                {activity.type === 'application' && '🎓'}
                {activity.type === 'job_post' && '💼'}
              </div>
              <div className="activity-content">
                <p className="activity-message">{activity.message}</p>
                <span className="activity-time">
                  {activity.timestamp.toLocaleDateString()} at{' '}
                  {activity.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="activity-user">
                {activity.user}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;