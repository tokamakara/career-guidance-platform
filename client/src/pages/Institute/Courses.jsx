import React, { useState, useEffect } from 'react';
import { useForm } from '../../hooks/useForm';
import { institutionService } from '../../services/api/instituteService';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import FormField from '../../components/forms/FormField';
import { HIGH_SCHOOL_SUBJECTS, getGradeOptions } from '../../utils/gradeSystem';
import './Courses.css';

const Courses = () => {
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { addNotification } = useNotification();
  const { userProfile } = useAuth();

  const { formData, updateField, handleBlur, validate, errors, touched, resetForm } = useForm({
    facultyId: '',
    name: '',
    code: '',
    duration: '',
    description: '',
    seatsAvailable: '',
    applicationDeadline: '',
    requirements: []
  });

  const gradeOptions = getGradeOptions();

  useEffect(() => {
    fetchFaculties();
    fetchCourses();
  }, []);

  const fetchFaculties = async () => {
    try {
      // Fetch faculties for the current institute user
      const data = await institutionService.getFaculties();
      setFaculties(data || []);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load faculties'
      });
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Fetch all courses for the institute
      const allCourses = [];
      for (const faculty of faculties) {
        const result = await institutionService.getFacultyCourses(
          userProfile?.institutionId, 
          faculty.id
        );
        allCourses.push(...result.data.map(course => ({
          ...course,
          facultyName: faculty.name
        })));
      }
      setCourses(allCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRequirement = () => {
    const newRequirements = [...formData.requirements, { subject: '', grade: '' }];
    updateField('requirements', newRequirements);
  };

  const updateRequirement = (index, field, value) => {
    const updatedRequirements = [...formData.requirements];
    updatedRequirements[index][field] = value;
    updateField('requirements', updatedRequirements);
  };

  const removeRequirement = (index) => {
    const updatedRequirements = formData.requirements.filter((_, i) => i !== index);
    updateField('requirements', updatedRequirements);
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

    try {
      await institutionService.createCourse(formData);
      
      addNotification({
        type: 'success',
        title: 'Course Created',
        message: 'Course has been created successfully'
      });

      resetForm();
      setShowCreateForm(false);
      fetchCourses();

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: error.message
      });
    }
  };

  return (
    <div className="institute-courses">
      <div className="page-header">
        <h1>Manage Courses</h1>
        <p>Create and manage courses for your institution</p>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
        >
          Create New Course
        </button>
      </div>

      {showCreateForm && (
        <div className="create-course-form">
          <h3>Create New Course</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <FormField
                label="Faculty"
                name="facultyId"
                type="select"
                value={formData.facultyId}
                onChange={updateField}
                onBlur={handleBlur}
                error={errors.facultyId}
                touched={touched.facultyId}
                required
                options={faculties.map(fac => ({
                  value: fac.id,
                  label: fac.name
                }))}
              />
              <FormField
                label="Course Code"
                name="code"
                value={formData.code}
                onChange={updateField}
                onBlur={handleBlur}
                error={errors.code}
                touched={touched.code}
                required
                placeholder="e.g., CS101"
              />
            </div>

            <FormField
              label="Course Name"
              name="name"
              value={formData.name}
              onChange={updateField}
              onBlur={handleBlur}
              error={errors.name}
              touched={touched.name}
              required
              placeholder="e.g., Computer Science"
            />

            <div className="form-row">
              <FormField
                label="Duration"
                name="duration"
                value={formData.duration}
                onChange={updateField}
                onBlur={handleBlur}
                error={errors.duration}
                touched={touched.duration}
                required
                placeholder="e.g., 4 years"
              />
              <FormField
                label="Seats Available"
                name="seatsAvailable"
                type="number"
                value={formData.seatsAvailable}
                onChange={updateField}
                onBlur={handleBlur}
                error={errors.seatsAvailable}
                touched={touched.seatsAvailable}
                required
                min="1"
              />
            </div>

            <FormField
              label="Application Deadline"
              name="applicationDeadline"
              type="date"
              value={formData.applicationDeadline}
              onChange={updateField}
              onBlur={handleBlur}
              error={errors.applicationDeadline}
              touched={touched.applicationDeadline}
              required
            />

            <FormField
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={updateField}
              onBlur={handleBlur}
              error={errors.description}
              touched={touched.description}
              rows="3"
            />

            <div className="requirements-section">
              <label className="form-label">Course Requirements</label>
              <div className="requirements-list">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="requirement-input">
                    <select
                      value={req.subject}
                      onChange={(e) => updateRequirement(index, 'subject', e.target.value)}
                      className="subject-select"
                    >
                      <option value="">Select Subject</option>
                      {HIGH_SCHOOL_SUBJECTS.map(subject => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                    <select
                      value={req.grade}
                      onChange={(e) => updateRequirement(index, 'grade', e.target.value)}
                      className="grade-select"
                    >
                      <option value="">Select Grade</option>
                      {gradeOptions.map(grade => (
                        <option key={grade.value} value={grade.value}>
                          {grade.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="btn-danger small"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addRequirement}
                className="btn-outline"
              >
                Add Requirement
              </button>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Create Course
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="courses-list">
        <h3>Existing Courses</h3>
        {loading ? (
          <div className="loading">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <p>No courses created yet. Create your first course!</p>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <h4>{course.name} ({course.code})</h4>
                  <span className="course-status">{course.status}</span>
                </div>
                <div className="course-details">
                  <p><strong>Faculty:</strong> {course.facultyName}</p>
                  <p><strong>Duration:</strong> {course.duration}</p>
                  <p><strong>Seats:</strong> {course.seatsAvailable}</p>
                  <p><strong>Requirements:</strong></p>
                  <ul className="requirements">
                    {course.requirements?.map((req, idx) => (
                      <li key={idx}>{req.subject}: {req.grade}</li>
                    ))}
                    {(!course.requirements || course.requirements.length === 0) && (
                      <li>No specific requirements</li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;