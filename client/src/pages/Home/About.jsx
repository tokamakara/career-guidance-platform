import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="hero-section">
        <div className="container">
          <h1>About Career Guidance Platform</h1>
          <p className="hero-subtitle">
            Empowering Lesotho's youth through education and career opportunities
          </p>
        </div>
      </div>

      <div className="mission-section">
        <div className="container">
          <div className="mission-content">
            <h2>Our Mission</h2>
            <p>
              To bridge the gap between high school education, higher learning institutions, 
              and employment opportunities in Lesotho. We provide a comprehensive platform 
              that guides students through their educational journey and connects them with 
              meaningful career paths.
            </p>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2>What We Offer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>Institution Discovery</h3>
              <p>
                Explore higher learning institutions in Lesotho, their courses, 
                and admission requirements. Find the perfect fit for your academic goals.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Smart Course Matching</h3>
              <p>
                Our intelligent system matches your high school grades with courses 
                you qualify for, ensuring you only see relevant opportunities.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Career Integration</h3>
              <p>
                Seamlessly transition from education to employment. Upload your 
                transcripts and connect with companies looking for your skills.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Industry Partnerships</h3>
              <p>
                We partner with leading companies in Lesotho to provide real 
                employment opportunities for graduates.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Institutions</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Courses</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">200+</div>
              <div className="stat-label">Companies</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5000+</div>
              <div className="stat-label">Students Helped</div>
            </div>
          </div>
        </div>
      </div>

      <div className="team-section">
        <div className="container">
          <h2>For Institutions & Companies</h2>
          <div className="team-grid">
            <div className="team-card">
              <h3>Higher Learning Institutions</h3>
              <ul>
                <li>Showcase your courses to qualified students</li>
                <li>Streamline application and admission processes</li>
                <li>Manage student applications efficiently</li>
                <li>Connect with potential students nationwide</li>
              </ul>
            </div>

            <div className="team-card">
              <h3>Companies & Employers</h3>
              <ul>
                <li>Find qualified graduates matching your needs</li>
                <li>Post job opportunities with specific requirements</li>
                <li>Access filtered candidate lists automatically</li>
                <li>Connect with Lesotho's emerging talent</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="contact-cta">
        <div className="container">
          <h2>Join Our Platform</h2>
          <p>
            Whether you're a student, institution, or company, we invite you to 
            join our platform and be part of Lesotho's educational and economic growth.
          </p>
          <div className="cta-buttons">
            <a href="/register" className="cta-button primary">Get Started</a>
            <a href="/contact" className="cta-button secondary">Contact Us</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;