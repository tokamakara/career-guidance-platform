import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { auth } from '../../services/firebase';
import { sendEmailVerification } from 'firebase/auth';
import './Auth.css';

const VerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { currentUser, userProfile } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (currentUser.emailVerified) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendVerification = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setCountdown(60); // 60 seconds cooldown
      addNotification({
        type: 'success',
        title: 'Verification Email Sent',
        message: 'Check your inbox for the verification link'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Send Email',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="verification-icon">📧</div>
          <h2>Verify Your Email</h2>
          <p>We've sent a verification link to your email address</p>
        </div>

        <div className="verification-info">
          <p>
            Please check your inbox at <strong>{currentUser.email}</strong> and click 
            the verification link to activate your account.
          </p>
          
          <div className="verification-steps">
            <h4>Didn't receive the email?</h4>
            <ol>
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>Wait a few minutes and try again</li>
            </ol>
          </div>
        </div>

        <div className="auth-actions">
          <button
            onClick={handleResendVerification}
            disabled={loading || countdown > 0}
            className="auth-button primary"
          >
            {loading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email'}
          </button>
          
          <button
            onClick={handleRefresh}
            className="auth-button secondary"
          >
            I've Verified My Email
          </button>
        </div>

        <div className="auth-footer">
          <p>
            Need help? <Link to="/contact" className="auth-link">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;