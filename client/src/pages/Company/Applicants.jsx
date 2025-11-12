import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { companyService } from '../../services/api/companyService';
import Table from '../../components/ui/Table';

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      loadApplicants();
    }
  }, [selectedJob]);

  const loadJobs = async () => {
    try {
      const data = await companyService.getCompanyJobs();
      setJobs(data);
      if (data.length > 0) {
        setSelectedJob(data[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load jobs');
    }
  };

  const loadApplicants = async () => {
    try {
      setLoading(true);
      // Only load qualified candidates (those who meet minimum requirements)
      const result = await companyService.getQualifiedCandidates(selectedJob);
      setApplicants(result.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status, notes) => {
    try {
      setUpdating(true);
      await companyService.updateApplicationStatus(applicationId, status, notes);
      await loadApplicants(); // Reload to get updated status
    } catch (err) {
      setError(err.message || 'Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedApplicants.length === 0) {
      setError('Please select an action and at least one applicant');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${bulkAction} ${selectedApplicants.length} applicant(s)?`)) {
      return;
    }

    try {
      setUpdating(true);
      await companyService.bulkUpdateApplicationStatus(selectedJob, selectedApplicants, bulkAction);
      setSelectedApplicants([]);
      setBulkAction('');
      await loadApplicants(); // Reload to get updated status
    } catch (err) {
      setError(err.message || 'Failed to perform bulk action');
    } finally {
      setUpdating(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedApplicants(applicants.map(app => app.id || app.applicationId));
    } else {
      setSelectedApplicants([]);
    }
  };

  const handleSelectApplicant = (applicationId) => {
    setSelectedApplicants(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleExportPDF = async () => {
    try {
      setUpdating(true);
      await companyService.exportAdmittedCandidates(selectedJob);
    } catch (err) {
      setError(err.message || 'Failed to export PDF');
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      header: 'Applicant',
      key: 'studentName',
      width: '25%',
      render: (row) => (
        <div className="applicant-info">
          <div className="applicant-name">{row.studentName}</div>
          <div className="applicant-email">{row.studentEmail}</div>
        </div>
      )
    },
    {
      header: 'Applied Date',
      key: 'applicationDate',
      width: '15%',
      render: (row) => {
        const date = row.applicationDate?.toDate ? row.applicationDate.toDate() : new Date(row.applicationDate || row.appliedAt);
        return date.toLocaleDateString();
      }
    },
    {
      header: 'Match Score',
      key: 'matchScore',
      width: '15%',
      render: (row) => (
        <span className={`match-score ${row.matchScore >= 80 ? 'high' : row.matchScore >= 60 ? 'medium' : 'low'}`}>
          {row.matchScore}%
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      width: '20%',
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => updateApplicationStatus(row.id || row.applicationId, e.target.value)}
          disabled={updating}
          className={`status-select status-${row.status}`}
        >
          <option value="shortlisted">Shortlisted</option>
          <option value="accepted">Accepted</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
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
            onClick={() => viewApplicantDetails(row)}
          >
            View Details
          </button>
          <button 
            className="contact-btn"
            onClick={() => contactApplicant(row)}
          >
            Contact
          </button>
        </div>
      )
    }
  ];

  const viewApplicantDetails = (applicant) => {
    // Implement view details modal
    console.log('View applicant:', applicant);
  };

  const contactApplicant = (applicant) => {
    // Implement contact functionality
    window.location.href = `mailto:${applicant.studentEmail}`;
  };

  return (
    <div className="applicants-page">
      <div className="page-header">
        <h1>Job Applicants</h1>
        <p>Manage and review job applications</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="job-selector">
        <label>Select Job:</label>
        <select 
          value={selectedJob} 
          onChange={(e) => setSelectedJob(e.target.value)}
        >
          {jobs.map(job => (
            <option key={job.id} value={job.id}>
              {job.title} ({job.applicants || 0} applicants)
            </option>
          ))}
        </select>
      </div>

      {selectedJob && (
        <div className="applicants-section">
          <div className="section-header">
            <h3>
              Qualified Candidates for {jobs.find(j => j.id === selectedJob)?.title}
              <span className="applicant-count">({applicants.length} qualified candidates)</span>
            </h3>
            <div className="header-actions">
              <button 
                onClick={handleExportPDF}
                className="btn-export"
                disabled={updating}
              >
                Export Admitted Candidates (PDF)
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {applicants.length > 0 && (
            <div className="bulk-actions">
              <div className="bulk-select">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedApplicants.length === applicants.length && applicants.length > 0}
                    onChange={handleSelectAll}
                    disabled={updating}
                  />
                  Select All ({selectedApplicants.length}/{applicants.length})
                </label>
              </div>
              {selectedApplicants.length > 0 && (
                <div className="bulk-controls">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    disabled={updating}
                    className="bulk-action-select"
                  >
                    <option value="">Select Action</option>
                    <option value="accepted">Approve All Selected</option>
                    <option value="rejected">Reject All Selected</option>
                    <option value="hired">Mark as Hired</option>
                  </select>
                  <button
                    onClick={handleBulkAction}
                    disabled={!bulkAction || updating}
                    className="btn-bulk-action"
                  >
                    Apply to {selectedApplicants.length} Selected
                  </button>
                  <button
                    onClick={() => {
                      setSelectedApplicants([]);
                      setBulkAction('');
                    }}
                    className="btn-clear"
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </div>
          )}

          <Table
            columns={columns.map(col => {
              if (col.key === 'actions') {
                return {
                  ...col,
                  header: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={selectedApplicants.length === applicants.length && applicants.length > 0}
                        onChange={handleSelectAll}
                        disabled={updating}
                      />
                      {col.header}
                    </div>
                  ),
                  render: (row) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={selectedApplicants.includes(row.id || row.applicationId)}
                        onChange={() => handleSelectApplicant(row.id || row.applicationId)}
                        disabled={updating}
                      />
                      {col.render(row)}
                    </div>
                  )
                };
              }
              return col;
            })}
            data={applicants}
            loading={loading}
            emptyMessage="No qualified candidates found for this job"
          />

          <div className="applicant-stats">
            <div className="stat">
              <span className="stat-value">
                {applicants.filter(a => a.status === 'shortlisted').length}
              </span>
              <span className="stat-label">Shortlisted</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {applicants.filter(a => a.status === 'rejected').length}
              </span>
              <span className="stat-label">Rejected</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {applicants.filter(a => a.matchScore >= 80).length}
              </span>
              <span className="stat-label">High Match</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applicants;