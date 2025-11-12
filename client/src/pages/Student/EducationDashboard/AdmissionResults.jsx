import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { applicationService } from '../../../services/api/applicationService';
import { useNotification } from '../../../context/NotificationContext';
import './AdmissionResults.css';

const AdmissionResults = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);

  const { userProfile } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    loadAdmissionResults();
  }, []);

  const loadAdmissionResults = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch real applications from API
      const result = await applicationService.getStudentApplications();
      
      // Handle different response formats
      let applications = [];
      
      if (result && result.success && result.data) {
        // Standard API response: { success: true, data: [...] }
        applications = Array.isArray(result.data) ? result.data : [];
      } else if (result && Array.isArray(result)) {
        // Direct array response
        applications = result;
      } else if (result && result.data && Array.isArray(result.data)) {
        // Response with data property
        applications = result.data;
      } else {
        // Empty or unexpected format
        applications = [];
        console.warn('Unexpected response format for admission results:', result);
      }
      
      // Filter applications that have decisions (admitted, rejected, waiting, accepted)
      // Also include pending/under-review for stats, but they won't show as "decisions"
      const applicationsWithDecisions = applications.filter(app => 
        app.status === 'admitted' || 
        app.status === 'rejected' || 
        app.status === 'waiting' ||
        app.status === 'accepted' ||
        app.status === 'pending' ||
        app.status === 'under-review'
      );
      
      setApplications(applicationsWithDecisions);
      
      // Clear any previous errors on successful load
      setError('');
      
    } catch (err) {
      // Only log if it's an actual error (not empty data scenario)
      if (err.message && !err.message.includes('returning empty')) {
        console.warn('Error loading admission results:', err.message);
      }
      
      // Set empty array - no admission results is a valid state, not an error
      setApplications([]);
      setError(''); // Clear error - empty data is normal
      
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

  const acceptAdmission = async (applicationId) => {
    if (!window.confirm('Are you sure you want to accept this admission offer? This will automatically decline all other offers.')) {
      return;
    }

    try {
      await applicationService.acceptAdmission(applicationId);
      addNotification({
        type: 'success',
        title: 'Admission Accepted',
        message: 'You have successfully accepted the admission offer'
      });
      
      // Reload applications to reflect the change
      loadAdmissionResults();
    } catch (err) {
      console.error('Error accepting admission:', err);
      setError(err.message || 'Failed to accept admission');
      addNotification({
        type: 'error',
        title: 'Acceptance Failed',
        message: err.message || 'Failed to accept admission offer'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'admitted':
      case 'accepted':
        return 'success';
      case 'waiting':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'pending':
      case 'under-review':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      'admitted': 'ADMITTED',
      'accepted': 'ACCEPTED',
      'waiting': 'WAITLISTED',
      'rejected': 'REJECTED',
      'pending': 'PENDING',
      'under-review': 'UNDER REVIEW'
    };
    return statusLabels[status] || status.toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    // Handle Firestore Timestamp
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const getAdmissionStats = () => {
    const total = applications.length;
    const admitted = applications.filter(a => a.status === 'admitted' || a.status === 'accepted').length;
    const waitlisted = applications.filter(a => a.status === 'waiting').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;
    const pending = applications.filter(a => a.status === 'pending' || a.status === 'under-review').length;
    
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

      {error && (
        <div className="error-message">
          {error === 'Internal server error' ? 'Unable to load admission results. Please try again later.' : error}
        </div>
      )}

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
        {applications.length === 0 ? (
          <div className="empty-results">
            <h3>No Admission Results Yet</h3>
            <p>Your admission decisions will appear here once they are available.</p>
          </div>
        ) : (
          applications.map(application => {
            const decisionDate = application.admissionDecision?.decisionDate || 
                                 application.updatedAt || 
                                 application.applicationDate;
            
            return (
              <div 
                key={application.id} 
                className={`admission-card status-${getStatusColor(application.status)}`}
              >
                <div className="admission-header">
                  <div className="status-indicator">
                    <span className="status-text">{getStatusLabel(application.status)}</span>
                  </div>
                  {decisionDate && (
                    <div className="admission-date">
                      Decided: {formatDate(decisionDate)}
                    </div>
                  )}
                </div>

                <div className="admission-body">
                  <h3 className="course-name">{application.courseName}</h3>
                  <p className="institution-name">{application.institutionName}</p>
                  
                  {application.admissionDecision && (
                    <div className="decision-message">
                      <p>
                        {application.status === 'admitted' && 
                          `Congratulations! You have been admitted to the ${application.courseName} program.`}
                        {application.status === 'waiting' && 
                          `You have been placed on the waitlist for the ${application.courseName} program.`}
                        {application.status === 'rejected' && 
                          `We regret to inform you that your application was not successful.`}
                        {application.status === 'accepted' && 
                          `You have accepted the admission offer for ${application.courseName}.`}
                      </p>
                    </div>
                  )}

                  {application.waitlistPosition && (
                    <div className="waitlist-info">
                      <strong>Waitlist Position:</strong> #{application.waitlistPosition}
                    </div>
                  )}

                  {application.admissionDecision?.notes && (
                    <div className="conditions-info">
                      <strong>Notes:</strong> {application.admissionDecision.notes}
                    </div>
                  )}

                  {application.notes && (
                    <div className="conditions-info">
                      <strong>Additional Information:</strong> {application.notes}
                    </div>
                  )}
                </div>

                <div className="admission-footer">
                  <div className="applied-date">
                    Applied: {formatDate(application.applicationDate)}
                  </div>
                  
                  <div className="admission-actions">
                    {application.status === 'admitted' && (
                      <button 
                        onClick={() => acceptAdmission(application.id)}
                        className="accept-btn"
                      >
                        Accept Offer
                      </button>
                    )}
                    
                    {application.status === 'accepted' && (
                      <span className="accepted-badge">Offer Accepted</span>
                    )}

                    <button 
                      onClick={() => setSelectedApplication(application)}
                      className="details-btn"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })
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
      {selectedApplication && (
        <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Admission Details</h2>
              <button 
                onClick={() => setSelectedApplication(null)}
                className="close-button"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>{selectedApplication.courseName}</h3>
                <p className="institution">{selectedApplication.institutionName}</p>
              </div>

              <div className="detail-section">
                <h4>Application Timeline</h4>
                <div className="timeline">
                  <div className="timeline-item">
                    <span className="timeline-date">
                      {formatDate(selectedApplication.applicationDate)}
                    </span>
                    <span className="timeline-event">Application Submitted</span>
                  </div>
                  {selectedApplication.admissionDecision?.decisionDate && (
                    <div className="timeline-item">
                      <span className="timeline-date">
                        {formatDate(selectedApplication.admissionDecision.decisionDate)}
                      </span>
                      <span className="timeline-event">Decision Made</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h4>Decision Details</h4>
                <p>
                  {selectedApplication.status === 'admitted' && 
                    `Congratulations! You have been admitted to the ${selectedApplication.courseName} program.`}
                  {selectedApplication.status === 'waiting' && 
                    `You have been placed on the waitlist for the ${selectedApplication.courseName} program.`}
                  {selectedApplication.status === 'rejected' && 
                    `We regret to inform you that your application was not successful.`}
                  {selectedApplication.status === 'accepted' && 
                    `You have accepted the admission offer for ${selectedApplication.courseName}.`}
                </p>
                
                {selectedApplication.admissionDecision?.notes && (
                  <div className="conditions">
                    <h5>Notes:</h5>
                    <p>{selectedApplication.admissionDecision.notes}</p>
                  </div>
                )}

                {selectedApplication.waitlistPosition && (
                  <div className="waitlist-info">
                    <h5>Waitlist Information:</h5>
                    <p>Your position on the waitlist: #{selectedApplication.waitlistPosition}</p>
                  </div>
                )}
              </div>

              {selectedApplication.status === 'admitted' && (
                <div className="action-section">
                  <button 
                    onClick={() => {
                      acceptAdmission(selectedApplication.id);
                      setSelectedApplication(null);
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