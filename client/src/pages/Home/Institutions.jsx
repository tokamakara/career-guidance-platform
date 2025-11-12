import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar/Navbar';
import { institutionService } from '../../services/api/instituteService';
import './Institutions.css';

const Institutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadInstitutions();
  }, []);

  useEffect(() => {
    filterInstitutions();
  }, [institutions, searchTerm, filter]);

  const loadInstitutions = async () => {
    try {
      const data = await instituteService.getInstitutions();
      setInstitutions(data);
    } catch (error) {
      console.error('Error loading institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInstitutions = () => {
    let filtered = institutions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(inst =>
        inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(inst => inst.type === filter);
    }

    setFilteredInstitutions(filtered);
  };

  const institutionTypes = [
    { value: 'all', label: 'All Institutions' },
    { value: 'university', label: 'Universities' },
    { value: 'college', label: 'Colleges' },
    { value: 'technical', label: 'Technical Institutes' },
    { value: 'vocational', label: 'Vocational Schools' }
  ];

  if (loading) {
    return (
      <div className="institutions-loading">
        <Navbar />
        <div className="loading-spinner"></div>
        <p>Loading institutions...</p>
      </div>
    );
  }

  return (
    <div className="institutions-page">
      <Navbar />
      <div className="institutions-hero">
        <div className="container">
          <h1>Higher Learning Institutions in Lesotho</h1>
          <p>
            Discover universities, colleges, and technical institutes across Lesotho. 
            Find the perfect institution for your educational journey.
          </p>
        </div>
      </div>

      <div className="institutions-content">
        <div className="container">
          {/* Search and Filters */}
          <div className="institutions-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search institutions by name, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-tabs">
              {institutionTypes.map(type => (
                <button
                  key={type.value}
                  className={`filter-tab ${filter === type.value ? 'active' : ''}`}
                  onClick={() => setFilter(type.value)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="results-info">
            <p>
              Showing {filteredInstitutions.length} of {institutions.length} institutions
            </p>
          </div>

          {/* Institutions Grid */}
          {filteredInstitutions.length === 0 ? (
            <div className="no-results">
              <h3>No institutions found</h3>
              <p>Try adjusting your search criteria or filters</p>
            </div>
          ) : (
            <div className="institutions-grid">
              {filteredInstitutions.map(institution => (
                <div key={institution.id} className="institution-card">
                  <div className="institution-header">
                    <div className="institution-type-badge">
                      {institution.type}
                    </div>
                    <h3>{institution.name}</h3>
                    <p className="institution-location">
                      📍 {institution.location}
                    </p>
                  </div>

                  <div className="institution-body">
                    <p className="institution-description">
                      {institution.description}
                    </p>

                    <div className="institution-stats">
                      <div className="stat">
                        <span className="stat-value">
                          {institution.courses?.length || 0}
                        </span>
                        <span className="stat-label">Courses</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">
                          {institution.students || 'N/A'}
                        </span>
                        <span className="stat-label">Students</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">
                          {institution.established || 'N/A'}
                        </span>
                        <span className="stat-label">Established</span>
                      </div>
                    </div>

                    <div className="institution-features">
                      {institution.features?.map((feature, index) => (
                        <span key={index} className="feature-tag">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="institution-footer">
                    <button 
                      className="view-details-btn"
                      onClick={() => window.location.href = `/institution/${institution.id}`}
                    >
                      View Details
                    </button>
                    <button 
                      className="contact-btn"
                      onClick={() => window.location.href = `/contact?institution=${institution.id}`}
                    >
                      Contact
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="institutions-cta">
            <h2>Are you an institution?</h2>
            <p>
              Join our platform to reach thousands of students looking for quality education 
              in Lesotho. Showcase your courses and connect with potential students.
            </p>
            <div className="cta-buttons">
              <a href="/register?role=institute" className="cta-button primary">
                Sign Up Your Institution
              </a>
              <a href="/contact" className="cta-button secondary">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Institutions;