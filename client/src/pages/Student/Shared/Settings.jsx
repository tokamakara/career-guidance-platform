import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useMode } from '../../../context/ModeContext';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    applicationUpdates: true,
    jobMatches: true,
    newsletter: false,
    securityAlerts: true,
    twoFactorAuth: false,
    language: 'en',
    timezone: 'Africa/Maseru'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { currentUser, userProfile, updateProfile } = useAuth();
  const { isDark, toggleMode } = useMode();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // Load settings from user profile or localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    // Simulate data export
    const exportData = {
      profile: userProfile || currentUser,
      settings: settings,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `career-platform-data-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (!window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone. ' +
      'All your data, applications, and documents will be permanently removed.'
    )) {
      return;
    }

    // This would typically call an API to delete the account
    alert('Account deletion request submitted. This feature would typically require confirmation via email.');
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and privacy settings</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="settings-sections">
        {/* Notification Settings */}
        <div className="settings-section">
          <h3>Notification Preferences</h3>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Email Notifications</h4>
                <p>Receive important updates and announcements via email</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Application Updates</h4>
                <p>Get notified about changes to your course applications</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.applicationUpdates}
                  onChange={(e) => handleSettingChange('applicationUpdates', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Job Matches</h4>
                <p>Receive notifications when new jobs match your profile</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.jobMatches}
                  onChange={(e) => handleSettingChange('jobMatches', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Newsletter</h4>
                <p>Subscribe to our monthly newsletter with career tips and opportunities</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.newsletter}
                  onChange={(e) => handleSettingChange('newsletter', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="settings-section">
          <h3>Privacy & Security</h3>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Security Alerts</h4>
                <p>Get notified about important security events and changes</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.securityAlerts}
                  onChange={(e) => handleSettingChange('securityAlerts', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Two-Factor Authentication</h4>
                <p>Add an extra layer of security to your account</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Data Sharing</h4>
                <p>Allow institutions to view your profile for matching purposes</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  defaultChecked
                  onChange={(e) => console.log('Data sharing:', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="settings-section">
          <h3>Appearance</h3>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Dark Mode</h4>
                <p>Switch between light and dark themes</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isDark}
                  onChange={toggleMode}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Language</h4>
                <p>Choose your preferred language</p>
              </div>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="language-select"
              >
                <option value="en">English</option>
                <option value="st">Sesotho</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Timezone</h4>
                <p>Set your local timezone for accurate timing</p>
              </div>
              <select
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                className="timezone-select"
              >
                <option value="Africa/Maseru">Africa/Maseru (GMT+2)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-section">
          <h3>Data Management</h3>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Export Data</h4>
                <p>Download a copy of your personal data and activity history</p>
              </div>
              <button
                onClick={handleExportData}
                className="export-data-btn"
              >
                Export My Data
              </button>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Clear Application History</h4>
                <p>Remove your application history (this action cannot be undone)</p>
              </div>
              <button
                onClick={() => alert('This would clear application history')}
                className="clear-history-btn"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="settings-section danger-zone">
          <h3>Account Actions</h3>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Delete Account</h4>
                <p>Permanently delete your account and all associated data</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="delete-account-btn"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Settings Button */}
      <div className="settings-actions">
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="save-settings-btn"
        >
          {loading ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {/* Quick Links */}
      <div className="settings-quick-links">
        <h3>Need Help?</h3>
        <div className="quick-links-grid">
          <Link to="/privacy" className="quick-link">
            <span className="link-icon">🔒</span>
            <span className="link-text">Privacy Policy</span>
          </Link>
          <Link to="/terms" className="quick-link">
            <span className="link-icon">📄</span>
            <span className="link-text">Terms of Service</span>
          </Link>
          <Link to="/faq" className="quick-link">
            <span className="link-icon">❓</span>
            <span className="link-text">FAQ</span>
          </Link>
          <Link to="/contact" className="quick-link">
            <span className="link-icon">💬</span>
            <span className="link-text">Contact Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Settings;