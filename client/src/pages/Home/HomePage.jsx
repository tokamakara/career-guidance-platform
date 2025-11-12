import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar/Navbar';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const handleDashboardNavigation = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    switch (userProfile?.role) {
      case 'student':
        navigate('/student/dashboard');
        break;
      case 'institute':
        navigate('/institute/dashboard');
        break;
      case 'company':
        navigate('/company/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  return (
    <div className="homepage">
      <Navbar />
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background-pattern"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Career Guidance & Employment Platform
          </h1>
          <p className="hero-subtitle">
            Lesotho's comprehensive platform connecting students with higher education institutions and career opportunities. Discover, apply, and succeed in your professional journey.
          </p>
          <div className="hero-actions">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn-primary">
                  Start Your Journey
                </Link>
                <Link to="/institutions" className="btn-secondary">
                  Partner Institutions
                </Link>
              </>
            ) : (
              <button 
                onClick={handleDashboardNavigation}
                className="btn-primary"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Choose your path and start your journey today</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <h3>For Students</h3>
              <ul>
                <li>
                  <span className="check-icon">✓</span>
                  Discover institutions in Lesotho
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  Apply to courses that match your qualifications
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  Track application status in real-time
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  Find job opportunities after graduation
                </li>
              </ul>
              {!isAuthenticated && (
                <Link to="/register?role=student" className="btn-outline">
                  Join as Student
                </Link>
              )}
            </div>

            <div className="feature-card">
              <h3>For Institutions</h3>
              <ul>
                <li>
                  <span className="check-icon">✓</span>
                  Manage courses and faculties
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  Review student applications
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  Admission management with waitlist
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  Connect with qualified students
                </li>
              </ul>
              {!isAuthenticated && (
                <Link to="/register?role=institute" className="btn-outline">
                  Sign Up Institution
                </Link>
              )}
            </div>

            <div className="feature-card">
              <h3>For Companies</h3>
              <ul>
                <li>
                  <span className="check-icon">✓</span>
                  Post job opportunities
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  Find qualified candidates automatically
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  Smart matching based on qualifications
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  Streamlined hiring process
                </li>
              </ul>
              {!isAuthenticated && (
                <Link to="/register?role=company" className="btn-outline">
                  Join as Employer
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
