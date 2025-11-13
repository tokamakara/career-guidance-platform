import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './Settings.css';

const CompanySettings = () => {
  const { userProfile, currentUser } = useAuth();
  const { addNotification } = useNotification();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    jobApplicationNotifications: true,
    candidateMatchNotifications: true,
    profileVisibility: 'public',
    language: 'en',
    timezone: 'Africa/Maseru'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage or API
    const savedSettings = localStorage.getItem('companySettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Save to localStorage (or API in future)
      localStorage.setItem('companySettings', JSON.stringify(settings));
      
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your settings have been saved successfully.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: error.message || 'Failed to save settings. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and notification settings</p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        {/* Notification Settings */}
        <div className="settings-section">
          <h2>Notification Settings</h2>
          <div className="settings-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
              />
              <span>Email Notifications</span>
            </label>
            <p className="setting-description">Receive email notifications for important updates</p>
          </div>

          <div className="settings-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="jobApplicationNotifications"
                checked={settings.jobApplicationNotifications}
                onChange={handleChange}
              />
              <span>Job Application Notifications</span>
            </label>
            <p className="setting-description">Get notified when candidates apply to your jobs</p>
          </div>

          <div className="settings-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="candidateMatchNotifications"
                checked={settings.candidateMatchNotifications}
                onChange={handleChange}
              />
              <span>Candidate Match Notifications</span>
            </label>
            <p className="setting-description">Receive alerts when highly qualified candidates match your job requirements</p>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="settings-section">
          <h2>Privacy Settings</h2>
          <div className="settings-group">
            <label htmlFor="profileVisibility">Profile Visibility</label>
            <select
              id="profileVisibility"
              name="profileVisibility"
              value={settings.profileVisibility}
              onChange={handleChange}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="limited">Limited</option>
            </select>
            <p className="setting-description">Control who can see your company profile</p>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="settings-section">
          <h2>Regional Settings</h2>
          <div className="settings-group">
            <label htmlFor="language">Language</label>
            <select
              id="language"
              name="language"
              value={settings.language}
              onChange={handleChange}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>

          <div className="settings-group">
            <label htmlFor="timezone">Timezone</label>
            <select
              id="timezone"
              name="timezone"
              value={settings.timezone}
              onChange={handleChange}
            >
              <option value="Africa/Maseru">Africa/Maseru (SAST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
            </select>
          </div>
        </div>

        {/* Need Help Section */}
        <div className="settings-section">
          <h2>Need Help?</h2>
          <div className="help-links">
            <a href="/privacy-policy" className="help-link">Privacy Policy</a>
            <a href="/terms-of-service" className="help-link">Terms of Service</a>
            <a href="/faq" className="help-link">FAQ</a>
            <a href="/contact" className="help-link">Contact Support</a>
          </div>
        </div>

        <div className="settings-actions">
          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanySettings;

