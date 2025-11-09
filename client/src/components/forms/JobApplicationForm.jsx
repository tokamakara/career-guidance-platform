import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { jobService } from '../../../services/api/jobService';

const JobApplicationForm = ({ job, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    coverLetter: '',
    expectedSalary: '',
    availability: 'immediate'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const applicationData = {
        jobId: job.id,
        jobTitle: job.title,
        companyId: job.companyId,
        companyName: job.companyName,
        studentId: user.uid,
        coverLetter: formData.coverLetter,
        expectedSalary: formData.expectedSalary,
        availability: formData.availability,
        appliedAt: new Date().toISOString(),
        status: 'pending'
      };

      await jobService.applyToJob(applicationData);
      onSuccess?.();

    } catch (error) {
      setError(error.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="job-application-form">
      <div className="application-header">
        <h2>Apply for {job.title}</h2>
        <p className="company-name">{job.companyName}</p>
      </div>

      <form onSubmit={handleSubmit} className="application-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="coverLetter">Cover Letter *</label>
          <textarea
            id="coverLetter"
            name="coverLetter"
            value={formData.coverLetter}
            onChange={handleChange}
            rows="6"
            placeholder="Explain why you're a good fit for this position..."
            required
            disabled={submitting}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="expectedSalary">Expected Salary (LSL)</label>
            <input
              type="number"
              id="expectedSalary"
              name="expectedSalary"
              value={formData.expectedSalary}
              onChange={handleChange}
              placeholder="Enter expected monthly salary"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="availability">Availability</label>
            <select
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              required
              disabled={submitting}
            >
              <option value="immediate">Immediate</option>
              <option value="2_weeks">2 Weeks</option>
              <option value="1_month">1 Month</option>
              <option value="3_months">3 Months</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
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

export default JobApplicationForm;