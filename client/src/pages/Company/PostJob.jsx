import React, { useState } from 'react';
import { useForm } from '../../hooks/useForm';
import { jobService } from '../../services/api/jobService';
import { useNotification } from '../../context/NotificationContext';
import FormField from '../../components/forms/FormField';
import './PostJob.css';

const PostJob = () => {
  const [submitting, setSubmitting] = useState(false);
  const { addNotification } = useNotification();

  const { formData, updateField, handleBlur, validate, errors, touched, resetForm } = useForm({
    title: '',
    department: '',
    type: 'full-time',
    location: '',
    description: '',
    qualifications: [],
    certificates: [],
    workExperience: 0,
    skills: [],
    salaryRange: {
      min: '',
      max: '',
      currency: 'LSL'
    },
    applicationDeadline: ''
  });

  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'internship', label: 'Internship' },
    { value: 'contract', label: 'Contract' }
  ];

  const departments = [
    'Technology', 'Business', 'Healthcare', 'Education', 
    'Engineering', 'Marketing', 'Finance', 'Human Resources'
  ];

  const commonSkills = [
    'Communication', 'Teamwork', 'Problem Solving', 'Leadership',
    'Time Management', 'Adaptability', 'Creativity', 'Critical Thinking'
  ];

  const addQualification = () => {
    const newQualifications = [...formData.qualifications, ''];
    updateField('qualifications', newQualifications);
  };

  const updateQualification = (index, value) => {
    const updatedQualifications = [...formData.qualifications];
    updatedQualifications[index] = value;
    updateField('qualifications', updatedQualifications);
  };

  const removeQualification = (index) => {
    const updatedQualifications = formData.qualifications.filter((_, i) => i !== index);
    updateField('qualifications', updatedQualifications);
  };

  const addSkill = () => {
    const newSkills = [...formData.skills, ''];
    updateField('skills', newSkills);
  };

  const updateSkill = (index, value) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index] = value;
    updateField('skills', updatedSkills);
  };

  const removeSkill = (index) => {
    const updatedSkills = formData.skills.filter((_, i) => i !== index);
    updateField('skills', updatedSkills);
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
      setSubmitting(true);

      const jobData = {
        ...formData,
        requirements: {
          qualifications: formData.qualifications.filter(q => q.trim() !== ''),
          certificates: formData.certificates,
          workExperience: parseInt(formData.workExperience) || 0,
          skills: formData.skills.filter(s => s.trim() !== '')
        },
        salaryRange: {
          min: parseInt(formData.salaryRange.min),
          max: parseInt(formData.salaryRange.max),
          currency: formData.salaryRange.currency
        }
      };

      const result = await jobService.createJob(jobData);
      
      addNotification({
        type: 'success',
        title: 'Job Posted',
        message: result.message
      });

      resetForm();

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Posting Failed',
        message: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="post-job">
      <div className="page-header">
        <h1>Post a Job</h1>
        <p>Create a new job posting to find qualified candidates</p>
      </div>

      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-row">
            <FormField
              label="Job Title"
              name="title"
              value={formData.title}
              onChange={updateField}
              onBlur={handleBlur}
              error={errors.title}
              touched={touched.title}
              required
              placeholder="e.g., Software Developer"
            />

            <FormField
              label="Department"
              name="department"
              type="select"
              value={formData.department}
              onChange={updateField}
              onBlur={handleBlur}
              error={errors.department}
              touched={touched.department}
              required
              options={departments.map(dept => ({ value: dept, label: dept }))}
            />
          </div>

          <div className="form-row">
            <FormField
              label="Job Type"
              name="type"
              type="select"
              value={formData.type}
              onChange={updateField}
              onBlur={handleBlur}
              error={errors.type}
              touched={touched.type}
              required
              options={jobTypes}
            />

            <FormField
              label="Location"
              name="location"
              value={formData.location}
              onChange={updateField}
              onBlur={handleBlur}
              error={errors.location}
              touched={touched.location}
              required
              placeholder="e.g., Maseru, Lesotho"
            />
          </div>

          <FormField
            label="Job Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={updateField}
            onBlur={handleBlur}
            error={errors.description}
            touched={touched.description}
            required
            rows="4"
            placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
          />
        </div>

        <div className="form-section">
          <h3>Requirements & Qualifications</h3>

          <div className="form-row">
            <FormField
              label="Work Experience (Years)"
              name="workExperience"
              type="number"
              value={formData.workExperience}
              onChange={updateField}
              onBlur={handleBlur}
              error={errors.workExperience}
              touched={touched.workExperience}
              min="0"
              placeholder="0"
            />

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
          </div>

          <div className="requirements-section">
            <label className="form-label">Required Qualifications</label>
            <div className="requirements-list">
              {formData.qualifications.map((qual, index) => (
                <div key={index} className="requirement-input">
                  <input
                    type="text"
                    value={qual}
                    onChange={(e) => updateQualification(index, e.target.value)}
                    placeholder="e.g., Bachelor's Degree in Computer Science"
                    className="form-field"
                  />
                  <button
                    type="button"
                    onClick={() => removeQualification(index)}
                    className="btn-danger small"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addQualification}
              className="btn-outline"
            >
              Add Qualification
            </button>
          </div>

          <div className="requirements-section">
            <label className="form-label">Required Skills</label>
            <div className="requirements-list">
              {formData.skills.map((skill, index) => (
                <div key={index} className="requirement-input">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    placeholder="e.g., JavaScript, React, Node.js"
                    className="form-field"
                  />
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="btn-danger small"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addSkill}
              className="btn-outline"
            >
              Add Skill
            </button>
          </div>
        </div>

        <div className="form-section">
          <h3>Salary & Benefits</h3>
          
          <div className="form-row">
            <FormField
              label="Minimum Salary"
              name="salaryRange.min"
              type="number"
              value={formData.salaryRange.min}
              onChange={(field, value) => updateField('salaryRange', { ...formData.salaryRange, min: value })}
              onBlur={handleBlur}
              error={errors.salaryRange?.min}
              touched={touched.salaryRange?.min}
              required
              placeholder="0"
            />

            <FormField
              label="Maximum Salary"
              name="salaryRange.max"
              type="number"
              value={formData.salaryRange.max}
              onChange={(field, value) => updateField('salaryRange', { ...formData.salaryRange, max: value })}
              onBlur={handleBlur}
              error={errors.salaryRange?.max}
              touched={touched.salaryRange?.max}
              required
              placeholder="0"
            />
          </div>

          <FormField
            label="Currency"
            name="salaryRange.currency"
            type="select"
            value={formData.salaryRange.currency}
            onChange={(field, value) => updateField('salaryRange', { ...formData.salaryRange, currency: value })}
            onBlur={handleBlur}
            options={[
              { value: 'LSL', label: 'Lesotho Loti (LSL)' },
              { value: 'ZAR', label: 'South African Rand (ZAR)' },
              { value: 'USD', label: 'US Dollar (USD)' }
            ]}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary large"
            disabled={submitting}
          >
            {submitting ? 'Posting Job...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;