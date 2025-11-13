const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({  // ← FIXED: createTransport (not createTransporter)
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendApplicationConfirmation(studentEmail, institutionName, courseName) {
    const subject = 'Application Submitted Successfully';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Application Submitted</h2>
        <p>Dear Student,</p>
        <p>Your application to <strong>${institutionName}</strong> for the course <strong>${courseName}</strong> has been successfully submitted.</p>
        <p>You can track your application status from your dashboard.</p>
        <br>
        <p>Best regards,<br>Career Guidance Platform</p>
      </div>
    `;

    return await this.sendEmail(studentEmail, subject, html);
  }

  async sendAdmissionDecision(studentEmail, institutionName, courseName, status, rejectionReason = null, improvementSuggestions = null) {
    const subject = status === 'admitted' 
      ? `Congratulations! Admission Offer - ${institutionName}`
      : `Admission Decision - ${institutionName}`;
    
    let html = '';
    
    if (status === 'admitted') {
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px; text-align: center; color: white; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 28px;">Congratulations!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">You Have Been Admitted</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Dear Student,
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              We are pleased to inform you that your application to <strong>${institutionName}</strong> for the course <strong>${courseName}</strong> has been <strong style="color: #28a745;">accepted</strong>.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              This is a significant achievement, and we congratulate you on your success. Please log in to your dashboard to accept the admission offer and view next steps.
            </p>
          </div>
          <div style="background: #e7f5e7; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; color: #155724;">
              <strong>Next Steps:</strong> Please log in to your dashboard to accept the admission offer and complete the enrollment process.
            </p>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            Best regards,<br>
            <strong>${institutionName}</strong><br>
            Career & Education Gateway
          </p>
        </div>
      `;
    } else {
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Admission Decision - ${institutionName}</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Dear Student,
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Thank you for your interest in <strong>${institutionName}</strong>. After careful review of your application for <strong>${courseName}</strong>, we regret to inform you that we are unable to offer you admission at this time.
            </p>
            ${rejectionReason ? `
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #856404; font-size: 16px;">Reason for Decision:</h3>
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">${rejectionReason}</p>
              </div>
            ` : ''}
            ${improvementSuggestions ? `
              <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #0c5460; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #0c5460; font-size: 16px;">Suggestions for Improvement:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #0c5460; font-size: 14px; line-height: 1.8;">
                  ${improvementSuggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              We encourage you to continue pursuing your educational goals and consider applying again in the future. We wish you the best in your academic journey.
            </p>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            Best regards,<br>
            <strong>${institutionName}</strong><br>
            Career & Education Gateway
          </p>
        </div>
      `;
    }

    return await this.sendEmail(studentEmail, subject, html);
  }

  async sendJobApplicationDecision(studentEmail, jobTitle, companyName, status, matchScore = null, rejectionReasons = null, improvementSuggestions = null) {
    let subject, html;
    
    if (status === 'shortlisted' || status === 'qualified' || status === 'accepted' || status === 'hired') {
      if (status === 'accepted' || status === 'hired') {
        subject = `Congratulations! Application Accepted - ${companyName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px; text-align: center; color: white; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 28px;">Congratulations!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Application Accepted</p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Dear Applicant,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                We are pleased to inform you that your application for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been <strong style="color: #28a745;">accepted</strong>.
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Our team will contact you shortly with next steps. Please ensure your contact information is up to date in your profile.
              </p>
            </div>
            <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #0c5460; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; color: #0c5460;">
                <strong>Next Steps:</strong> Please log in to your dashboard to view more details and prepare for the next phase.
              </p>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              Best regards,<br>
              <strong>${companyName}</strong><br>
              Career & Education Gateway
            </p>
          </div>
        `;
      } else {
        subject = `Congratulations! You Qualify for Interview - ${companyName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px; text-align: center; color: white; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 28px;">Congratulations!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">You Qualify for Interview</p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Dear Applicant,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                We are pleased to inform you that your application for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been reviewed and you have <strong style="color: #28a745;">qualified for an interview</strong>.
              </p>
              ${matchScore ? `
                <div style="background: #e7f5e7; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <p style="margin: 0; font-size: 14px; color: #155724;">
                    <strong>Your Match Score:</strong> ${matchScore}% - This indicates a strong alignment with our requirements.
                  </p>
                </div>
              ` : ''}
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Our team will contact you shortly to schedule an interview. Please ensure your contact information is up to date in your profile.
              </p>
            </div>
            <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #0c5460; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; color: #0c5460;">
                <strong>Next Steps:</strong> Please log in to your dashboard to view more details and prepare for your interview.
              </p>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              Best regards,<br>
              <strong>${companyName}</strong><br>
              Career & Education Gateway
            </p>
          </div>
        `;
      }
    } else {
      subject = `Application Update - ${companyName}`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Application Update - ${companyName}</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Dear Applicant,
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Thank you for your interest in the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>. After careful review of your application, we regret to inform you that we are unable to proceed with your application at this time.
            </p>
            ${rejectionReasons && rejectionReasons.length > 0 ? `
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #856404; font-size: 16px;">Why You Did Not Qualify:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 14px; line-height: 1.8;">
                  ${rejectionReasons.map(reason => `<li>${reason}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            ${improvementSuggestions && improvementSuggestions.length > 0 ? `
              <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #0c5460; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #0c5460; font-size: 16px;">How to Enhance Your Profile:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #0c5460; font-size: 14px; line-height: 1.8;">
                  ${improvementSuggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              We appreciate your interest in our company and encourage you to continue developing your skills. We wish you the best in your career journey.
            </p>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            Best regards,<br>
            <strong>${companyName}</strong><br>
            Career & Education Gateway
          </p>
      </div>
    `;
    }

    return await this.sendEmail(studentEmail, subject, html);
  }
}

module.exports = new EmailService();