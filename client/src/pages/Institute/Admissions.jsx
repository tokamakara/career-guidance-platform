import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {  institutionService } from '../../services/api/instituteService';
import Table from '../../components/ui/Table';

const Admissions = () => {
  const [applications, setApplications] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadApplications();
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const data = await instituteService.getCourses();
      setCourses(data);
      if (data.length > 0) {
        setSelectedCourse(data[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await instituteService.getCourseApplications(selectedCourse);
      setApplications(data);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateAdmissionStatus = async (applicationId, status) => {
    try {
      setUpdating(true);
      await instituteService.updateAdmissionStatus(applicationId, status);
      await loadApplications(); // Reload to get updated status
    } catch (err) {
      setError(err.message || 'Failed to update admission status');
    } finally {
      setUpdating(false);
    }
  };

  const publishAdmissions = async () => {
    try {
      await instituteService.publishAdmissions(selectedCourse);
      alert('Admissions published successfully!');
      await loadApplications();
    } catch (err) {
      setError(err.message || 'Failed to publish admissions');
    }
  };

  const columns = [
    {
      header: 'Student',
      key: 'studentName',
      width: '25%',
      render: (row) => (
        <div className="student-info">
          <div className="student-name">{row.studentName}</div>
          <div className="student-email">{row.studentEmail}</div>
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
      header: 'Grades',
      key: 'grades',
      width: '20%',
      render: (row) => (
        <button 
          className="view-grades-btn"
          onClick={() => viewStudentGrades(row)}
        >
          View Grades
        </button>
      )
    },
    {
      header: 'Status',
      key: 'status',
      width: '20%',
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => updateAdmissionStatus(row.id, e.target.value)}
          disabled={updating}
          className={`status-select status-${row.status}`}
        >
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="admitted">Admitted</option>
          <option value="waitlisted">Waitlisted</option>
          <option value="rejected">Rejected</option>
        </select>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      width: '20%',
      render: (row) => (
        <div className="action-buttons">
          <button 
            className="contact-btn"
            onClick={() => contactStudent(row)}
          >
            Contact
          </button>
        </div>
      )
    }
  ];

  const viewStudentGrades = (application) => {
    // Implement grade viewing modal
    console.log('View grades for:', application);
    alert(`Grades for ${application.studentName}: ${JSON.stringify(application.studentGrades, null, 2)}`);
  };

  const contactStudent = (application) => {
    window.location.href = `mailto:${application.studentEmail}`;
  };

  const getAdmissionStats = () => {
    const total = applications.length;
    const admitted = applications.filter(app => app.status === 'admitted').length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const waitlisted = applications.filter(app => app.status === 'waitlisted').length;
    
    return { total, admitted, pending, waitlisted };
  };

  const stats = getAdmissionStats();

  return (
    <div className="admissions-page">
      <div className="page-header">
        <h1>Admission Management</h1>
        <p>Manage student applications and admission decisions</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admissions-controls">
        <div className="course-selector">
          <label>Select Course:</label>
          <select 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.applications || 0} applications)
              </option>
            ))}
          </select>
        </div>

        <div className="admission-actions">
          <button 
            onClick={publishAdmissions}
            className="publish-btn"
            disabled={applications.length === 0}
          >
            Publish Admissions
          </button>
        </div>
      </div>

      {selectedCourse && (
        <div className="admissions-content">
          {/* Statistics */}
          <div className="admission-stats">
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Applications</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.admitted}</div>
              <div className="stat-label">Admitted</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.waitlisted}</div>
              <div className="stat-label">Waitlisted</div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="applications-section">
            <h3>
              Applications for {courses.find(c => c.id === selectedCourse)?.name}
              <span className="application-count">({applications.length} applications)</span>
            </h3>

            <Table
              columns={columns}
              data={applications}
              loading={loading}
              emptyMessage="No applications found for this course"
            />
          </div>

          {/* Waitlist Management */}
          {stats.waitlisted > 0 && (
            <div className="waitlist-section">
              <h3>Waitlist Management</h3>
              <div className="waitlist-actions">
                <button className="promote-btn">
                  Promote Next Waitlisted Student
                </button>
                <span className="waitlist-info">
                  {stats.waitlisted} students on waitlist
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admissions;