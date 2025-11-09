import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {  institutionService } from '../../services/api/instituteService';

const InstituteProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: '',
    description: '',
    website: '',
    established: '',
    accreditation: ''
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
      const data = await instituteService.getProfile();
      setProfile(data);
    } catch (err) {
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
      await instituteService.updateProfile(profile);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const institutionTypes = [
    'University',
    'College',
    'Technical Institute',
    'Vocational School',
    'Polytechnic',
    'Other'
  ];

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="institute-profile">
      <div className="page-header">
        <h1>Institution Profile</h1>
        <p>Manage your institution's information and settings</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Institution Name *</label>
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
              <label htmlFor="email">Email Address *</label>
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
          <h3>Institution Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="type">Institution Type *</label>
              <select
                id="type"
                name="type"
                value={profile.type}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                {institutionTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="established">Year Established</label>
              <input
                type="number"
                id="established"
                name="established"
                value={profile.established}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="form-group">
              <label htmlFor="accreditation">Accreditation Body</label>
              <input
                type="text"
                id="accreditation"
                name="accreditation"
                value={profile.accreditation}
                onChange={handleChange}
                placeholder="e.g., Council on Higher Education"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Location</h3>
          <div className="form-group">
            <label htmlFor="address">Institution Address</label>
            <textarea
              id="address"
              name="address"
              value={profile.address}
              onChange={handleChange}
              rows="3"
              placeholder="Enter your institution's physical address"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>About Institution</h3>
          <div className="form-group">
            <label htmlFor="description">Institution Description *</label>
            <textarea
              id="description"
              name="description"
              value={profile.description}
              onChange={handleChange}
              rows="6"
              placeholder="Describe your institution, mission, values, achievements, and what makes you unique..."
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

export default InstituteProfile;