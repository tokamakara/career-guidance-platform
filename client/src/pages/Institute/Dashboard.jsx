import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { institutionService } from '../../services/api/instituteService';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const InstituteDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentApplications, setRecentApplications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { userProfile } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, applications, coursesData] = await Promise.all([
        institutionService.getDashboard(),
        institutionService.getApplications(),
        institutionService.getCourses()
      ]);

      setStats(dashboardStats);
      setRecentApplications(applications.slice(0, 5));
      setCourses(coursesData.slice(0, 5));
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="institute-dashboard">
      <div className="page-header">
        <h1>Institution Dashboard</h1>
        <p>Welcome back, {userProfile?.firstName} {userProfile?.lastName}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-content">
            <div className="stat-value">{stats.totalApplications || 0}</div>
            <div className="stat-label">Total Applications</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-content">
            <div className="stat-value">{stats.totalCourses || 0}</div>
            <div className="stat-label">Courses</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-content">
            <div className="stat-value">{stats.pendingApplications || 0}</div>
            <div className="stat-label">Pending Review</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-content">
            <div className="stat-value">{stats.admittedStudents || 0}</div>
            <div className="stat-label">Admitted Students</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <Link to="/institute/courses" className="action-btn primary">
            Manage Courses
          </Link>
          <Link to="/institute/applications" className="action-btn secondary">
            View Applications
          </Link>
          <Link to="/institute/admissions" className="action-btn success">
            Manage Admissions
          </Link>
          <Link to="/institute/faculties" className="action-btn info">
            Manage Faculties
          </Link>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Recent Applications */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Recent Applications</h3>
            <Link to="/institute/applications" className="view-all">View All</Link>
          </div>
          
          {recentApplications.length === 0 ? (
            <div className="empty-state">
              <p>No applications yet</p>
            </div>
          ) : (
            <div className="applications-list">
              {recentApplications.map(application => (
                <div key={application.id} className="application-item">
                  <div className="application-info">
                    <h4>{application.studentName}</h4>
                    <p className="application-course">{application.courseName}</p>
                    <span className="application-date">
                      Applied: {new Date(application.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="application-status">
                    <span className={`status-badge status-${application.status}`}>
                      {application.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Courses Overview */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Your Courses</h3>
            <Link to="/institute/courses" className="view-all">View All</Link>
          </div>
          
          {courses.length === 0 ? (
            <div className="empty-state">
              <p>No courses created yet</p>
              <Link to="/institute/courses" className="create-btn">
                Create Your First Course
              </Link>
            </div>
          ) : (
            <div className="courses-list">
              {courses.map(course => (
                <div key={course.id} className="course-item">
                  <div className="course-info">
                    <h4>{course.name}</h4>
                    <p className="course-description">{course.description}</p>
                    <div className="course-stats">
                      <span className="stat">
                        {course.applications || 0} applications
                      </span>
                      <span className="stat">
                        {course.admitted || 0} admitted
                      </span>
                    </div>
                  </div>
                  <div className="course-actions">
                    <Link 
                      to={`/institute/courses/${course.id}`} 
                      className="view-btn"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="deadlines-section">
        <h3>Important Dates</h3>
        <div className="deadlines-list">
          <div className="deadline-item">
            <div className="deadline-date">Mar 15, 2024</div>
            <div className="deadline-title">Application Deadline for Semester 1</div>
          </div>
          <div className="deadline-item">
            <div className="deadline-date">Apr 1, 2024</div>
            <div className="deadline-title">Admission Decisions Due</div>
          </div>
          <div className="deadline-item">
            <div className="deadline-date">Apr 15, 2024</div>
            <div className="deadline-title">Student Registration Opens</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteDashboard;