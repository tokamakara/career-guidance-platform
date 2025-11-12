import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar/Navbar';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-page">
      <Navbar />
      <div className="policy-container">
        <div className="policy-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="policy-content">
          <section className="policy-section">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Career & Education Gateway. We are committed to protecting your privacy and ensuring the security
              of your personal information. This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our platform.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li>Name, email address, and contact information</li>
              <li>Educational background and qualifications</li>
              <li>Employment history and work experience</li>
              <li>Documents and certificates you upload</li>
              <li>Application and admission information</li>
            </ul>

            <h3>2.2 Usage Information</h3>
            <p>We automatically collect certain information when you use our platform:</p>
            <ul>
              <li>Device information and IP address</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent on pages</li>
              <li>Search queries and interactions</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and improve our services</li>
              <li>Match students with educational institutions and job opportunities</li>
              <li>Process applications and admissions</li>
              <li>Send notifications and updates</li>
              <li>Analyze usage patterns and improve user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>4. Information Sharing</h2>
            <p>
              We may share your information with:
            </p>
            <ul>
              <li><strong>Educational Institutions:</strong> To facilitate applications and admissions</li>
              <li><strong>Employers:</strong> To match you with job opportunities</li>
              <li><strong>Service Providers:</strong> Third-party services that help us operate our platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
            <p>
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="policy-section">
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction. However, no method of
              transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="policy-section">
            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Export your data</li>
              <li>Opt-out of certain communications</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience, analyze usage,
              and personalize content. You can control cookies through your browser settings.
            </p>
          </section>

          <section className="policy-section">
            <h2>8. Children's Privacy</h2>
            <p>
              Our platform is not intended for children under 13 years of age. We do not knowingly collect
              personal information from children under 13.
            </p>
          </section>

          <section className="policy-section">
            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by
              posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="policy-section">
            <h2>10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@careereducationgateway.ls<br />
              <strong>Address:</strong> Career & Education Gateway, Lesotho
            </p>
          </section>
        </div>

        <div className="policy-footer">
          <Link to="/" className="back-link">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

