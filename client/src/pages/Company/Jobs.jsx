import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { companyService } from '../../services/api/companyService';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../../components/ui/Modal';
import { useNotification } from '../../context/NotificationContext';
import './Jobs.css';

const CompanyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [deleteConfirmJob, setDeleteConfirmJob] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { addNotification } = useNotification();

  const { userProfile } = useAuth();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await companyService.getCompanyJobs();
      const jobsData = Array.isArray(response) ? response : (response.data || []);
      setJobs(jobsData);
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'active':
        return 'status-open';
      case 'closed':
        return 'status-closed';
      case 'draft':
        return 'status-draft';
      default:
        return 'status-default';
    }
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
  };

  const handleDeleteClick = (job) => {
    setDeleteConfirmJob(job);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmJob) return;

    try {
      setDeleting(true);
      await companyService.deleteJobPosting(deleteConfirmJob.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Job posting deleted successfully'
      });
      setJobs(jobs.filter(job => job.id !== deleteConfirmJob.id));
      setDeleteConfirmJob(null);
    } catch (err) {
      console.error('Error deleting job:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to delete job posting'
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
      let date;
      if (dateValue && typeof dateValue === 'object') {
        if (dateValue.seconds) {
          date = new Date(dateValue.seconds * 1000);
        } else if (dateValue.toDate && typeof dateValue.toDate === 'function') {
          date = dateValue.toDate();
        } else if (dateValue._seconds) {
          date = new Date(dateValue._seconds * 1000);
        } else {
          date = new Date(dateValue);
        }
      } else {
        date = new Date(dateValue);
      }
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="company-jobs-page">
        <div className="loading-state">
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="company-jobs-page">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={loadJobs} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="company-jobs-page">
      <div className="page-header">
        <h1>My Job Postings</h1>
        <Link to="/company/post-job" className="btn-primary">
          Post New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <p>No job postings yet</p>
          <Link to="/company/post-job" className="btn-primary">
            Create Your First Job Post
          </Link>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <div className="job-title-section">
                  <h3>{job.title}</h3>
                  <span className={`job-status ${getStatusColor(job.status)}`}>
                    {job.status || 'draft'}
                  </span>
                </div>
                <div className="job-meta">
                  <span className="meta-item">
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
                    })()}
                  </span>
                  {job.location && (
                    <span className="meta-item">{job.location}</span>
                  )}
                  {job.type && (
                    <span className="meta-item">{job.type}</span>
                  )}
                </div>
              </div>
              
              {job.description && (
                <p className="job-description">
                  {job.description.length > 150 
                    ? `${job.description.substring(0, 150)}...` 
                    : job.description}
                </p>
              )}

              <div className="job-footer">
                <div className="job-actions">
                  <Link 
                    to={`/company/applicants?jobId=${job.id}`} 
                    className="btn-applicants"
                  >
                    Applicants
                  </Link>
                  <button 
                    onClick={() => handleViewDetails(job)}
                    className="btn-details"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(job)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title="Job Details"
        size="large"
      >
        {selectedJob && (
          <div className="job-details-modal">
            <div className="detail-section">
              <h3>{selectedJob.title}</h3>
              <div className="detail-meta">
                <span className={`status-badge ${getStatusColor(selectedJob.status)}`}>
                  {selectedJob.status || 'draft'}
                </span>
                <span>Posted: {formatDate(selectedJob.createdAt)}</span>
                {selectedJob.updatedAt && (
                  <span>Updated: {formatDate(selectedJob.updatedAt)}</span>
                )}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-item">
                <label>Location:</label>
                <span>{selectedJob.location || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>Job Type:</label>
                <span>{selectedJob.type || 'Not specified'}</span>
              </div>
            </div>

            {selectedJob.salary && (
              <div className="detail-row">
                <div className="detail-item">
                  <label>Salary:</label>
                  <span>{selectedJob.salary}</span>
                </div>
              </div>
            )}

            {selectedJob.description && (
              <div className="detail-section">
                <label>Description:</label>
                <p className="detail-description">{selectedJob.description}</p>
              </div>
            )}

            {selectedJob.requirements && (
              <div className="detail-section">
                <label>Requirements:</label>
                <ul className="detail-list">
                  {Array.isArray(selectedJob.requirements) 
                    ? selectedJob.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))
                    : <li>{selectedJob.requirements}</li>
                  }
                </ul>
              </div>
            )}

            {selectedJob.responsibilities && (
              <div className="detail-section">
                <label>Responsibilities:</label>
                <ul className="detail-list">
                  {Array.isArray(selectedJob.responsibilities)
                    ? selectedJob.responsibilities.map((resp, idx) => (
                        <li key={idx}>{resp}</li>
                      ))
                    : <li>{selectedJob.responsibilities}</li>
                  }
                </ul>
              </div>
            )}

            <div className="detail-stats">
              <div className="stat-item">
                <label>Applicants:</label>
                <span>{selectedJob.applicants || 0}</span>
              </div>
              {selectedJob.views && (
                <div className="stat-item">
                  <label>Views:</label>
                  <span>{selectedJob.views}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmJob}
        onClose={() => setDeleteConfirmJob(null)}
        title="Confirm Delete"
        size="small"
      >
        {deleteConfirmJob && (
          <div className="delete-confirm-modal">
            <p>Are you sure you want to delete this job posting?</p>
            <div className="delete-job-info">
              <strong>{deleteConfirmJob.title}</strong>
              <span>This action cannot be undone.</span>
            </div>
            <div className="delete-actions">
              <button
                onClick={() => setDeleteConfirmJob(null)}
                className="btn-cancel"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn-confirm-delete"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CompanyJobs;

