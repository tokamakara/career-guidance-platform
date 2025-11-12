import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { studentService } from '../../../services/api/studentService';
import './Profile.css';

const EducationProfile = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    idNumber: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Lesotho',
    bio: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { currentUser, userProfile, updateProfile } = useAuth();

  useEffect(() => {
    loadProfile();
  }, [currentUser, userProfile]);

  const loadProfile = async () => {
    try {
      if (!currentUser?.uid) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      
      // Load from userProfile first
      if (userProfile) {
        setProfile({
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          email: userProfile.email || currentUser.email || '',
          phone: userProfile.phone || '',
          dateOfBirth: userProfile.dateOfBirth || '',
          gender: userProfile.gender || '',
          idNumber: userProfile.idNumber || '',
          address: userProfile.address || '',
          city: userProfile.city || '',
          postalCode: userProfile.postalCode || '',
          country: userProfile.country || 'Lesotho',
          bio: userProfile.bio || '',
          emergencyContact: userProfile.emergencyContact || {
            name: '',
            relationship: '',
            phone: ''
          }
        });
      }
      
      // Try to get additional data from API
      try {
        const result = await studentService.getStudentProfile();
        if (result && result.success && result.data) {
          setProfile(prev => ({
            ...prev,
            ...result.data,
            emergencyContact: result.data.emergencyContact || prev.emergencyContact
          }));
        }
      } catch (apiErr) {
        // If API fails, continue with userProfile data
        // Only show error if it's not a 404 (which might mean profile doesn't exist yet)
        if (apiErr.message && !apiErr.message.includes('endpoint not found')) {
          console.warn('Could not load additional profile data:', apiErr.message);
        }
        // Don't set error state - userProfile data is sufficient
      }
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

  const handleEmergencyContactChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Update via AuthContext for local state
      await updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone
      });
      
      // Update via API for backend persistence
      await studentService.updateStudentProfile(profile);
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and contact details</p>
      </div>

      {error && (
        <div className="profile-message error-message">
          {error}
        </div>
      )}
      {success && (
        <div className="profile-message success-message">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Basic Information */}
        <div className="profile-section">
          <h2>Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                required
                placeholder="Enter your first name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                required
                placeholder="Enter your last name"
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
                placeholder="your.email@example.com"
                disabled
              />
              <small className="field-hint">Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="+266 5XXX XXXX"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={profile.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={profile.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="idNumber">ID Number / Passport Number</label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                value={profile.idNumber}
                onChange={handleChange}
                placeholder="Enter your ID or passport number"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="profile-section">
          <h2>Address Information</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="address">Street Address</label>
              <textarea
                id="address"
                name="address"
                value={profile.address}
                onChange={handleChange}
                rows="3"
                placeholder="Enter your street address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City / Town</label>
              <input
                type="text"
                id="city"
                name="city"
                value={profile.city}
                onChange={handleChange}
                placeholder="Enter your city or town"
              />
            </div>

            <div className="form-group">
              <label htmlFor="postalCode">Postal Code</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={profile.postalCode}
                onChange={handleChange}
                placeholder="Enter postal code"
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <select
                id="country"
                name="country"
                value={profile.country}
                onChange={handleChange}
              >
                <option value="Lesotho">Lesotho</option>
                <option value="South Africa">South Africa</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="profile-section">
          <h2>About Me</h2>
          <div className="form-group full-width">
            <label htmlFor="bio">Bio / Personal Statement</label>
            <textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows="5"
              placeholder="Tell us about yourself, your interests, career goals, or any other information you'd like to share..."
              maxLength={500}
            />
            <small className="field-hint">
              {profile.bio.length}/500 characters
            </small>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="profile-section">
          <h2>Emergency Contact</h2>
          <p className="section-description">
            Provide contact information for someone we can reach in case of emergency
          </p>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="emergencyName">Contact Name *</label>
              <input
                type="text"
                id="emergencyName"
                name="name"
                value={profile.emergencyContact.name}
                onChange={handleEmergencyContactChange}
                placeholder="Enter contact name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="emergencyRelationship">Relationship</label>
              <select
                id="emergencyRelationship"
                name="relationship"
                value={profile.emergencyContact.relationship}
                onChange={handleEmergencyContactChange}
              >
                <option value="">Select Relationship</option>
                <option value="parent">Parent</option>
                <option value="guardian">Guardian</option>
                <option value="sibling">Sibling</option>
                <option value="spouse">Spouse</option>
                <option value="relative">Relative</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="emergencyPhone">Contact Phone Number</label>
              <input
                type="tel"
                id="emergencyPhone"
                name="phone"
                value={profile.emergencyContact.phone}
                onChange={handleEmergencyContactChange}
                placeholder="+266 5XXX XXXX"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn-cancel"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-save"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EducationProfile;
