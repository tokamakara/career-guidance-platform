import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { companyService } from '../../services/api/companyService';

const CompanyProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    industry: '',
    description: '',
    website: '',
    size: '',
    founded: ''
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
      setLoading(true);
      const data = await companyService.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Load profile error:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await companyService.updateProfile(profile);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const industries = [
    'Technology',
    'Healthcare',
    'Education',
    'Finance',
    'Manufacturing',
    'Retail',
    'Hospitality',
    'Construction',
    'Transportation',
    'Agriculture',
    'Other'
  ];

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ];

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="company-profile">
      <div className="page-header">
        <h1>Company Profile</h1>
        <p>Manage your company information and settings</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Company Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                type="url"
                id="website"
                name="website"
                value={profile.website}
                onChange={handleChange}
                placeholder="https://"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Company Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="industry">Industry *</label>
              <select
                id="industry"
                name="industry"
                value={profile.industry}
                onChange={handleChange}
                required
              >
                <option value="">Select Industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="size">Company Size</label>
              <select
                id="size"
                name="size"
                value={profile.size}
                onChange={handleChange}
              >
                <option value="">Select Size</option>
                {companySizes.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="founded">Year Founded</label>
              <input
                type="number"
                id="founded"
                name="founded"
                value={profile.founded}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Location</h3>
          <div className="form-group">
            <label htmlFor="address">Company Address</label>
            <textarea
              id="address"
              name="address"
              value={profile.address}
              onChange={handleChange}
              rows="3"
              placeholder="Enter your company's physical address"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>About Company</h3>
          <div className="form-group">
            <label htmlFor="description">Company Description *</label>
            <textarea
              id="description"
              name="description"
              value={profile.description}
              onChange={handleChange}
              rows="6"
              placeholder="Describe your company, mission, values, and what makes you unique..."
              required
            />
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
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;