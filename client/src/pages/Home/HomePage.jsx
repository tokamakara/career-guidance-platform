import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  // Don't show anything while loading
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
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Career Guidance & Employment Platform</h1>
          <p className="hero-subtitle">
            Connecting Lesotho's students with educational institutions and career opportunities
          </p>
          <div className="hero-actions">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn-primary large">
                  Get Started
                </Link>
                <Link to="/login" className="btn-outline large">
                  Sign In
                </Link>
              </>
            ) : (
              <button 
                onClick={handleDashboardNavigation}
                className="btn-primary large"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
        <div className="hero-image">
          <div className="placeholder-image">
            🎓💼🚀
          </div>
        </div>
      </section>

      {/* Rest of your HomePage content remains the same */}
      <section className="features-section">
        <div className="container">
          <h2>How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>For Students</h3>
              <ul>
                <li>Discover institutions in Lesotho</li>
                <li>Apply to courses that match your qualifications</li>
                <li>Track application status in real-time</li>
                <li>Find job opportunities after graduation</li>
              </ul>
              {!isAuthenticated && (
                <Link to="/register?role=student" className="btn-outline">
                  Join as Student
                </Link>
              )}
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏫</div>
              <h3>For Institutions</h3>
              <ul>
                <li>Manage courses and faculties</li>
                <li>Review student applications</li>
                <li>Admission management with waitlist</li>
                <li>Connect with qualified students</li>
              </ul>
              {!isAuthenticated && (
                <Link to="/register?role=institute" className="btn-outline">
                  Register Institution
                </Link>
              )}
            </div>

            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>For Companies</h3>
              <ul>
                <li>Post job opportunities</li>
                <li>Find qualified candidates automatically</li>
                <li>Smart matching based on qualifications</li>
                <li>Streamlined hiring process</li>
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

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Institutions</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">200+</div>
              <div className="stat-label">Companies</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5000+</div>
              <div className="stat-label">Successful Applications</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of students and institutions already using our platform</p>
          {!isAuthenticated && (
            <div className="cta-actions">
              <Link to="/register" className="btn-primary large">
                Create Account
              </Link>
              <Link to="/about" className="btn-outline large">
                Learn More
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;