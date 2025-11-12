import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api/adminService';
import { useNotification } from '../../context/NotificationContext';
import Table from '../../components/ui/Table';
import { exportToCSV, exportToExcel, formatDateRangeForFilename } from '../../utils/exportUtils';
import './ApplicationsOverview.css';
import '../../components/common/SkeletonLoader.css';

const ApplicationsOverview = () => {
  const [activeTab, setActiveTab] = useState('institute'); // 'institute', 'company', 'combined'
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    institutionId: '',
    courseId: '',
    companyId: '',
    jobId: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  const { addNotification } = useNotification();

  useEffect(() => {
    loadApplications();
  }, [activeTab, filters]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError('');

      let response;
      switch (activeTab) {
        case 'institute':
          response = await adminService.getInstituteApplications(filters);
          break;
        case 'company':
          response = await adminService.getCompanyApplications(filters);
          break;
        case 'combined':
          response = await adminService.getCombinedApplications(filters);
          break;
        default:
          response = await adminService.getInstituteApplications(filters);
      }

      if (response.success) {
        let filteredData = response.data || [];
        
        // Apply search filter if provided
        if (filters.search && filters.search.trim()) {
          const searchTerm = filters.search.toLowerCase().trim();
          filteredData = filteredData.filter(app => {
            // Search across multiple fields
            const searchableFields = [
              app.studentName,
              app.institutionName,
              app.companyName,
              app.courseName,
              app.jobTitle,
              app.studentEmail,
              app.status
            ].filter(Boolean).map(f => String(f).toLowerCase());
            
            return searchableFields.some(field => field.includes(searchTerm));
          });
        }
        
        setApplications(filteredData);
        setStats(response.stats || {});
        
        if (filteredData.length === 0 && filters.search) {
          addNotification({
            type: 'info',
            title: 'No Results',
            message: 'No applications found matching your search criteria'
          });
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load applications';
      setError(errorMessage);
      setApplications([]);
      setStats({});
      
      addNotification({
        type: 'error',
        title: 'Failed to Load Applications',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const getColumns = () => {
    if (activeTab === 'combined') {
      return [
        { header: 'Type', key: 'type', width: '10%', render: (row) => (
          <span className={`type-badge ${row.type}`}>
            {row.type === 'education' ? 'Education' : 'Job'}
          </span>
        )},
        { header: 'Applicant/Student', key: 'studentName', width: '20%' },
        { header: 'Institution/Company', key: 'institutionName', width: '20%', render: (row) => 
          row.institutionName || row.companyName || 'N/A'
        },
        { header: 'Course/Job', key: 'courseName', width: '20%', render: (row) => 
          row.courseName || row.jobTitle || 'N/A'
        },
        { header: 'Applied Date', key: 'applicationDate', width: '15%', render: (row) => {
          const date = row.applicationDate?.toDate ? row.applicationDate.toDate() : new Date(row.applicationDate);
          return date.toLocaleDateString();
        }},
        { header: 'Status', key: 'status', width: '15%', render: (row) => (
          <span className={`status-badge status-${row.status}`}>
            {row.status}
          </span>
        )}
      ];
    } else if (activeTab === 'company') {
      return [
        { header: 'Candidate', key: 'studentName', width: '20%' },
        { header: 'Company', key: 'companyName', width: '20%' },
        { header: 'Job Title', key: 'jobTitle', width: '20%' },
        { header: 'Match Score', key: 'matchScore', width: '15%', render: (row) => (
          <span className={`match-score ${row.matchScore >= 80 ? 'high' : row.matchScore >= 60 ? 'medium' : 'low'}`}>
            {row.matchScore}%
          </span>
        )},
        { header: 'Applied Date', key: 'applicationDate', width: '15%', render: (row) => {
          const date = row.applicationDate?.toDate ? row.applicationDate.toDate() : new Date(row.applicationDate);
          return date.toLocaleDateString();
        }},
        { header: 'Status', key: 'status', width: '15%', render: (row) => (
          <span className={`status-badge status-${row.status}`}>
            {row.status}
          </span>
        )}
      ];
    } else {
      return [
        { header: 'Student', key: 'studentName', width: '20%' },
        { header: 'Institution', key: 'institutionName', width: '20%' },
        { header: 'Course', key: 'courseName', width: '20%' },
        { header: 'Applied Date', key: 'applicationDate', width: '15%', render: (row) => {
          const date = row.applicationDate?.toDate ? row.applicationDate.toDate() : new Date(row.applicationDate);
          return date.toLocaleDateString();
        }},
        { header: 'Status', key: 'status', width: '15%', render: (row) => (
          <span className={`status-badge status-${row.status}`}>
            {row.status}
          </span>
        )},
        { header: 'Notes', key: 'notes', width: '15%', render: (row) => (
          row.notes ? <span className="notes-text" title={row.notes}>{row.notes.substring(0, 30)}...</span> : 'N/A'
        )}
      ];
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      institutionId: '',
      courseId: '',
      companyId: '',
      jobId: '',
      status: '',
      startDate: '',
      endDate: '',
      search: ''
    });
  };

  const handleExportCSV = () => {
    try {
      if (applications.length === 0) {
        addNotification({
          type: 'warning',
          title: 'No Data',
          message: 'No applications to export'
        });
        return;
      }

      const filename = `${activeTab}_applications_${formatDateRangeForFilename(filters.startDate, filters.endDate)}`;
      exportToCSV(applications, filename, getColumns());
      
      addNotification({
        type: 'success',
        title: 'Export Successful',
        message: 'Applications exported to CSV successfully'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to export applications'
      });
    }
  };

  const handleExportExcel = () => {
    try {
      if (applications.length === 0) {
        addNotification({
          type: 'warning',
          title: 'No Data',
          message: 'No applications to export'
        });
        return;
      }

      const filename = `${activeTab}_applications_${formatDateRangeForFilename(filters.startDate, filters.endDate)}`;
      exportToExcel(applications, filename, getColumns());
      
      addNotification({
        type: 'success',
        title: 'Export Successful',
        message: 'Applications exported to Excel successfully'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to export applications'
      });
    }
  };

  return (
    <div className="applications-overview">
      <div className="page-header">
        <h1>Applications Overview</h1>
        <p>View and manage all applications across the platform</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Tabs */}
      <div className="overview-tabs">
        <button
          className={`tab-button ${activeTab === 'institute' ? 'active' : ''}`}
          onClick={() => setActiveTab('institute')}
        >
          Institute Applications
        </button>
        <button
          className={`tab-button ${activeTab === 'company' ? 'active' : ''}`}
          onClick={() => setActiveTab('company')}
        >
          Company Applications
        </button>
        <button
          className={`tab-button ${activeTab === 'combined' ? 'active' : ''}`}
          onClick={() => setActiveTab('combined')}
        >
          Combined Overview
        </button>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">Total:</span>
          <span className="stat-value">{stats.total || 0}</span>
        </div>
        {activeTab === 'institute' && (
          <>
            <div className="stat-item">
              <span className="stat-label">Admitted:</span>
              <span className="stat-value success">{stats.admitted || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rejected:</span>
              <span className="stat-value danger">{stats.rejected || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pending:</span>
              <span className="stat-value warning">{stats.pending || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Waitlisted:</span>
              <span className="stat-value info">{stats.waitlisted || 0}</span>
            </div>
          </>
        )}
        {activeTab === 'company' && (
          <>
            <div className="stat-item">
              <span className="stat-label">Qualified:</span>
              <span className="stat-value success">{stats.qualified || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rejected:</span>
              <span className="stat-value danger">{stats.rejected || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Accepted:</span>
              <span className="stat-value success">{stats.accepted || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Under Review:</span>
              <span className="stat-value warning">{stats.underReview || 0}</span>
            </div>
          </>
        )}
        {activeTab === 'combined' && (
          <>
            <div className="stat-item">
              <span className="stat-label">Education:</span>
              <span className="stat-value">{stats.education?.total || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Jobs:</span>
              <span className="stat-value">{stats.job?.total || 0}</span>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          {activeTab === 'institute' && (
            <>
              <div className="filter-group">
                <label>Institution ID:</label>
                <input
                  type="text"
                  value={filters.institutionId}
                  onChange={(e) => handleFilterChange('institutionId', e.target.value)}
                  placeholder="Filter by institution ID"
                />
              </div>
              <div className="filter-group">
                <label>Course ID:</label>
                <input
                  type="text"
                  value={filters.courseId}
                  onChange={(e) => handleFilterChange('courseId', e.target.value)}
                  placeholder="Filter by course ID"
                />
              </div>
            </>
          )}
          {activeTab === 'company' && (
            <>
              <div className="filter-group">
                <label>Company ID:</label>
                <input
                  type="text"
                  value={filters.companyId}
                  onChange={(e) => handleFilterChange('companyId', e.target.value)}
                  placeholder="Filter by company ID"
                />
              </div>
              <div className="filter-group">
                <label>Job ID:</label>
                <input
                  type="text"
                  value={filters.jobId}
                  onChange={(e) => handleFilterChange('jobId', e.target.value)}
                  placeholder="Filter by job ID"
                />
              </div>
            </>
          )}
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              {activeTab === 'institute' ? (
                <>
                  <option value="pending">Pending</option>
                  <option value="under-review">Under Review</option>
                  <option value="admitted">Admitted</option>
                  <option value="rejected">Rejected</option>
                  <option value="waiting">Waitlisted</option>
                </>
              ) : (
                <>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="accepted">Accepted</option>
                  <option value="hired">Hired</option>
                  <option value="under-review">Under Review</option>
                </>
              )}
            </select>
          </div>
          <div className="filter-group">
            <label>Start Date:</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>End Date:</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          <div className="filter-group filter-search">
            <label>Search:</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name, email, institution, company..."
            />
          </div>
          <div className="filter-actions">
            <button onClick={clearFilters} className="btn-clear">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="applications-table">
        {loading ? (
          <div className="skeleton-table">
            <div className="skeleton-table-header">
              {getColumns().map((_, i) => (
                <div key={i} className="skeleton-table-header-cell"></div>
              ))}
            </div>
            {[1, 2, 3, 4, 5].map((rowIndex) => (
              <div key={rowIndex} className="skeleton-table-row">
                {getColumns().map((_, colIndex) => (
                  <div key={colIndex} className="skeleton-table-cell">
                    <div className="skeleton-line"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <Table
            columns={getColumns()}
            data={applications}
            loading={false}
            emptyMessage={`No ${activeTab} applications found`}
          />
        )}
      </div>
    </div>
  );
};

export default ApplicationsOverview;

