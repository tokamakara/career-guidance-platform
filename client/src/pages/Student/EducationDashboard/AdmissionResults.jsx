import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { studentService } from '../../../services/api/studentService';

const AdmissionResults = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAdmission, setSelectedAdmission] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    loadAdmissionResults();
  }, []);

  const loadAdmissionResults = async () => {
    try {
      setLoading(true);
      // This would typically come from the student service
      const mockAdmissions = [
        {
          id: '1',
          institutionName: 'National University of Lesotho',
          courseName: 'Computer Science',
          appliedDate: '2024-01-15',
          decisionDate: '2024-02-01',
          status: 'admitted',
          decision: 'Congratulations! You have been admitted to the Computer Science program.',
          conditions: 'Submit original certificates by March 15, 2024',
          waitlistPosition: null
        },
        {
          id: '2',
          institutionName: 'Limkokwing University',
          courseName: 'Software Engineering',
          appliedDate: '2024-01-20',
          decisionDate: '2024-02-05',
          status: 'waitlisted',
          decision: 'You have been placed on the waitlist for the Software Engineering program.',
          conditions: 'We will notify you if a spot becomes available',
          waitlistPosition: 5
        },
        {
          id: '3',
          institutionName: 'Lesotho College of Education',
          courseName: 'Education',
          appliedDate: '2024-01-10',
          decisionDate: '2024-01-30',
          status: 'rejected',
          decision: 'We regret to inform you that your application was not successful.',
          conditions: 'You may consider applying for other programs or improving your qualifications',
          waitlistPosition: null
        }
      ];
      setAdmissions(mockAdmissions);
    } catch (err) {
      setError(err.message || 'Failed to load admission results');
    } finally {
      setLoading(false);
    }
  };

  const acceptAdmission = async (admissionId) => {
    if (!window.confirm('Are you sure you want to accept this admission offer? This action cannot be undone.')) {
      return;
    }

    try {
      // Simulate API call
      setAdmissions(prev => prev.map(admission => 
        admission.id === admissionId 
          ? { ...admission, status: 'accepted' }
          : admission.status === 'admitted' ? { ...admission, status: 'declined' } : admission
      ));
      alert('Admission accepted successfully!');
    } catch (err) {
      setError('Failed to accept admission');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'admitted':
        return '🎉';
      case 'accepted':
        return '✅';
      case 'waitlisted':
        return '⏳';
      case 'rejected':
        return '❌';
      case 'pending':
        return '📝';
      default:
        return '📋';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'admitted':
      case 'accepted':
        return 'success';
      case 'waitlisted':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };

  const getAdmissionStats = () => {
    const total = admissions.length;
    const admitted = admissions.filter(a => a.status === 'admitted' || a.status === 'accepted').length;
    const waitlisted = admissions.filter(a => a.status === 'waitlisted').length;
    const rejected = admissions.filter(a => a.status === 'rejected').length;
    const pending = admissions.filter(a => a.status === 'pending').length;
    
    return { total, admitted, waitlisted, rejected, pending };
  };

  const stats = getAdmissionStats();

  if (loading) {
    return (
      <div className="admission-results-loading">
        <div className="loading-spinner"></div>
        <p>Loading admission results...</p>
      </div>
    );
  }

  return (
    <div className="admission-results">
      <div className="page-header">
        <h1>Admission Results</h1>
        <p>View your admission decisions and manage your acceptances</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Statistics */}
      <div className="admission-stats">
        <div className="stat-card total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card admitted">
          <div className="stat-value">{stats.admitted}</div>
          <div className="stat-label">Admitted</div>
        </div>
        <div className="stat-card waitlisted">
          <div className="stat-value">{stats.waitlisted}</div>
          <div className="stat-label">Waitlisted</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      {/* Admission Results List */}
      <div className="admission-list">
        {admissions.length === 0 ? (
          <div className="empty-results">
            <div className="empty-icon">📋</div>
            <h3>No Admission Results Yet</h3>
            <p>Your admission decisions will appear here once they are available.</p>
          </div>
        ) : (
          admissions.map(admission => (
            <div 
              key={admission.id} 
              className={`admission-card status-${getStatusColor(admission.status)}`}
            >
              <div className="admission-header">
                <div className="status-indicator">
                  <span className="status-icon">{getStatusIcon(admission.status)}</span>
                  <span className="status-text">{admission.status.toUpperCase()}</span>
                </div>
                <div className="admission-date">
                  Decided: {new Date(admission.decisionDate).toLocaleDateString()}
                </div>
              </div>

              <div className="admission-body">
                <h3 className="course-name">{admission.courseName}</h3>
                <p className="institution-name">{admission.institutionName}</p>
                
                <div className="decision-message">
                  <p>{admission.decision}</p>
                </div>

                {admission.waitlistPosition && (
                  <div className="waitlist-info">
                    <strong>Waitlist Position:</strong> #{admission.waitlistPosition}
                  </div>
                )}

                {admission.conditions && (
                  <div className="conditions-info">
                    <strong>Conditions:</strong> {admission.conditions}
                  </div>
                )}
              </div>

              <div className="admission-footer">
                <div className="applied-date">
                  Applied: {new Date(admission.appliedDate).toLocaleDateString()}
                </div>
                
                <div className="admission-actions">
                  {admission.status === 'admitted' && (
                    <button 
                      onClick={() => acceptAdmission(admission.id)}
                      className="accept-btn"
                    >
                      Accept Offer
                    </button>
                  )}
                  
                  {admission.status === 'accepted' && (
                    <span className="accepted-badge">Offer Accepted</span>
                  )}

                  <button 
                    onClick={() => setSelectedAdmission(admission)}
                    className="details-btn"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Next Steps Guidance */}
      <div className="next-steps">
        <h3>Next Steps</h3>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h4>Review All Offers</h4>
            <p>Carefully consider all admission offers before making a decision.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h4>Accept Your Preferred Offer</h4>
            <p>Accept only one admission offer to allow other students opportunities.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h4>Complete Requirements</h4>
            <p>Submit any required documents and complete registration procedures.</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h4>Prepare for Studies</h4>
            <p>Get ready for your academic journey by reviewing course materials.</p>
          </div>
        </div>
      </div>

      {/* Admission Details Modal */}
      {selectedAdmission && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Admission Details</h2>
              <button 
                onClick={() => setSelectedAdmission(null)}
                className="close-button"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>{selectedAdmission.courseName}</h3>
                <p className="institution">{selectedAdmission.institutionName}</p>
              </div>

              <div className="detail-section">
                <h4>Application Timeline</h4>
                <div className="timeline">
                  <div className="timeline-item">
                    <span className="timeline-date">
                      {new Date(selectedAdmission.appliedDate).toLocaleDateString()}
                    </span>
                    <span className="timeline-event">Application Submitted</span>
                  </div>
                  <div className="timeline-item">
                    <span className="timeline-date">
                      {new Date(selectedAdmission.decisionDate).toLocaleDateString()}
                    </span>
                    <span className="timeline-event">Decision Made</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Decision Details</h4>
                <p>{selectedAdmission.decision}</p>
                
                {selectedAdmission.conditions && (
                  <div className="conditions">
                    <h5>Conditions:</h5>
                    <p>{selectedAdmission.conditions}</p>
                  </div>
                )}

                {selectedAdmission.waitlistPosition && (
                  <div className="waitlist-info">
                    <h5>Waitlist Information:</h5>
                    <p>Your position on the waitlist: #{selectedAdmission.waitlistPosition}</p>
                  </div>
                )}
              </div>

              {selectedAdmission.status === 'admitted' && (
                <div className="action-section">
                  <button 
                    onClick={() => {
                      acceptAdmission(selectedAdmission.id);
                      setSelectedAdmission(null);
                    }}
                    className="accept-btn large"
                  >
                    Accept This Admission Offer
                  </button>
                  <p className="action-note">
                    By accepting this offer, you confirm your intention to enroll in this program.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionResults;