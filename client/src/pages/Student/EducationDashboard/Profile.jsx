import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { studentService } from '../../../../services/api/studentService';
import { HIGH_SCHOOL_SUBJECTS, getGradeOptions } from '../../../../utils/gradeSystem';

const EducationProfile = () => {
  const [profile, setProfile] = useState({
    personalInfo: {
      fullName: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      address: ''
    },
    highSchoolGrades: {},
    documents: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await studentService.getStudentProfile(user.uid);
      setProfile({
        personalInfo: data.personalInfo || {
          fullName: '',
          dateOfBirth: '',
          gender: '',
          phone: '',
          address: ''
        },
        highSchoolGrades: data.highSchoolGrades || {},
        documents: data.documents || []
      });
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value
      }
    }));
  };

  const handleGradeChange = (subject, grade) => {
    setProfile(prev => ({
      ...prev,
      highSchoolGrades: {
        ...prev.highSchoolGrades,
        [subject]: grade
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await studentService.updateEducationProfile(profile);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const calculateGPA = () => {
    const grades = Object.values(profile.highSchoolGrades);
    if (grades.length === 0) return 0;

    const gradePoints = {
      'A*': 4.0, 'A': 4.0, 'B': 3.0, 'C': 2.0, 
      'D': 1.0, 'E': 0.0, 'F': 0.0, 'G': 0.0
    };

    const totalPoints = grades.reduce((sum, grade) => sum + (gradePoints[grade] || 0), 0);
    return (totalPoints / grades.length).toFixed(2);
  };

  const getCompletedSubjects = () => {
    return Object.keys(profile.highSchoolGrades).length;
  };

  const gradeOptions = getGradeOptions();

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="education-profile">
      <div className="page-header">
        <h1>Education Profile</h1>
        <p>Manage your personal information and academic records</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Personal Information */}
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={profile.personalInfo.fullName}
                onChange={handlePersonalInfoChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={profile.personalInfo.dateOfBirth}
                onChange={handlePersonalInfoChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={profile.personalInfo.gender}
                onChange={handlePersonalInfoChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.personalInfo.phone}
                onChange={handlePersonalInfoChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={profile.personalInfo.address}
                onChange={handlePersonalInfoChange}
                rows="3"
                placeholder="Enter your current address"
              />
            </div>
          </div>
        </div>

        {/* High School Grades */}
        <div className="form-section">
          <h3>High School Academic Record</h3>
          <p className="section-description">
            Enter your O-Level grades for each subject. This information is crucial for 
            determining which courses you qualify for.
          </p>

          {/* Grades Summary */}
          <div className="grades-summary">
            <div className="summary-card">
              <div className="summary-value">{getCompletedSubjects()}</div>
              <div className="summary-label">Subjects Completed</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{calculateGPA()}</div>
              <div className="summary-label">Average GPA</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">
                {Object.values(profile.highSchoolGrades).filter(grade => 
                  ['A*', 'A', 'B'].includes(grade)
                ).length}
              </div>
              <div className="summary-label">A-C Grades</div>
            </div>
          </div>

          {/* Grades Input Grid */}
          <div className="grades-grid">
            {HIGH_SCHOOL_SUBJECTS.map(subject => (
              <div key={subject} className="grade-input-group">
                <label htmlFor={`grade-${subject}`}>{subject}</label>
                <select
                  id={`grade-${subject}`}
                  value={profile.highSchoolGrades[subject] || ''}
                  onChange={(e) => handleGradeChange(subject, e.target.value)}
                >
                  <option value="">Select Grade</option>
                  {gradeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="grades-legend">
            <h4>Grading System (Cambridge O-Level)</h4>
            <div className="legend-items">
              <div className="legend-item">
                <span className="grade-example">A*</span>
                <span>90-100% (Outstanding)</span>
              </div>
              <div className="legend-item">
                <span className="grade-example">A</span>
                <span>80-89% (Excellent)</span>
              </div>
              <div className="legend-item">
                <span className="grade-example">B</span>
                <span>70-79% (Good)</span>
              </div>
              <div className="legend-item">
                <span className="grade-example">C</span>
                <span>60-69% (Satisfactory)</span>
              </div>
              <div className="legend-item">
                <span className="grade-example">D</span>
                <span>50-59% (Pass)</span>
              </div>
              <div className="legend-item">
                <span className="grade-example">E</span>
                <span>40-49% (Marginal)</span>
              </div>
              <div className="legend-item">
                <span className="grade-example">F/G</span>
                <span>0-39% (Fail)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="form-section">
          <h3>Supporting Documents</h3>
          <p>Upload any supporting documents for your applications (transcripts, certificates, etc.)</p>
          
          <div className="documents-upload">
            <div className="upload-area">
              <div className="upload-icon">📄</div>
              <p>Drag and drop files here or click to browse</p>
              <input 
                type="file" 
                multiple 
                className="file-input"
                onChange={(e) => {
                  // Handle file upload
                  console.log('Files selected:', e.target.files);
                }}
              />
            </div>

            <div className="uploaded-files">
              {profile.documents.map((doc, index) => (
                <div key={index} className="document-item">
                  <span className="doc-name">{doc.name}</span>
                  <span className="doc-size">{doc.size}</span>
                  <button type="button" className="delete-doc">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="cancel-button"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="save-button"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>

      {/* Profile Completion Tips */}
      <div className="completion-tips">
        <h3>Profile Completion Tips</h3>
        <div className="tips-list">
          <div className="tip-item">
            <span className="tip-icon">🎯</span>
            <div className="tip-content">
              <h4>Complete All Grades</h4>
              <p>Enter grades for all subjects you completed to see the full range of courses you qualify for.</p>
            </div>
          </div>
          <div className="tip-item">
            <span className="tip-icon">📊</span>
            <div className="tip-content">
              <h4>Accurate Information</h4>
              <p>Ensure all personal and academic information is accurate to avoid application issues.</p>
            </div>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🔍</span>
            <div className="tip-content">
              <h4>Review Course Requirements</h4>
              <p>Check specific course requirements before applying to ensure you meet all criteria.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationProfile;