import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { institutionService } from '../../../services/api/instituteService';
import { useNotification } from '../../../context/NotificationContext';
import { 
  getQualifiedCourses, 
  getCourseQualificationDetails,
  canApplyToInstitution 
} from '../../../utils/courseQualification';
import { HIGH_SCHOOL_SUBJECTS, getGradeOptions, meetsGradeRequirement } from '../../../utils/gradeSystem';
import { debounce } from '../../../utils/debounce';
import './BrowseInstitutions.css';

const BrowseInstitutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState([]);
  const [allCourses, setAllCourses] = useState([]); // All courses from all institutions
  const [qualifiedCourses, setQualifiedCourses] = useState([]); // Only qualified courses
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [highSchoolSubjects, setHighSchoolSubjects] = useState([]);
  const [showSubjectsForm, setShowSubjectsForm] = useState(false);
  const [showOnlyQualified, setShowOnlyQualified] = useState(true);
  const [institutionFilter, setInstitutionFilter] = useState('all'); // Filter by institution
  const [subjectsSubmitted, setSubjectsSubmitted] = useState(false);
  
  const { userProfile, updateProfile } = useAuth();
  const { addNotification } = useNotification();

  const gradeOptions = getGradeOptions();

  useEffect(() => {
    loadInstitutions();
    initializeHighSchoolSubjects();
  }, []);

  useEffect(() => {
    if (subjectsSubmitted && highSchoolSubjects.length > 0) {
      filterQualifiedCourses();
    }
  }, [institutions, highSchoolSubjects, subjectsSubmitted]);

  // Memoize filtered institutions
  const filteredInstitutionsMemo = useMemo(() => {
    let coursesToShow = showOnlyQualified ? qualifiedCourses : allCourses;
    
    // Apply institution filter
    if (institutionFilter !== 'all') {
      coursesToShow = coursesToShow.filter(course => course.institutionId === institutionFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      coursesToShow = coursesToShow.filter(course =>
        course.name.toLowerCase().includes(searchLower) ||
        course.institutionName.toLowerCase().includes(searchLower) ||
        course.facultyName.toLowerCase().includes(searchLower) ||
        course.code?.toLowerCase().includes(searchLower)
      );
    }

    // Group by institution for display
    const institutionsMap = {};
    coursesToShow.forEach(course => {
      if (!institutionsMap[course.institutionId]) {
        institutionsMap[course.institutionId] = {
          id: course.institutionId,
          name: course.institutionName,
          courses: []
        };
      }
      institutionsMap[course.institutionId].courses.push(course);
    });

    return Object.values(institutionsMap);
  }, [searchTerm, institutionFilter, showOnlyQualified, qualifiedCourses, allCourses]);

  useEffect(() => {
    setFilteredInstitutions(filteredInstitutionsMemo);
  }, [filteredInstitutionsMemo]);

  const initializeHighSchoolSubjects = () => {
    if (userProfile?.highSchoolResults?.length > 0) {
      // Convert from profile format to form format
      const subjectsMap = {};
      userProfile.highSchoolResults.forEach(result => {
        subjectsMap[result.name] = result.grade;
      });
      
      const initialSubjects = HIGH_SCHOOL_SUBJECTS.map(subject => ({
        name: subject,
        grade: subjectsMap[subject] || '',
        completed: !!subjectsMap[subject]
      }));
      
      setHighSchoolSubjects(initialSubjects);
      setShowSubjectsForm(false);
      setSubjectsSubmitted(true);
    } else {
      const initialSubjects = HIGH_SCHOOL_SUBJECTS.map(subject => ({
        name: subject,
        grade: '',
        completed: false
      }));
      setHighSchoolSubjects(initialSubjects);
      setShowSubjectsForm(true);
      setSubjectsSubmitted(false);
    }
  };

  const filterQualifiedCourses = () => {
    const completedSubjects = highSchoolSubjects
      .filter(subject => subject.completed && subject.grade)
      .reduce((acc, subject) => {
        acc[subject.name] = subject.grade;
        return acc;
      }, {});

    // Collect all courses from all institutions
    const allCoursesList = [];
    institutions.forEach(institution => {
      institution.faculties?.forEach(faculty => {
        faculty.courses?.forEach(course => {
          allCoursesList.push({
            ...course,
            institutionId: institution.id,
            institutionName: institution.name,
            facultyId: faculty.id,
            facultyName: faculty.name
          });
        });
      });
    });

    setAllCourses(allCoursesList);

    // Filter qualified courses
    const qualified = allCoursesList.filter(course => {
      if (!course.requirements || course.requirements.length === 0) {
        return true; // No requirements = all qualify
      }

      return course.requirements.every(requirement => {
        const studentGrade = completedSubjects[requirement.subject];
        return studentGrade && meetsGradeRequirement(studentGrade, requirement.grade);
      });
    });

    setQualifiedCourses(qualified);
  };

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      // Use getAllInstitutionsWithCourses for better performance (single API call)
      const result = await institutionService.getAllInstitutionsWithCourses();
      
      // Handle different response formats
      let institutionsData = [];
      if (result && result.success && result.data) {
        institutionsData = result.data;
      } else if (result && Array.isArray(result)) {
        institutionsData = result;
      } else if (result && result.data) {
        institutionsData = result.data;
      } else {
        institutionsData = [];
        console.warn('Unexpected response format:', result);
      }
      
      setInstitutions(institutionsData);
    } catch (error) {
      // Only log if it's an actual error (not empty data)
      if (error.message && !error.message.includes('returning empty')) {
        console.warn('Error loading institutions:', error.message);
      }
      
      // Set empty array - no institutions is a valid state, not an error
      setInstitutions([]);
      
      // Only show notification for auth errors
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        // Auth errors are handled elsewhere
        return;
      }
      
      // Don't show error notifications for empty data - it's normal
    } finally {
      setLoading(false);
    }
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
          grade: subject.grade
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
      setSubjectsSubmitted(true);
      addNotification({
        type: 'success',
        title: 'Subjects Saved',
        message: 'Your high school results have been saved. Qualified courses are now shown!'
      });

      // Filter qualified courses after saving
      filterQualifiedCourses();

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save high school results'
      });
    }
  };

  const getCoursesForInstitution = (institutionId) => {
    if (showOnlyQualified) {
      return qualifiedCourses.filter(course => course.institutionId === institutionId);
    }
    return allCourses.filter(course => course.institutionId === institutionId);
  };

  const checkCourseQualification = (course) => {
    const completedSubjects = highSchoolSubjects
      .filter(subject => subject.completed && subject.grade)
      .reduce((acc, subject) => {
        acc[subject.name] = subject.grade;
        return acc;
      }, {});

    if (!course.requirements || course.requirements.length === 0) {
      return { qualified: true, missingRequirements: [] };
    }

    const missingRequirements = course.requirements.filter(requirement => {
      const studentGrade = completedSubjects[requirement.subject];
      return !studentGrade || !meetsGradeRequirement(studentGrade, requirement.grade);
    });

    return {
      qualified: missingRequirements.length === 0,
      missingRequirements
    };
  };

  if (loading) {
    return <div className="loading">Loading institutions...</div>;
  }

  return (
    <div className="browse-institutions">
      <div className="page-header">
        <h1>Browse Qualified Courses</h1>
        <p>Enter your high school results to see courses you qualify for</p>
      </div>

      {/* Subjects Entry Form - Must be completed first */}
      {showSubjectsForm && (
        <div className="subjects-form-section">
          <div className="subjects-form-card">
            <div className="form-header">
              <h2>Enter Your High School Results</h2>
              <p>Select the subjects you completed and enter your grades. You need at least 5 subjects.</p>
            </div>
            
            <div className="subjects-grid">
              {highSchoolSubjects.map((subject, index) => (
                <div key={subject.name} className="subject-input-card">
                  <label className="subject-checkbox">
                    <input
                      type="checkbox"
                      checked={subject.completed}
                      onChange={(e) => handleSubjectChange(index, 'completed', e.target.checked)}
                    />
                    <span className="subject-name">{subject.name}</span>
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
                className="btn-primary btn-large"
                disabled={highSchoolSubjects.filter(s => s.completed && s.grade).length < 5}
              >
                Submit Results ({highSchoolSubjects.filter(s => s.completed && s.grade).length}/5+ subjects)
              </button>
              <p className="help-text">
                After submitting, you'll see only courses you qualify for!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show qualified courses after subjects are submitted */}
      {subjectsSubmitted && (
        <>
          {/* Your Results Summary */}
          <div className="student-grades-summary">
            <div className="summary-header">
              <h3>Your High School Results</h3>
              <button
                onClick={() => setShowSubjectsForm(true)}
                className="btn-outline btn-small"
              >
                Edit Results
              </button>
            </div>
            <div className="grades-list">
              {highSchoolSubjects
                .filter(subject => subject.completed && subject.grade)
                .map((subject, index) => (
                  <div key={index} className={`grade-badge grade-${subject.grade.replace('*', 'star')}`}>
                    <span className="subject-name">{subject.name}</span>
                    <span className="grade-value">{subject.grade}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Filters Section */}
          <div className="filters-section">
            <div className="search-filter">
              <input
                type="text"
                placeholder="Search courses by name, institution, or faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-controls">
              <div className="filter-group">
                <label>Filter by Institution:</label>
                <select
                  value={institutionFilter}
                  onChange={(e) => setInstitutionFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Institutions</option>
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>

              <label className="filter-toggle">
                <input
                  type="checkbox"
                  checked={showOnlyQualified}
                  onChange={(e) => setShowOnlyQualified(e.target.checked)}
                />
                <span>Show only qualified courses</span>
              </label>
            </div>

            <div className="results-count">
              <strong>
                {showOnlyQualified 
                  ? `${qualifiedCourses.length} qualified course${qualifiedCourses.length !== 1 ? 's' : ''} found`
                  : `${allCourses.length} total course${allCourses.length !== 1 ? 's' : ''} available`
                }
              </strong>
            </div>
          </div>

          {/* Courses Display */}
          {filteredInstitutions.length > 0 ? (
            <div className="courses-container">
              {filteredInstitutions.map(institution => {
                const institutionCourses = getCoursesForInstitution(institution.id);
                
                return (
                  <div key={institution.id} className="institution-courses-section">
                    <div className="institution-header">
                      <h2>{institution.name}</h2>
                      <span className="courses-count">
                        {institutionCourses.length} course{institutionCourses.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="courses-grid">
                      {institutionCourses.map(course => {
                        const qualification = checkCourseQualification(course);
                        
                        return (
                          <div 
                            key={course.id} 
                            className={`course-card ${qualification.qualified ? 'qualified' : 'not-qualified'}`}
                          >
                            <div className="course-header">
                              <h3>{course.name}</h3>
                              {qualification.qualified && (
                                <span className="qualified-badge">Qualified</span>
                              )}
                            </div>
                            
                            <div className="course-info">
                              <div className="info-item">
                                <strong>Code:</strong> {course.code || 'N/A'}
                              </div>
                              <div className="info-item">
                                <strong>Faculty:</strong> {course.facultyName}
                              </div>
                              <div className="info-item">
                                <strong>Duration:</strong> {course.duration || 'N/A'}
                              </div>
                              <div className="info-item">
                                <strong>Seats Available:</strong> {course.seatsAvailable || 0}
                              </div>
                            </div>

                            {course.description && (
                              <p className="course-description">{course.description}</p>
                            )}

                            {course.requirements && course.requirements.length > 0 && (
                              <div className="course-requirements">
                                <strong>Requirements:</strong>
                                <ul>
                                  {course.requirements.map((req, idx) => {
                                    const studentSubject = highSchoolSubjects.find(
                                      s => s.name === req.subject && s.completed
                                    );
                                    const meetsReq = studentSubject && 
                                      meetsGradeRequirement(studentSubject.grade, req.grade);
                                    
                                    return (
                                      <li key={idx} className={meetsReq ? 'met' : 'not-met'}>
                                        {req.subject}: Min {req.grade}
                                        {studentSubject && (
                                          <span className="your-grade">
                                            (Your: {studentSubject.grade})
                                          </span>
                                        )}
                                        {meetsReq ? ' ✓' : ' ✗'}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}

                            <div className="course-actions">
                              {qualification.qualified ? (
                                <button
                                  onClick={() => {
                                    window.location.href = `/student/education/apply?institution=${course.institutionId}&faculty=${course.facultyId}&course=${course.id}`;
                                  }}
                                  className="btn-primary btn-apply"
                                >
                                  Apply Now
                                </button>
                              ) : (
                                <button disabled className="btn-disabled">
                                  Not Qualified
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-results">
              <h3>No courses found</h3>
              <p>
                {showOnlyQualified 
                  ? "You don't qualify for any courses with your current results. Try adjusting your search or check other institutions."
                  : "No courses match your search criteria. Try adjusting your filters."
                }
              </p>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default BrowseInstitutions;