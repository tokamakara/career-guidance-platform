import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { studentService } from '../../../services/api/studentService';
import { useNotification } from '../../../context/NotificationContext';
import Table from '../../../components/ui/Table';

const MyJobApplications = () => {
  const [jobApplications, setJobApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { currentUser } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    if (currentUser) {
      loadJobApplications();
    }
  }, [currentUser]);

  const loadJobApplications = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch real job applications from API
      const result = await studentService.getJobApplications();
      
      // Handle different response formats
      let applicationsData = [];
      if (result && result.success && result.data) {
        applicationsData = Array.isArray(result.data) ? result.data : [];
      } else if (result && Array.isArray(result)) {
        applicationsData = result;
      } else if (result && result.data && Array.isArray(result.data)) {
        applicationsData = result.data;
      } else {
        applicationsData = [];
      }
      
      // Transform API data to match component format
      const transformedApplications = applicationsData.map(app => ({
        id: app.id,
        jobTitle: app.jobTitle || app.title,
        companyName: app.companyName || app.company,
        appliedAt: app.appliedAt || app.applicationDate || app.createdAt,
        status: app.status || 'pending',
        matchScore: app.matchScore || 0,
        jobId: app.jobId
      }));
      
      setJobApplications(transformedApplications);
    } catch (err) {
      // Only log if it's an actual error (not empty data scenario)
      if (err.message && !err.message.includes('returning empty')) {
        console.warn('Error loading job applications:', err.message);
      }
      
      // Set empty array - no applications is a valid state, not an error
      setJobApplications([]);
      
      // Only show notification for auth errors
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        // Auth errors are handled elsewhere
        return;
      }
      
      // Don't show error notifications for empty data - it's normal if user has no applications
    } finally {
      setLoading(false);
    }
  };

  const withdrawApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      // TODO: Call API to withdraw application
      // await studentService.withdrawJobApplication(applicationId);
      
      // Update local state
      setJobApplications(prev => prev.filter(app => app.id !== applicationId));
      
      addNotification({
        type: 'success',
        title: 'Application Withdrawn',
        message: 'Your job application has been withdrawn successfully'
      });
    } catch (err) {
      console.error('Error withdrawing application:', err);
      addNotification({
        type: 'error',
        title: 'Withdrawal Failed',
        message: err.message || 'Failed to withdraw application'
      });
    }
  };

  const columns = [
    {
      header: 'Job Position',
      key: 'jobTitle',
      width: '25%',
      render: (row) => (
        <div className="job-info">
          <div className="job-title">{row.jobTitle}</div>
          <div className="company-name">{row.companyName}</div>
        </div>
      )
    },
    {
      header: 'Applied Date',
      key: 'appliedAt',
      width: '15%',
      render: (row) => new Date(row.appliedAt).toLocaleDateString()
    },
    {
      header: 'Match Score',
      key: 'matchScore',
      width: '15%',
      render: (row) => (
        <div className="match-score-display">
          <span className={`score ${row.matchScore >= 80 ? 'high' : row.matchScore >= 60 ? 'medium' : 'low'}`}>
            {row.matchScore}%
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      width: '20%',
      render: (row) => (
        <span className={`status-badge status-${row.status}`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      width: '25%',
      render: (row) => (
        <div className="action-buttons">
          <button 
            className="view-btn"
            onClick={() => viewJobDetails(row)}
          >
            View Job
          </button>
          {row.status === 'pending' && (
            <button 
              className="withdraw-btn"
              onClick={() => withdrawApplication(row.id)}
            >
              Withdraw
            </button>
          )}
        </div>
      )
    }
  ];

  const viewJobDetails = (application) => {
    // Navigate to job details page
    if (application.jobId) {
      window.location.href = `/student/career/jobs/${application.jobId}`;
    }
  };

  const getApplicationStats = () => {
    const total = jobApplications.length;
    const pending = jobApplications.filter(app => app.status === 'pending').length;
    const shortlisted = jobApplications.filter(app => app.status === 'shortlisted').length;
    const rejected = jobApplications.filter(app => app.status === 'rejected').length;
    
    return { total, pending, shortlisted, rejected };
  };

  const stats = getApplicationStats();

  return (
    <div className="my-job-applications">
      <div className="page-header">
        <h1>My Job Applications</h1>
        <p>Track and manage your job applications</p>
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
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card shortlisted">
          <div className="stat-value">{stats.shortlisted}</div>
          <div className="stat-label">Shortlisted</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-label">Not Selected</div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="applications-section">
        <Table
          columns={columns}
          data={jobApplications}
          loading={loading}
          emptyMessage="You haven't applied to any jobs yet. Start browsing job listings to apply!"
        />
      </div>

      {/* Application Tips */}
      <div className="application-tips">
        <h3>Job Application Tips</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>Tailor Your Resume</h4>
            <p>Customize your resume for each job application to highlight relevant skills and experience.</p>
          </div>
          <div className="tip-card">
            <h4>Follow Up</h4>
            <p>Send a polite follow-up email if you haven't heard back within 1-2 weeks.</p>
          </div>
          <div className="tip-card">
            <h4>Focus on Quality</h4>
            <p>Apply to jobs that match your skills and interests rather than mass applying.</p>
          </div>
          <div className="tip-card">
            <h4>Keep Learning</h4>
            <p>Continue developing your skills while waiting for responses.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyJobApplications;