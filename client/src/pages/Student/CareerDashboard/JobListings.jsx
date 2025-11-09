import React, { useState, useEffect } from 'react';
import { jobService } from '../../../services/api/jobService';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import './JobListings.css';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    department: ''
  });

  const { addNotification } = useNotification();
  const { userProfile } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const result = await jobService.getPublicJobs();
      setJobs(result.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load job listings'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (filters.type) {
      filtered = filtered.filter(job => job.type === filters.type);
    }

    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.department) {
      filtered = filtered.filter(job => 
        job.department.toLowerCase().includes(filters.department.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };

  const handleApply = async (jobId) => {
    try {
      setApplying(jobId);
      const result = await jobService.applyToJob(jobId);
      
      addNotification({
        type: 'success',
        title: 'Application Submitted',
        message: result.message
      });

      // Refresh jobs to update application status
      fetchJobs();

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Application Failed',
        message: error.message
      });
    } finally {
      setApplying(null);
    }
  };

  const hasApplied = (jobId) => {
    return userProfile?.jobApplications?.includes(jobId) || false;
  };

  const getMatchScore = (job) => {
    // This would come from job recommendations API
    // For now, showing placeholder
    return job.matchScore || Math.floor(Math.random() * 30) + 70;
  };

  if (loading) {
    return <div className="loading">Loading job listings...</div>;
  }

  return (
    <div className="job-listings">
      <div className="page-header">
        <h1>Job Listings</h1>
        <p>Find your next career opportunity in Lesotho</p>
      </div>

      {/* Filters */}
      <div className="job-filters">
        <div className="filter-group">
          <label>Job Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Location</label>
          <input
            type="text"
            placeholder="Filter by location"
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
          />
        </div>

        <div className="filter-group">
          <label>Department</label>
          <input
            type="text"
            placeholder="Filter by department"
            value={filters.department}
            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
          />
        </div>
      </div>

      {/* Job List */}
      <div className="jobs-container">
        {filteredJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💼</div>
            <h3>No jobs found</h3>
            <p>Try adjusting your filters or check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <div className="job-title-section">
                    <h3>{job.title}</h3>
                    <p className="company">{job.companyName}</p>
                    <div className="job-meta">
                      <span className="location">📍 {job.location}</span>
                      <span className="type">🕒 {job.type}</span>
                      <span className="department">🏢 {job.department}</span>
                    </div>
                  </div>
                  <div className="job-match">
                    <div className="match-score">
                      {getMatchScore(job)}% Match
                    </div>
                  </div>
                </div>

                <div className="job-description">
                  <p>{job.description}</p>
                </div>

                {job.requirements && (
                  <div className="job-requirements">
                    <h4>Requirements:</h4>
                    <div className="requirements-grid">
                      {job.requirements.qualifications?.length > 0 && (
                        <div className="requirement-category">
                          <strong>Qualifications:</strong>
                          <span>{job.requirements.qualifications.join(', ')}</span>
                        </div>
                      )}
                      {job.requirements.workExperience > 0 && (
                        <div className="requirement-category">
                          <strong>Experience:</strong>
                          <span>{job.requirements.workExperience} years</span>
                        </div>
                      )}
                      {job.requirements.skills?.length > 0 && (
                        <div className="requirement-category">
                          <strong>Skills:</strong>
                          <span>{job.requirements.skills.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {job.salaryRange && (
                  <div className="salary-range">
                    <strong>Salary:</strong> {job.salaryRange.currency} {job.salaryRange.min} - {job.salaryRange.max}
                  </div>
                )}

                <div className="job-footer">
                  <div className="job-deadline">
                    Apply by: {new Date(job.applicationDeadline?.toDate?.() || job.applicationDeadline).toLocaleDateString()}
                  </div>
                  <div className="job-actions">
                    {hasApplied(job.id) ? (
                      <button className="btn-applied" disabled>
                        ✅ Applied
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={applying === job.id}
                        className="btn-apply"
                      >
                        {applying === job.id ? 'Applying...' : 'Apply Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListings;