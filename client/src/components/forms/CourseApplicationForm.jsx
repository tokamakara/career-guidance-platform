import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { applicationService } from '../../../services/api/applicationService';
import { studentService } from '../../../services/api/studentService';
import { instituteService } from '../../../services/api/instituteService';
import { getCourseQualificationDetails } from '../../../utils/courseQualification';

const CourseApplicationForm = ({ institutionId, courseId, onSuccess }) => {
  const [institution, setInstitution] = useState(null);
  const [course, setCourse] = useState(null);
  const [studentGrades, setStudentGrades] = useState(null);
  const [qualification, setQualification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, [institutionId, courseId]);

  const loadData = async () => {
    try {
      const [institutionData, courseData, studentData] = await Promise.all([
        instituteService.getInstitution(institutionId),
        instituteService.getCourse(institutionId, courseId),
        studentService.getStudentProfile(user.uid)
      ]);

      setInstitution(institutionData);
      setCourse(courseData);
      setStudentGrades(studentData.highSchoolGrades || {});

      const qual = getCourseQualificationDetails(courseData, studentData.highSchoolGrades || {});
      setQualification(qual);

    } catch (error) {
      setError('Failed to load application data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Check if student still qualifies
      if (!qualification.qualified) {
        setError('You no longer meet the course requirements');
        return;
      }

      // Check application limits
      const studentApps = await applicationService.getStudentApplications(user.uid);
      const institutionApps = studentApps.filter(app => app.institutionId === institutionId);
      
      if (institutionApps.length >= 2) {
        setError('You can only apply to maximum 2 courses per institution');
        return;
      }

      const applicationData = {
        studentId: user.uid,
        institutionId,
        courseId,
        courseName: course.name,
        institutionName: institution.name,
        studentGrades,
        appliedAt: new Date().toISOString()
      };

      await applicationService.submitApplication(applicationData);
      onSuccess?.();

    } catch (error) {
      setError(error.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading application form...</div>;
  }

  if (!qualification.qualified) {
    return (
      <div className="application-error">
        <h3>Application Not Allowed</h3>
        <p>You do not meet the requirements for this course:</p>
        
        <div className="requirement-errors">
          {qualification.missingSubjects.length > 0 && (
            <div>
              <strong>Missing Subjects:</strong>
              <ul>
                {qualification.missingSubjects.map(subject => (
                  <li key={subject}>{subject}</li>
                ))}
              </ul>
            </div>
          )}
          
          {qualification.failedRequirements.length > 0 && (
            <div>
              <strong>Grade Requirements Not Met:</strong>
              <ul>
                {qualification.failedRequirements.map((req, index) => (
                  <li key={index}>{req.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button 
          onClick={() => window.history.back()}
          className="back-button"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="course-application-form">
      <div className="application-header">
        <h2>Apply to {course.name}</h2>
        <p className="institution-name">{institution.name}</p>
      </div>

      <div className="application-summary">
        <h4>Application Summary</h4>
        <div className="summary-grid">
          <div className="summary-item">
            <label>Course:</label>
            <span>{course.name}</span>
          </div>
          <div className="summary-item">
            <label>Institution:</label>
            <span>{institution.name}</span>
          </div>
          <div className="summary-item">
            <label>Duration:</label>
            <span>{course.duration}</span>
          </div>
          <div className="summary-item">
            <label>Qualification Status:</label>
            <span className="qualified-badge">Qualified ✅</span>
          </div>
        </div>
      </div>

      <div className="grades-review">
        <h4>Your Grades Meeting Requirements:</h4>
        <div className="grades-list">
          {Object.entries(course.requirements || {}).map(([subject, requiredGrade]) => (
            <div key={subject} className="grade-item met">
              <span className="subject">{subject}:</span>
              <span className="required-grade">Requires {requiredGrade}</span>
              <span className="student-grade">Your grade: {studentGrades[subject]}</span>
              <span className="status">✅ Meets requirement</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="application-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-section">
          <h4>Additional Information</h4>
          <div className="form-group">
            <label htmlFor="personalStatement">Personal Statement (Optional)</label>
            <textarea
              id="personalStatement"
              name="personalStatement"
              rows="4"
              placeholder="Tell us why you're interested in this course..."
              disabled={submitting}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="cancel-button"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="submit-application-button"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseApplicationForm;