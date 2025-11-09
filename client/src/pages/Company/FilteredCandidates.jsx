import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { companyService } from '../../services/api/companyService';
import Table from '../../components/ui/Table';

const FilteredCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [filters, setFilters] = useState({
    minMatchScore: 70,
    educationLevel: '',
    skills: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    loadFilteredCandidates();
  }, [filters]);

  const loadFilteredCandidates = async () => {
    try {
      setLoading(true);
      const data = await companyService.getFilteredCandidates(filters);
      setCandidates(data);
    } catch (err) {
      setError(err.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const inviteToApply = async (candidateId, jobId) => {
    try {
      await companyService.inviteCandidate(candidateId, jobId);
      alert('Candidate invited successfully!');
    } catch (err) {
      setError(err.message || 'Failed to invite candidate');
    }
  };

  const columns = [
    {
      header: 'Candidate',
      key: 'name',
      width: '25%',
      render: (row) => (
        <div className="candidate-info">
          <div className="candidate-name">{row.studentName}</div>
          <div className="candidate-email">{row.studentEmail}</div>
          <div className="candidate-education">{row.educationLevel}</div>
        </div>
      )
    },
    {
      header: 'Match Score',
      key: 'matchScore',
      width: '15%',
      render: (row) => (
        <div className="match-score-display">
          <div className="score-value">{row.matchScore}%</div>
          <div className="score-bar">
            <div 
              className="score-fill"
              style={{ width: `${row.matchScore}%` }}
            ></div>
          </div>
        </div>
      )
    },
    {
      header: 'Skills',
      key: 'skills',
      width: '25%',
      render: (row) => (
        <div className="skills-list">
          {row.skills?.slice(0, 3).map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
          {row.skills?.length > 3 && (
            <span className="more-skills">+{row.skills.length - 3} more</span>
          )}
        </div>
      )
    },
    {
      header: 'Experience',
      key: 'experience',
      width: '15%',
      render: (row) => (
        <span>{row.experience || 'No experience'}</span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      width: '20%',
      render: (row) => (
        <div className="candidate-actions">
          <button 
            className="view-profile-btn"
            onClick={() => viewCandidateProfile(row)}
          >
            View Profile
          </button>
          <button 
            className="invite-btn"
            onClick={() => inviteToApply(row.studentId, 'job-id')}
          >
            Invite to Apply
          </button>
        </div>
      )
    }
  ];

  const viewCandidateProfile = (candidate) => {
    // Implement candidate profile view
    console.log('View candidate profile:', candidate);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="filtered-candidates">
      <div className="page-header">
        <h1>Find Qualified Candidates</h1>
        <p>Discover candidates that match your job requirements</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="candidate-filters">
        <h3>Filter Candidates</h3>
        <div className="filter-grid">
          <div className="filter-group">
            <label>Minimum Match Score</label>
            <select
              value={filters.minMatchScore}
              onChange={(e) => handleFilterChange('minMatchScore', e.target.value)}
            >
              <option value={50}>50%+</option>
              <option value={60}>60%+</option>
              <option value={70}>70%+</option>
              <option value={80}>80%+</option>
              <option value={90}>90%+</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Education Level</label>
            <select
              value={filters.educationLevel}
              onChange={(e) => handleFilterChange('educationLevel', e.target.value)}
            >
              <option value="">Any</option>
              <option value="high_school">High School</option>
              <option value="certificate">Certificate</option>
              <option value="diploma">Diploma</option>
              <option value="bachelors">Bachelor's Degree</option>
              <option value="masters">Master's Degree</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Skills</label>
            <input
              type="text"
              placeholder="e.g. JavaScript, Python, Marketing"
              value={filters.skills}
              onChange={(e) => handleFilterChange('skills', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Experience</label>
            <select
              value={filters.experience}
              onChange={(e) => handleFilterChange('experience', e.target.value)}
            >
              <option value="">Any</option>
              <option value="entry_level">Entry Level (0-2 years)</option>
              <option value="mid_level">Mid Level (2-5 years)</option>
              <option value="senior_level">Senior Level (5+ years)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="candidates-results">
        <div className="results-header">
          <h3>
            Matching Candidates
            <span className="results-count">({candidates.length} found)</span>
          </h3>
        </div>

        <Table
          columns={columns}
          data={candidates}
          loading={loading}
          emptyMessage="No candidates found matching your criteria"
        />
      </div>

      {/* Statistics */}
      <div className="candidate-stats">
        <h3>Candidate Pool Statistics</h3>
        <div className="stats-grid">
          <div className="stat">
            <div className="stat-value">
              {candidates.filter(c => c.matchScore >= 90).length}
            </div>
            <div className="stat-label">Excellent Matches (90%+)</div>
          </div>
          <div className="stat">
            <div className="stat-value">
              {candidates.filter(c => c.matchScore >= 80).length}
            </div>
            <div className="stat-label">Great Matches (80%+)</div>
          </div>
          <div className="stat">
            <div className="stat-value">
              {candidates.filter(c => c.matchScore >= 70).length}
            </div>
            <div className="stat-label">Good Matches (70%+)</div>
          </div>
          <div className="stat">
            <div className="stat-value">
              {candidates.filter(c => c.experience === 'senior_level').length}
            </div>
            <div className="stat-label">Senior Candidates</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilteredCandidates;