import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar/Navbar';
import './TermsOfService.css';

const TermsOfService = () => {
  return (
    <div className="terms-page">
      <Navbar />
      <div className="terms-container">
        <div className="terms-header">
          <h1>Terms of Service</h1>
          <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="terms-content">
          <section className="terms-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Career & Education Gateway, you accept and agree to be bound by the terms and
              provision of this agreement. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section className="terms-section">
            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily use Career & Education Gateway for personal, non-commercial transitory
              viewing only. This is the grant of a license, not a transfer of title, and under this license
              you may not:
            </p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or other proprietary notations</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>3. User Accounts</h2>
            <h3>3.1 Account Creation</h3>
            <p>
              To use certain features of our platform, you must create an account. You agree to:
            </p>
            <ul>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information as necessary</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>

            <h3>3.2 Account Types</h3>
            <p>Our platform supports different account types:</p>
            <ul>
              <li><strong>Students:</strong> For individuals seeking education and career opportunities</li>
              <li><strong>Institutions:</strong> For educational institutions offering courses</li>
              <li><strong>Companies:</strong> For employers posting job opportunities</li>
              <li><strong>Administrators:</strong> For platform management</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>4. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the platform for any unlawful purpose</li>
              <li>Post false, misleading, or fraudulent information</li>
              <li>Impersonate any person or entity</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Upload malicious code or viruses</li>
              <li>Interfere with the platform's operation</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>5. Applications and Admissions</h2>
            <p>
              Career & Education Gateway facilitates the application process between students and institutions. We are
              not responsible for:
            </p>
            <ul>
              <li>Admission decisions made by institutions</li>
              <li>The accuracy of course information provided by institutions</li>
              <li>Any disputes between students and institutions</li>
              <li>Institution policies and requirements</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>6. Job Postings and Applications</h2>
            <p>
              Companies are responsible for the accuracy of their job postings. We are not responsible for:
            </p>
            <ul>
              <li>Hiring decisions made by companies</li>
              <li>Job descriptions and requirements</li>
              <li>Employment terms and conditions</li>
              <li>Any disputes between applicants and employers</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>7. Intellectual Property</h2>
            <p>
              The platform and its original content, features, and functionality are owned by Career & Education Gateway
              and are protected by international copyright, trademark, patent, trade secret, and other
              intellectual property laws.
            </p>
          </section>

          <section className="terms-section">
            <h2>8. Disclaimer</h2>
            <p>
              The information on this platform is provided on an "as is" basis. To the fullest extent
              permitted by law, Career & Education Gateway excludes all representations, warranties, and conditions
              relating to our platform and the use of this platform.
            </p>
          </section>

          <section className="terms-section">
            <h2>9. Limitation of Liability</h2>
            <p>
              In no event shall Career & Education Gateway, nor its directors, employees, partners, agents, suppliers,
              or affiliates, be liable for any indirect, incidental, special, consequential, or punitive
              damages resulting from your use of the platform.
            </p>
          </section>

          <section className="terms-section">
            <h2>10. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the platform immediately, without prior
              notice, for conduct that we believe violates these Terms of Service or is harmful to other
              users, us, or third parties.
            </p>
          </section>

          <section className="terms-section">
            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any material
              changes by posting the new terms on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="terms-section">
            <h2>12. Contact Information</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> legal@careereducationgateway.ls<br />
              <strong>Address:</strong> Career & Education Gateway, Lesotho
            </p>
          </section>
        </div>

        <div className="terms-footer">
          <Link to="/" className="back-link">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

