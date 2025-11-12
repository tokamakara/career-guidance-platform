import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar/Navbar';
import './FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          q: 'What is Career & Education Gateway?',
          a: 'Career & Education Gateway is a comprehensive platform that connects students with educational institutions and job opportunities in Lesotho. We help students find the right courses, apply to institutions, and discover career opportunities.'
        },
        {
          q: 'Is Career & Education Gateway free to use?',
          a: 'Yes, Career & Education Gateway is free for students to use. Educational institutions and companies may have different pricing plans for posting courses and jobs.'
        },
        {
          q: 'How do I create an account?',
          a: 'Click on the "Sign Up" button on the homepage, choose your account type (Student, Institution, or Company), fill in your details, and verify your email address.'
        }
      ]
    },
    {
      category: 'For Students',
      questions: [
        {
          q: 'How do I apply to a course?',
          a: 'Browse institutions and courses, check if you meet the requirements, and click "Apply Now". Fill in the application form and submit required documents.'
        },
        {
          q: 'Can I apply to multiple courses?',
          a: 'Yes, you can apply to multiple courses. However, each institution may have its own policies regarding multiple applications.'
        },
        {
          q: 'How do I check my application status?',
          a: 'Go to "My Applications" in your dashboard to see the status of all your applications. You will also receive notifications when your application status changes.'
        },
        {
          q: 'What documents do I need to upload?',
          a: 'Typically, you need to upload your high school results, identification documents, and any other documents required by the specific institution or course.'
        },
        {
          q: 'How does the job matching work?',
          a: 'Our algorithm matches your profile, qualifications, and experience with available job postings. You can view matched jobs in your Career Dashboard.'
        }
      ]
    },
    {
      category: 'For Institutions',
      questions: [
        {
          q: 'How do I sign up my institution?',
          a: 'Create an Institution account, provide your institution details, and wait for admin approval. Once approved, you can start adding faculties and courses.'
        },
        {
          q: 'How do I add courses?',
          a: 'After your institution is approved, go to your dashboard, select a faculty, and click "Add Course". Fill in the course details and requirements.'
        },
        {
          q: 'How do I review applications?',
          a: 'Go to "Applications" in your dashboard to see all applications for your courses. You can review, admit, reject, or waitlist applicants.'
        }
      ]
    },
    {
      category: 'For Companies',
      questions: [
        {
          q: 'How do I post a job?',
          a: 'Create a Company account, get approved by admin, then go to "Post Job" in your dashboard. Fill in the job details and requirements.'
        },
        {
          q: 'How do I find qualified candidates?',
          a: 'Use the "Filtered Candidates" feature in your dashboard. Our system automatically matches candidates based on job requirements.'
        },
        {
          q: 'Can I edit or delete a job posting?',
          a: 'Yes, you can edit or close job postings from your dashboard. However, you cannot delete postings that have received applications.'
        }
      ]
    },
    {
      category: 'Account & Settings',
      questions: [
        {
          q: 'How do I update my profile?',
          a: 'Go to "Profile" in your account menu to update your personal information, qualifications, and other details.'
        },
        {
          q: 'How do I change my password?',
          a: 'Go to Settings, then click on "Change Password". You will need to enter your current password and set a new one.'
        },
        {
          q: 'Can I delete my account?',
          a: 'Yes, you can delete your account from Settings. Note that this action is permanent and cannot be undone.'
        },
        {
          q: 'How do I export my data?',
          a: 'Go to Settings, scroll to "Data Management", and click "Export My Data" to download a copy of your information.'
        }
      ]
    },
    {
      category: 'Technical Support',
      questions: [
        {
          q: 'I forgot my password. How do I reset it?',
          a: 'Click "Forgot Password" on the sign in page, enter your email, and follow the instructions sent to your email address.'
        },
        {
          q: 'I\'m not receiving email notifications. What should I do?',
          a: 'Check your spam folder, verify your email address in Settings, and ensure email notifications are enabled in your notification preferences.'
        },
        {
          q: 'The website is not loading properly. What can I do?',
          a: 'Try clearing your browser cache, updating your browser, or using a different browser. If the problem persists, contact our support team.'
        },
        {
          q: 'How do I contact support?',
          a: 'You can contact us through the "Contact Support" link in Settings, or email us directly at support@careereducationgateway.ls'
        }
      ]
    }
  ];

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <Navbar />
      <div className="faq-container">
        <div className="faq-header">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about Career & Education Gateway</p>
        </div>

        <div className="faq-content">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="faq-category">
              <h2 className="category-title">{category.category}</h2>
              <div className="faq-list">
                {category.questions.map((faq, questionIndex) => {
                  const globalIndex = categoryIndex * 100 + questionIndex;
                  const isOpen = openIndex === globalIndex;
                  
                  return (
                    <div key={questionIndex} className="faq-item">
                      <button
                        className={`faq-question ${isOpen ? 'open' : ''}`}
                        onClick={() => toggleQuestion(globalIndex)}
                      >
                        <span>{faq.q}</span>
                        <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div className="faq-answer">
                          <p>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="faq-footer">
          <div className="faq-help">
            <h3>Still have questions?</h3>
            <p>Can't find the answer you're looking for? Please contact our support team.</p>
            <Link to="/contact" className="contact-link">Contact Support</Link>
          </div>
          <Link to="/" className="back-link">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

