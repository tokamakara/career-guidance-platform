import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar/Navbar';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSent(true);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="contact-page">
        <Navbar />
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Message Sent Successfully!</h2>
          <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>
          <button 
            onClick={() => setSent(false)}
            className="back-button"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      <Navbar />
      <div className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Get in touch with our team for any questions or support</p>
        </div>
      </div>

      <div className="contact-content">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-form-container">
              <form onSubmit={handleSubmit} className="contact-form">
                <h2>Send us a Message</h2>

                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Inquiry Type</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="institution">Institution Partnership</option>
                    <option value="company">Company Partnership</option>
                    <option value="student">Student Support</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    required
                    placeholder="Please describe your inquiry in detail..."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={sending}
                  className="submit-button"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            <div className="contact-info">
              <h2>Get In Touch</h2>
              <p>
                Have questions about our platform? Need support with your account? 
                We're here to help you succeed in your educational and career journey.
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon">📧</div>
                  <div className="method-info">
                    <h3>Email Us</h3>
                    <p>toka70518@gmail.com</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">📞</div>
                  <div className="method-info">
                    <h3>Call Us</h3>
                    <p>+266 5973 4278</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">📍</div>
                  <div className="method-info">
                    <h3>Visit Us</h3>
                    <p>Maseru, Lesotho</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">🕒</div>
                  <div className="method-info">
                    <h3>Working Hours</h3>
                    <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="faq-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>How do I create an account?</h3>
              <p>
                Click on the "Sign Up" button in the top navigation and fill out 
                the sign up form with your details. You'll need to verify your 
                email address to activate your account.
              </p>
            </div>

            <div className="faq-item">
              <h3>Is the platform free for students?</h3>
              <p>
                Yes! Our platform is completely free for students. You can browse 
                institutions, apply to courses, and search for jobs without any charges.
              </p>
            </div>

            <div className="faq-item">
              <h3>How do institutions join the platform?</h3>
              <p>
                Institutions can sign up on our platform and will be verified by 
                our admin team. Once approved, they can start adding courses and 
                managing applications.
              </p>
            </div>

            <div className="faq-item">
              <h3>Can companies post jobs for free?</h3>
              <p>
                Companies can create an account and post job opportunities. Basic 
                features are free, with premium options available for enhanced 
                visibility and candidate matching.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;