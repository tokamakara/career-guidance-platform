import React, { useState, useEffect } from 'react';
import { useForm } from '../../../hooks/useForm';
import { applicationService } from '../../../services/api/applicationService';
import { institutionService } from '../../../services/api/instituteService';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
//import FormField from '../../components/forms/FormField';
import { HIGH_SCHOOL_SUBJECTS, getGradeOptions, meetsGradeRequirement } from '../../../utils/gradeSystem';
import './ApplyInstitutions.css';

const ApplyInstitutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [highSchoolSubjects, setHighSchoolSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSubjectsForm, setShowSubjectsForm] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const { addNotification } = useNotification();
  const { userProfile, updateProfile } = useAuth();

  const { formData, updateField, handleBlur, validate, errors, touched, resetForm } = useForm({
    institutionId: '',
    facultyId: '',
    courseId: '',
    documents: []
  });

  const gradeOptions = getGradeOptions();

  useEffect(() => {
    fetchInstitutions();
    initializeHighSchoolSubjects();
  }, []);

  useEffect(() => {
    if (formData.institutionId) {
      fetchInstitutionDetails(formData.institutionId);
    }
  }, [formData.institutionId]);

  useEffect(() => {
    if (formData.facultyId && selectedInstitution) {
      fetchFacultyCourses(formData.institutionId, formData.facultyId);
    }
  }, [formData.facultyId, selectedInstitution]);

  useEffect(() => {
    if (courses.length > 0 && highSchoolSubjects.length > 0) {
      filterQualifiedCourses();
    }
  }, [courses, highSchoolSubjects]);

  const initializeHighSchoolSubjects = () => {
    if (userProfile?.highSchoolResults?.length > 0) {
      setHighSchoolSubjects(userProfile.highSchoolResults);
      setShowSubjectsForm(false);
    } else {
      const initialSubjects = HIGH_SCHOOL_SUBJECTS.map(subject => ({
        name: subject,
        grade: '',
        completed: false
      }));
      setHighSchoolSubjects(initialSubjects);
      setShowSubjectsForm(true);
    }
  };

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const result = await institutionService.getInstitutions();
      setInstitutions(result.data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load institutions'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutionDetails = async (institutionId) => {
    try {
      const result = await institutionService.getInstitutionDetails(institutionId);
      setSelectedInstitution(result.data);
      setSelectedFaculty(null);
      setCourses([]);
      setFilteredCourses([]);
      updateField('facultyId', '');
      updateField('courseId', '');
    } catch (error) {
      console.error('Error fetching institution details:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load institution details'
      });
    }
  };

  const fetchFacultyCourses = async (institutionId, facultyId) => {
    try {
      setLoadingCourses(true);
      const result = await institutionService.getFacultyCourses(institutionId, facultyId);
      setCourses(result.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load courses'
      });
    } finally {
      setLoadingCourses(false);
    }
  };

  const filterQualifiedCourses = () => {
    const completedSubjects = highSchoolSubjects.filter(subject => subject.completed);
    
    const qualifiedCourses = courses.filter(course => {
      if (!course.requirements || course.requirements.length === 0) {
        return true; // No requirements = all students qualify
      }

      return course.requirements.every(requirement => {
        const studentSubject = completedSubjects.find(
          subject => subject.name === requirement.subject
        );
        
        return studentSubject && meetsGradeRequirement(studentSubject.grade, requirement.grade);
      });
    });

    setFilteredCourses(qualifiedCourses);
  };

  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = [...highSchoolSubjects];
    
    if (field === 'completed') {
      updatedSubjects[index].completed = value;
      if (!value) {
        updatedSubjects[index].grade = '';
      }
    } else if (field === 'grade') {
      updatedSubjects[index].grade = value;
      if (value !== '') {
        updatedSubjects[index].completed = true;
      }
    }
    
    setHighSchoolSubjects(updatedSubjects);
  };

  const saveHighSchoolResults = async () => {
    try {
      const completedSubjects = highSchoolSubjects
        .filter(subject => subject.completed && subject.grade)
        .map(subject => ({
          name: subject.name,
          grade: subject.grade,
          percentage: subject.percentage || 0
        }));
      
      if (completedSubjects.length < 5) {
        addNotification({
          type: 'error',
          title: 'Incomplete Subjects',
          message: 'Please complete at least 5 subjects with grades'
        });
        return;
      }

      await updateProfile({
        highSchoolResults: completedSubjects
      });

      setShowSubjectsForm(false);
      addNotification({
        type: 'success',
        title: 'Subjects Saved',
        message: 'Your high school results have been saved successfully'
      });

      // Re-filter courses with new subjects
      filterQualifiedCourses();

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save high school results'
      });
    }
  };

  const checkCourseQualification = (course) => {
    const completedSubjects = highSchoolSubjects.filter(subject => subject.completed);
    
    if (!course.requirements || course.requirements.length === 0) {
      return { qualified: true, missingRequirements: [] };
    }

    const missingRequirements = course.requirements.filter(requirement => {
      const studentSubject = completedSubjects.find(
        subject => subject.name === requirement.subject
      );
      
      return !studentSubject || !meetsGradeRequirement(studentSubject.grade, requirement.grade);
    });

    return {
      qualified: missingRequirements.length === 0,
      missingRequirements
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill all required fields correctly'
      });
      return;
    }

    const selectedCourse = courses.find(course => course.id === formData.courseId);
    const qualificationStatus = checkCourseQualification(selectedCourse);

    if (!qualificationStatus.qualified) {
      addNotification({
        type: 'error',
        title: 'Not Qualified',
        message: 'You do not meet the course requirements'
      });
      return;
    }

    try {
      setSubmitting(true);
      const result = await applicationService.applyToCourse({
        institutionId: formData.institutionId,
        facultyId: formData.facultyId,
        courseId: formData.courseId,
        documents: formData.documents
      });
      
      addNotification({
        type: 'success',
        title: 'Application Submitted',
        message: result.message
      });

      // Reset form
      resetForm();
      setSelectedInstitution(null);
      setSelectedFaculty(null);
      setCourses([]);
      setFilteredCourses([]);

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Application Failed',
        message: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedCourse = () => {
    return courses.find(course => course.id === formData.courseId);
  };

  const renderRequirementStatus = (course) => {
    const qualificationStatus = checkCourseQualification(course);
    
    if (qualificationStatus.qualified) {
      return <span className="qualified-badge">✅ Qualified</span>;
    } else {
      return <span className="not-qualified-badge">❌ Not Qualified</span>;
    }
  };

  if (loading) {
    return <div className="loading">Loading institutions...</div>;
  }

  return (
    <div className="apply-institutions">
      <div className="page-header">
        <h1>Apply to Institutions</h1>
        <p>Submit your applications to courses in Lesotho institutions</p>
      </div>

      {showSubjectsForm && (
        <div className="subjects-form-section">
          <div className="subjects-form">
            <h3>Enter Your Cambridge O-Level Results</h3>
            <p>Please select your completed subjects and enter your grades. You need at least 5 subjects.</p>
            
            <div className="subjects-grid">
              {highSchoolSubjects.map((subject, index) => (
                <div key={subject.name} className="subject-input">
                  <label className="subject-checkbox">
                    <input
                      type="checkbox"
                      checked={subject.completed}
                      onChange={(e) => handleSubjectChange(index, 'completed', e.target.checked)}
                    />
                    <span>{subject.name}</span>
                  </label>
                  
                  {subject.completed && (
                    <select
                      value={subject.grade}
                      onChange={(e) => handleSubjectChange(index, 'grade', e.target.value)}
                      className="grade-select"
                    >
                      <option value="">Select Grade</option>
                      {gradeOptions.map(grade => (
                        <option key={grade.value} value={grade.value}>
                          {grade.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>

            <div className="subjects-actions">
              <button
                type="button"
                onClick={saveHighSchoolResults}
                className="btn-primary"
                disabled={highSchoolSubjects.filter(s => s.completed && s.grade).length < 5}
              >
                Save Results ({highSchoolSubjects.filter(s => s.completed && s.grade).length}/5+ subjects)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="application-form-container">
        <form onSubmit={handleSubmit} className="application-form">
          <div className="form-section">
            <h3>Select Institution & Course</h3>
            
            <div className="form-group">
              <label className="form-label">Institution</label>
              <select
                name="institutionId"
                value={formData.institutionId}
                onChange={(e) => updateField('institutionId', e.target.value)}
                onBlur={() => handleBlur('institutionId')}
                className={`form-field ${errors.institutionId && touched.institutionId ? 'error' : ''}`}
                required
              >
                <option value="">Select an Institution</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} - {inst.location}
                  </option>
                ))}
              </select>
              {errors.institutionId && touched.institutionId && (
                <div className="error-message">{errors.institutionId}</div>
              )}
            </div>

            {selectedInstitution && (
              <div className="form-group">
                <label className="form-label">Faculty</label>
                <select
                  name="facultyId"
                  value={formData.facultyId}
                  onChange={(e) => updateField('facultyId', e.target.value)}
                  onBlur={() => handleBlur('facultyId')}
                  className={`form-field ${errors.facultyId && touched.facultyId ? 'error' : ''}`}
                  required
                >
                  <option value="">Select a Faculty</option>
                  {selectedInstitution.faculties?.map(fac => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name}
                    </option>
                  )) || []}
                </select>
                {errors.facultyId && touched.facultyId && (
                  <div className="error-message">{errors.facultyId}</div>
                )}
              </div>
            )}

            {selectedFaculty && (
              <div className="form-group">
                <label className="form-label">
                  Course
                  {loadingCourses && <span className="loading-text"> (Loading courses...)</span>}
                </label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={(e) => updateField('courseId', e.target.value)}
                  onBlur={() => handleBlur('courseId')}
                  className={`form-field ${errors.courseId && touched.courseId ? 'error' : ''}`}
                  required
                >
                  <option value="">Select a Course</option>
                  {filteredCourses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} - {course.code} ({course.seatsAvailable} seats) - {renderRequirementStatus(course)}
                    </option>
                  ))}
                  {filteredCourses.length === 0 && courses.length > 0 && (
                    <option value="" disabled>
                      No qualified courses - check your subjects
                    </option>
                  )}
                </select>
                {errors.courseId && touched.courseId && (
                  <div className="error-message">{errors.courseId}</div>
                )}
              </div>
            )}
          </div>

          {getSelectedCourse() && (
            <div className="course-details">
              <h4>Course Details</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <strong>Course Name:</strong>
                  <span>{getSelectedCourse().name}</span>
                </div>
                <div className="detail-item">
                  <strong>Course Code:</strong>
                  <span>{getSelectedCourse().code}</span>
                </div>
                <div className="detail-item">
                  <strong>Institution:</strong>
                  <span>{selectedInstitution.name}</span>
                </div>
                <div className="detail-item">
                  <strong>Faculty:</strong>
                  <span>{selectedFaculty.name}</span>
                </div>
                <div className="detail-item">
                  <strong>Duration:</strong>
                  <span>{getSelectedCourse().duration}</span>
                </div>
                <div className="detail-item">
                  <strong>Seats Available:</strong>
                  <span>{getSelectedCourse().seatsAvailable}</span>
                </div>
                <div className="detail-item full-width">
                  <strong>Requirements:</strong>
                  <div className="requirements-list">
                    {getSelectedCourse().requirements?.map((req, index) => {
                      const studentSubject = highSchoolSubjects.find(
                        s => s.name === req.subject && s.completed
                      );
                      const meetsRequirement = studentSubject && 
                        meetsGradeRequirement(studentSubject.grade, req.grade);
                      
                      return (
                        <div 
                          key={index} 
                          className={`requirement ${meetsRequirement ? 'met' : 'not-met'}`}
                        >
                          <span className="req-subject">{req.subject}:</span>
                          <span className="req-grade">Minimum {req.grade}</span>
                          {studentSubject && (
                            <span className="student-grade">(Your grade: {studentSubject.grade})</span>
                          )}
                          {meetsRequirement ? ' ✅' : ' ❌'}
                        </div>
                      );
                    })}
                    {(!getSelectedCourse().requirements || getSelectedCourse().requirements.length === 0) && (
                      <div className="requirement met">
                        No specific requirements
                      </div>
                    )}
                  </div>
                </div>
                {getSelectedCourse().description && (
                  <div className="detail-item full-width">
                    <strong>Description:</strong>
                    <span>{getSelectedCourse().description}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !formData.courseId}
            >
              {submitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </form>

        <div className="application-info">
          <h3>Application Guidelines</h3>
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon">📝</div>
              <h4>Application Limit</h4>
              <p>Maximum 2 courses per institution</p>
            </div>
            <div className="info-card">
              <div className="info-icon">⏰</div>
              <h4>Deadlines</h4>
              <p>Check individual course deadlines</p>
            </div>
            <div className="info-card">
              <div className="info-icon">✅</div>
              <h4>Requirements</h4>
              <p>Only qualified courses are shown</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📧</div>
              <h4>Notifications</h4>
              <p>Email updates about application status</p>
            </div>
          </div>

          {highSchoolSubjects.some(s => s.completed && s.grade) && (
            <div className="subjects-summary">
              <h4>Your O-Level Results</h4>
              <div className="subjects-list">
                {highSchoolSubjects
                  .filter(subject => subject.completed && subject.grade)
                  .map((subject, index) => (
                    <div key={index} className="subject-result">
                      <span>{subject.name}:</span>
                      <strong>{subject.grade}</strong>
                    </div>
                  ))
                }
              </div>
              <button
                type="button"
                onClick={() => setShowSubjectsForm(true)}
                className="btn-outline small"
              >
                Edit Results
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyInstitutions;