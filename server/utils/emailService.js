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

  async sendAdmissionDecision(studentEmail, institutionName, courseName, status) {
    const subject = `Admission Decision - ${institutionName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Admission Decision</h2>
        <p>Dear Student,</p>
        <p>Your application to <strong>${institutionName}</strong> for <strong>${courseName}</strong> has been <strong>${status}</strong>.</p>
        <p>Please check your dashboard for more details.</p>
        <br>
        <p>Best regards,<br>${institutionName}</p>
      </div>
    `;

    return await this.sendEmail(studentEmail, subject, html);
  }
}

module.exports = new EmailService();