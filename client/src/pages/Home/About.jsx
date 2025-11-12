import React from 'react';
import Navbar from '../../components/common/Navbar/Navbar';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <Navbar />
      <div className="about-hero">
        <div className="container">
          <h1>About Career & Education Gateway</h1>
          <p className="hero-subtitle">
            Empowering Lesotho's youth through education, innovation, and opportunity.
          </p>
        </div>
      </div>

      <div className="mission-section">
        <div className="container">
          <h2>Our Mission</h2>
          <p>
            At Career & Education Gateway, our mission is to bridge the gap between high school education, higher learning institutions, and employment opportunities in Lesotho.
          </p>
          <p>
            We provide a unified platform that helps students discover institutions, apply for courses, and connect with employers — creating a smooth journey from learning to meaningful work.
          </p>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2>What We Offer</h2>
          
          <div className="features-grid">
            <div className="feature-item">
              <h3>Institution Discovery</h3>
              <p>
                Explore higher learning institutions across Lesotho. Browse faculties, programs, and admission requirements to find the best fit for your academic ambitions.
              </p>
            </div>

            <div className="feature-item">
              <h3>Smart Course Matching</h3>
              <p>
                Our intelligent system analyzes your academic results to match you with courses you qualify for, ensuring that every opportunity you see is relevant to your strengths.
              </p>
            </div>

            <div className="feature-item">
              <h3>Career Integration</h3>
              <p>
                Seamlessly transition from education to employment. Upload your transcripts and connect directly with companies looking for candidates who fit their job requirements.
              </p>
            </div>

            <div className="feature-item">
              <h3>Industry Partnerships</h3>
              <p>
                We collaborate with trusted organizations and employers in Lesotho to open real pathways for graduates to enter the workforce and grow their careers.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="impact-section">
        <div className="container">
          <h2>Our Impact</h2>
          <div className="impact-grid">
            <div className="impact-item">
              <div className="impact-number">50+</div>
              <div className="impact-label">Higher Learning Institutions</div>
            </div>
            <div className="impact-item">
              <div className="impact-number">1000+</div>
              <div className="impact-label">Courses Offered</div>
            </div>
            <div className="impact-item">
              <div className="impact-number">200+</div>
              <div className="impact-label">Partner Companies</div>
            </div>
            <div className="impact-item">
              <div className="impact-number">5000+</div>
              <div className="impact-label">Students Empowered</div>
            </div>
          </div>
        </div>
      </div>

      <div className="partners-section">
        <div className="container">
          <h2>For Institutions & Companies</h2>
          
          <div className="partners-grid">
            <div className="partner-item">
              <h3>Higher Learning Institutions</h3>
              <ul>
                <li>Showcase your academic programs to qualified students</li>
                <li>Manage applications and admissions efficiently</li>
                <li>Streamline communication with applicants</li>
                <li>Build nationwide visibility and engagement</li>
              </ul>
            </div>

            <div className="partner-item">
              <h3>Companies & Employers</h3>
              <ul>
                <li>Post job opportunities tailored to your needs</li>
                <li>Access pre-filtered candidates who meet your requirements</li>
                <li>Save time with automatic qualification matching</li>
                <li>Connect with Lesotho's most promising young talent</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="container">
          <h2>Join the Gateway</h2>
          <p>
            Whether you're a student, institution, or company, the Career & Education Gateway is your trusted partner in shaping Lesotho's educational and economic future.
          </p>
          <p className="cta-subtitle">
            Together, let's unlock potential and open doors to brighter futures.
          </p>
          <div className="cta-buttons">
            <a href="/register" className="cta-button primary">Get Started Today</a>
            <a href="/contact" className="cta-button secondary">Contact Us</a>
          </div>
          <p className="cta-footer">
            Empowering tomorrow, one connection at a time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;