import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { institutionService } from '../../services/api/instituteService';
import Table from '../../components/ui/Table';
import './Applications.css';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    course: '',
    status: '',
    dateRange: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { userProfile } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appsData, coursesData] = await Promise.all([
        institutionService.getApplications(),
        institutionService.getCourses()
      ]);
      setApplications(appsData);
      setCourses(coursesData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (filters.course) {
      filtered = filtered.filter(app => app.courseId === filters.course);
    }

    if (filters.status) {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    if (filters.dateRange) {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filtered = filtered.filter(app => new Date(app.appliedAt) >= cutoffDate);
    }

    setFilteredApplications(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getApplicationStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const reviewed = applications.filter(app => app.status === 'under_review').length;
    const admitted = applications.filter(app => app.status === 'admitted').length;
    
    return { total, pending, reviewed, admitted };
  };

  const columns = [
    {
      header: 'Student',
      key: 'studentName',
      width: '20%',
      render: (row) => (
        <div className="student-info">
          <div className="student-name">{row.studentName}</div>
          <div className="student-email">{row.studentEmail}</div>
        </div>
      )
    },
    {
      header: 'Course',
      key: 'courseName',
      width: '20%'
    },
    {
      header: 'Applied Date',
      key: 'appliedAt',
      width: '15%',
      render: (row) => new Date(row.appliedAt).toLocaleDateString()
    },
    {
      header: 'Status',
      key: 'status',
      width: '15%',
      render: (row) => (
        <span className={`status-badge status-${row.status}`}>
          {row.status.replace('_', ' ')}
        </span>
      )
    },
    {
      header: 'Qualification',
      key: 'qualified',
      width: '15%',
      render: (row) => (
        <span className={`qualification-status ${row.qualified ? 'qualified' : 'not-qualified'}`}>
          {row.qualified ? 'Qualified' : 'Not Qualified'}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      width: '15%',
      render: (row) => (
        <div className="action-buttons">
          <button 
            className="view-btn"
            onClick={() => viewApplicationDetails(row)}
          >
            View
          </button>
        </div>
      )
    }
  ];

  const viewApplicationDetails = (application) => {
    // Implement application details view
    console.log('View application:', application);
  };

  const stats = getApplicationStats();

  return (
    <div className="applications-page">
      <div className="page-header">
        <h1>Student Applications</h1>
        <p>Review and manage all student applications</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Statistics */}
      <div className="application-stats">
        <div className="stat-card total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card reviewed">
          <div className="stat-value">{stats.reviewed}</div>
          <div className="stat-label">Under Review</div>
        </div>
        <div className="stat-card admitted">
          <div className="stat-value">{stats.admitted}</div>
          <div className="stat-label">Admitted</div>
        </div>
      </div>

      {/* Filters */}
      <div className="application-filters">
        <h3>Filter Applications</h3>
        <div className="filter-grid">
          <div className="filter-group">
            <label>Course</label>
            <select
              value={filters.course}
              onChange={(e) => handleFilterChange('course', e.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="admitted">Admitted</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <option value="">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="applications-table">
        <div className="table-header">
          <h3>
            Applications
            <span className="filtered-count">
              ({filteredApplications.length} of {applications.length})
            </span>
          </h3>
        </div>

        <Table
          columns={columns}
          data={filteredApplications}
          loading={loading}
          emptyMessage="No applications found matching your criteria"
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="export-btn">
            Export Applications
          </button>
          <button className="bulk-action-btn">
            Bulk Status Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default Applications;