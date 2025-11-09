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
      const data = await companyService.getJobApplicants(selectedJob);
      setApplicants(data);
    } catch (err) {
      setError(err.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      setUpdating(true);
      await companyService.updateApplicationStatus(applicationId, status);
      await loadApplicants(); // Reload to get updated status
    } catch (err) {
      setError(err.message || 'Failed to update application status');
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
      key: 'appliedAt',
      width: '15%',
      render: (row) => new Date(row.appliedAt).toLocaleDateString()
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
          onChange={(e) => updateApplicationStatus(row.id, e.target.value)}
          disabled={updating}
          className={`status-select status-${row.status}`}
        >
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
          <option value="accepted">Accepted</option>
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
              Applicants for {jobs.find(j => j.id === selectedJob)?.title}
              <span className="applicant-count">({applicants.length} applicants)</span>
            </h3>
          </div>

          <Table
            columns={columns}
            data={applicants}
            loading={loading}
            emptyMessage="No applicants found for this job"
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