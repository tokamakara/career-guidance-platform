import React, { useState, useEffect } from 'react';
import { applicationService } from '../../../services/api/applicationService';
import { useNotification } from '../../../context/NotificationContext';
import './MyApplications.css';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const { addNotification } = useNotification();

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const result = await applicationService.getStudentApplications(
        filter === 'all' ? null : filter
      );
      
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
      
      setApplications(applicationsData);
    } catch (error) {
      // Only log if it's an actual error (not empty data scenario)
      if (error.message && !error.message.includes('returning empty')) {
        console.warn('Error fetching applications:', error.message);
      }
      
      // Set empty array - no applications is a valid state, not an error
      setApplications([]);
      
      // Only show notification for auth errors
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        // Auth errors are handled elsewhere
        return;
      }
      
      // Don't show error notifications for empty data - it's normal if user has no applications
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAdmission = async (applicationId) => {
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
      fetchApplications(); // Refresh list
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Acceptance Failed',
        message: error.message
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'badge-warning', text: 'Pending Review' },
      'under-review': { class: 'badge-info', text: 'Under Review' },
      admitted: { class: 'badge-success', text: 'Admitted' },
      rejected: { class: 'badge-danger', text: 'Rejected' },
      waiting: { class: 'badge-secondary', text: 'Waiting List' },
      accepted: { class: 'badge-primary', text: 'Accepted' }
    };
    
    const config = statusConfig[status] || { class: 'badge-secondary', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getStatusCounts = () => {
    const counts = {
      all: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      admitted: applications.filter(app => app.status === 'admitted').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return <div className="loading">Loading applications...</div>;
  }

  return (
    <div className="my-applications">
      <div className="page-header">
        <h1>My Applications</h1>
        <p>Track your course applications and admission status</p>
      </div>

      {/* Filters */}
      <div className="filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({statusCounts.all})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({statusCounts.pending})
        </button>
        <button
          className={`filter-btn ${filter === 'admitted' ? 'active' : ''}`}
          onClick={() => setFilter('admitted')}
        >
          Admitted ({statusCounts.admitted})
        </button>
        <button
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({statusCounts.rejected})
        </button>
      </div>

      {/* Applications List */}
      <div className="applications-list">
        {applications.length === 0 ? (
          <div className="empty-state">
            <h3>No applications found</h3>
            <p>You haven't submitted any course applications yet.</p>
            <a href="/student/education/apply" className="btn-primary">
              Apply to Courses
            </a>
          </div>
        ) : (
          applications.map(application => (
            <div key={application.id} className="application-card">
              <div className="application-header">
                <div className="application-info">
                  <h3>{application.courseName}</h3>
                  <p className="institution">{application.institutionName}</p>
                  <div className="application-meta">
                    <span className="applied-date">
                      Applied: {new Date(application.applicationDate?.toDate?.() || application.applicationDate).toLocaleDateString()}
                    </span>
                    <span className="priority">
                      Priority: {application.priority}
                    </span>
                  </div>
                </div>
                <div className="application-status">
                  {getStatusBadge(application.status)}
                </div>
              </div>

              {application.admissionDecision && (
                <div className="admission-decision">
                  <h4>Admission Decision</h4>
                  <div className="decision-details">
                    <span><strong>Decision:</strong> {application.admissionDecision.decision}</span>
                    <span><strong>Date:</strong> {new Date(application.admissionDecision.decisionDate?.toDate?.() || application.admissionDecision.decisionDate).toLocaleDateString()}</span>
                    {application.admissionDecision.notes && (
                      <span><strong>Notes:</strong> {application.admissionDecision.notes}</span>
                    )}
                  </div>
                </div>
              )}

              {application.notes && (
                <div className="application-notes">
                  <strong>Notes:</strong> {application.notes}
                </div>
              )}

              <div className="application-actions">
                {application.status === 'admitted' && (
                  <button
                    onClick={() => handleAcceptAdmission(application.id)}
                    className="btn-success"
                  >
                    Accept Admission
                  </button>
                )}
                <a
                  href={`/student/education/institutions?institution=${application.institutionId}`}
                  className="btn-outline"
                >
                  View Institution
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyApplications;