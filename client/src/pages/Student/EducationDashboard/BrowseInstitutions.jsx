import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import {  institutionService } from '../../../services/api/instituteService';
import { studentService } from '../../../services/api/studentService';
import { 
  getQualifiedCourses, 
  getCourseQualificationDetails,
  canApplyToInstitution 
} from '../../../utils/courseQualification';
import { HIGH_SCHOOL_SUBJECTS } from '../../../utils/gradeSystem';
import './BrowseInstitutions.css';

const BrowseInstitutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [studentGrades, setStudentGrades] = useState(null);
  const [showOnlyQualified, setShowOnlyQualified] = useState(true);
  
  const { user } = useAuth();

  useEffect(() => {
    loadInstitutions();
    loadStudentGrades();
  }, []);

  useEffect(() => {
    let filtered = institutions;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(inst =>
        inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply qualification filter
    if (showOnlyQualified && studentGrades) {
      filtered = filtered.filter(institution => 
        canApplyToInstitution(institution, studentGrades)
      );
    }
    
    setFilteredInstitutions(filtered);
  }, [searchTerm, institutions, showOnlyQualified, studentGrades]);

  const loadInstitutions = async () => {
    try {
      const data = await instituteService.getInstitutions();
      setInstitutions(data);
      setFilteredInstitutions(data);
    } catch (error) {
      console.error('Error loading institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentGrades = async () => {
    try {
      const student = await studentService.getStudentProfile(user.uid);
      setStudentGrades(student.highSchoolGrades || {});
    } catch (error) {
      console.error('Error loading student grades:', error);
    }
  };

  const getCoursesToShow = (institution) => {
    if (!institution.courses) return [];
    
    if (showOnlyQualified && studentGrades) {
      // ONLY show courses the student qualifies for
      return getQualifiedCourses(institution, studentGrades);
    }
    
    return institution.courses;
  };

  const getInstitutionStats = (institution) => {
    const totalCourses = institution.courses?.length || 0;
    const qualifiedCourses = studentGrades ? getQualifiedCourses(institution, studentGrades).length : 0;
    
    return { totalCourses, qualifiedCourses };
  };

  if (loading) {
    return <div className="loading">Loading institutions...</div>;
  }

  return (
    <div className="browse-institutions">
      <div className="page-header">
        <h1>Browse Institutions</h1>
        <p>Discover higher learning institutions in Lesotho - See only courses you qualify for!</p>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search institutions by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        {studentGrades && Object.keys(studentGrades).length > 0 && (
          <label className="filter-toggle">
            <input
              type="checkbox"
              checked={showOnlyQualified}
              onChange={(e) => setShowOnlyQualified(e.target.checked)}
            />
            Show only institutions with courses I qualify for
          </label>
        )}
      </div>

      {!studentGrades || Object.keys(studentGrades).length === 0 ? (
        <div className="warning-message">
          <h3>📚 Complete Your Academic Profile First</h3>
          <p>You need to add your high school subjects and grades before you can see which courses you qualify for.</p>
          <button 
            onClick={() => window.location.href = '/student/education/profile'}
            className="primary-button"
          >
            Add Your High School Grades
          </button>
        </div>
      ) : (
        <>
          <div className="student-grades-summary">
            <h4>Your High School Grades:</h4>
            <div className="grades-list">
              {Object.entries(studentGrades).map(([subject, grade]) => (
                <span key={subject} className="grade-badge">
                  {subject}: <strong>{grade}</strong>
                </span>
              ))}
            </div>
          </div>

          <div className="institutions-grid">
            {filteredInstitutions.map(institution => {
              const stats = getInstitutionStats(institution);
              const coursesToShow = getCoursesToShow(institution);
              
              return (
                <div key={institution.id} className="institution-card">
                  <div className="institution-header">
                    <h3>{institution.name}</h3>
                    <span className="location">{institution.location}</span>
                  </div>
                  
                  <p className="description">{institution.description}</p>
                  
                  <div className="institution-stats">
                    <div className="stat">
                      <strong>{stats.totalCourses}</strong>
                      <span>Total Courses</span>
                    </div>
                    <div className="stat qualified">
                      <strong>{stats.qualifiedCourses}</strong>
                      <span>You Qualify For</span>
                    </div>
                  </div>

                  <div className="institution-actions">
                    <button
                      onClick={() => setSelectedInstitution(institution)}
                      className="view-courses-button"
                      disabled={coursesToShow.length === 0}
                    >
                      {coursesToShow.length === 0 ? 'No Qualified Courses' : `View ${coursesToShow.length} Courses`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Course Modal */}
      {selectedInstitution && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Courses at {selectedInstitution.name}</h2>
              <p>Only showing courses you qualify for based on your grades</p>
              <button 
                onClick={() => setSelectedInstitution(null)}
                className="close-button"
              >
                ×
              </button>
            </div>
            
            <div className="courses-list">
              {getCoursesToShow(selectedInstitution).map(course => {
                const qualification = getCourseQualificationDetails(course, studentGrades);
                
                return (
                  <div key={course.id} className="course-item qualified">
                    <div className="course-info">
                      <h4>{course.name}</h4>
                      <p className="course-description">{course.description}</p>
                      <div className="course-duration">
                        <strong>Duration:</strong> {course.duration}
                      </div>
                      <div className="course-requirements">
                        <strong>Requirements Met ✅:</strong>
                        <ul>
                          {Object.entries(course.requirements || {}).map(([subject, grade]) => (
                            <li key={subject}>
                              {subject}: {grade} 
                              <span className="grade-status met">
                                (Your grade: {studentGrades[subject]})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="course-actions">
                      <button
                        onClick={() => {
                          window.location.href = `/student/education/apply?institution=${selectedInstitution.id}&course=${course.id}`;
                        }}
                        className="apply-button"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {getCoursesToShow(selectedInstitution).length === 0 && (
                <div className="no-courses-message">
                  <p>No courses available that you qualify for at this institution.</p>
                  <p>Check the requirements for each course or improve your grades in required subjects.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseInstitutions;