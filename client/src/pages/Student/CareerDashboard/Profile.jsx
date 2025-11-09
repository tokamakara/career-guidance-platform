import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { studentService } from '../../../../services/api/studentService';

const CareerProfile = () => {
  const [profile, setProfile] = useState({
    careerObjective: '',
    skills: [],
    workExperience: [],
    education: [],
    certifications: [],
    languages: [],
    availability: 'immediate',
    salaryExpectation: '',
    preferredLocation: '',
    jobTypes: []
  });
  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
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
        careerObjective: data.careerObjective || '',
        skills: data.skills || [],
        workExperience: data.workExperience || [],
        education: data.education || [],
        certifications: data.certifications || [],
        languages: data.languages || [],
        availability: data.availability || 'immediate',
        salaryExpectation: data.salaryExpectation || '',
        preferredLocation: data.preferredLocation || '',
        jobTypes: data.jobTypes || []
      });
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const jobTypes = checked 
        ? [...profile.jobTypes, value]
        : profile.jobTypes.filter(type => type !== value);
      setProfile(prev => ({ ...prev, jobTypes }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await studentService.updateCareerProfile(profile);
      setSuccess('Career profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setProfile(prev => ({
        ...prev,
        certifications: [...prev.certifications, {
          name: newCertification.trim(),
          date: new Date().toISOString().split('T')[0]
        }]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setProfile(prev => ({
        ...prev,
        languages: [...prev.languages, {
          language: newLanguage.trim(),
          proficiency: 'intermediate'
        }]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (index) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const jobTypeOptions = [
    'Full-time',
    'Part-time',
    'Contract',
    'Internship',
    'Remote',
    'On-site',
    'Hybrid'
  ];

  if (loading) {
    return <div className="loading">Loading career profile...</div>;
  }

  return (
    <div className="career-profile">
      <div className="page-header">
        <h1>Career Profile</h1>
        <p>Build your professional profile to attract employers</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Career Objective */}
        <div className="form-section">
          <h3>Career Objective</h3>
          <div className="form-group">
            <label htmlFor="careerObjective">Professional Summary</label>
            <textarea
              id="careerObjective"
              name="careerObjective"
              value={profile.careerObjective}
              onChange={handleChange}
              rows="4"
              placeholder="Describe your career goals, strengths, and what you're looking for in your next role..."
            />
          </div>
        </div>

        {/* Skills */}
        <div className="form-section">
          <h3>Skills & Competencies</h3>
          <div className="form-group">
            <label>Add Skills</label>
            <div className="input-with-button">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter a skill (e.g., JavaScript, Project Management)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <button type="button" onClick={addSkill} className="add-btn">
                Add
              </button>
            </div>
          </div>
          
          <div className="skills-list">
            {profile.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
                <button 
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="remove-btn"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="form-section">
          <h3>Certifications</h3>
          <div className="form-group">
            <label>Add Certification</label>
            <div className="input-with-button">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="Enter certification name"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
              />
              <button type="button" onClick={addCertification} className="add-btn">
                Add
              </button>
            </div>
          </div>
          
          <div className="certifications-list">
            {profile.certifications.map((cert, index) => (
              <div key={index} className="certification-item">
                <span className="cert-name">{cert.name}</span>
                <button 
                  type="button"
                  onClick={() => removeCertification(index)}
                  className="remove-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="form-section">
          <h3>Languages</h3>
          <div className="form-group">
            <label>Add Language</label>
            <div className="input-with-button">
              <input
                type="text"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Enter language"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
              />
              <button type="button" onClick={addLanguage} className="add-btn">
                Add
              </button>
            </div>
          </div>
          
          <div className="languages-list">
            {profile.languages.map((lang, index) => (
              <div key={index} className="language-item">
                <span className="lang-name">{lang.language}</span>
                <button 
                  type="button"
                  onClick={() => removeLanguage(index)}
                  className="remove-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Job Preferences */}
        <div className="form-section">
          <h3>Job Preferences</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="availability">Availability</label>
              <select
                id="availability"
                name="availability"
                value={profile.availability}
                onChange={handleChange}
              >
                <option value="immediate">Immediately</option>
                <option value="2_weeks">Within 2 weeks</option>
                <option value="1_month">Within 1 month</option>
                <option value="3_months">Within 3 months</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="salaryExpectation">Expected Salary (LSL)</label>
              <input
                type="number"
                id="salaryExpectation"
                name="salaryExpectation"
                value={profile.salaryExpectation}
                onChange={handleChange}
                placeholder="Monthly salary expectation"
              />
            </div>

            <div className="form-group">
              <label htmlFor="preferredLocation">Preferred Location</label>
              <input
                type="text"
                id="preferredLocation"
                name="preferredLocation"
                value={profile.preferredLocation}
                onChange={handleChange}
                placeholder="e.g., Maseru, Remote, Anywhere in Lesotho"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Job Types</label>
            <div className="checkbox-grid">
              {jobTypeOptions.map(type => (
                <label key={type} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={type}
                    checked={profile.jobTypes.includes(type)}
                    onChange={handleChange}
                  />
                  {type}
                </label>
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
    </div>
  );
};

export default CareerProfile;