const { admin, db } = require('../config/firebaseAdmin');
const emailService = require('../utils/emailService');

class AdmissionManager {
  constructor() {
    this.maxWaitlistSize = 10;
  }

  // Process admission for a course when seats are available
  async processAdmissions(courseId, institutionId, facultyId) {
    try {
      const courseRef = db.collection('institutions').doc(institutionId)
        .collection('faculties').doc(facultyId)
        .collection('courses').doc(courseId);
      
      const courseDoc = await courseRef.get();
      if (!courseDoc.exists) return;

      const course = courseDoc.data();
      const availableSeats = course.seatsAvailable || 0;

      if (availableSeats <= 0) return;

      // Get admitted students count
      const admittedCount = await this.getAdmittedCount(courseId, institutionId);

      if (admittedCount >= availableSeats) return;

      const seatsNeeded = availableSeats - admittedCount;

      // Get waiting list applications
      const waitlistApps = await this.getWaitlistApplications(courseId, institutionId, seatsNeeded);

      for (const application of waitlistApps) {
        await this.promoteFromWaitlist(application.id, course);
      }

    } catch (error) {
      console.error('Process admissions error:', error);
    }
  }

  // Add student to waitlist
  async addToWaitlist(applicationId, course) {
    try {
      const applicationRef = db.collection('educationApplications').doc(applicationId);
      
      await applicationRef.update({
        status: 'waiting',
        waitlistPosition: await this.getNextWaitlistPosition(course.id, course.institutionId),
        updatedAt: new Date()
      });

      // Notify student
      await this.notifyWaitlistStatus(applicationId, 'added');

    } catch (error) {
      console.error('Add to waitlist error:', error);
    }
  }

  // Promote student from waitlist to admitted
  async promoteFromWaitlist(applicationId, course) {
    try {
      const applicationRef = db.collection('educationApplications').doc(applicationId);
      const applicationDoc = await applicationRef.get();
      const application = applicationDoc.data();

      await applicationRef.update({
        status: 'admitted',
        waitlistPosition: null,
        admissionDecision: {
          decision: 'admitted',
          decisionDate: new Date(),
          notes: 'Promoted from waitlist'
        },
        updatedAt: new Date()
      });

      // Notify student
      await this.notifyWaitlistStatus(applicationId, 'promoted');

      // Update course statistics
      await this.updateCourseStatistics(course.id, course.institutionId, course.facultyId);

    } catch (error) {
      console.error('Promote from waitlist error:', error);
    }
  }

  // Get waitlist applications in order
  async getWaitlistApplications(courseId, institutionId, limit = 1) {
    try {
      const snapshot = await db.collection('educationApplications')
        .where('courseId', '==', courseId)
        .where('institutionId', '==', institutionId)
        .where('status', '==', 'waiting')
        .orderBy('waitlistPosition', 'asc')
        .limit(limit)
        .get();

      const applications = [];
      snapshot.forEach(doc => {
        applications.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return applications;
    } catch (error) {
      console.error('Get waitlist applications error:', error);
      return [];
    }
  }

  // Get next waitlist position
  async getNextWaitlistPosition(courseId, institutionId) {
    try {
      const snapshot = await db.collection('educationApplications')
        .where('courseId', '==', courseId)
        .where('institutionId', '==', institutionId)
        .where('status', '==', 'waiting')
        .orderBy('waitlistPosition', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) return 1;

      const lastApplication = snapshot.docs[0].data();
      return (lastApplication.waitlistPosition || 0) + 1;
    } catch (error) {
      console.error('Get next waitlist position error:', error);
      return 1;
    }
  }

  // Get admitted students count
  async getAdmittedCount(courseId, institutionId) {
    try {
      const snapshot = await db.collection('educationApplications')
        .where('courseId', '==', courseId)
        .where('institutionId', '==', institutionId)
        .where('status', '==', 'admitted')
        .get();

      return snapshot.size;
    } catch (error) {
      console.error('Get admitted count error:', error);
      return 0;
    }
  }

  // Notify student about waitlist status
  async notifyWaitlistStatus(applicationId, action) {
    try {
      const applicationDoc = await db.collection('educationApplications').doc(applicationId).get();
      const application = applicationDoc.data();

      let subject, html;

      switch (action) {
        case 'added':
          subject = 'Application Added to Waitlist';
          html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #667eea;">Application Waitlisted</h2>
              <p>Dear ${application.studentName},</p>
              <p>Your application for <strong>${application.courseName}</strong> at <strong>${application.institutionName}</strong> has been added to the waitlist.</p>
              <p><strong>Waitlist Position:</strong> ${application.waitlistPosition}</p>
              <p>We will notify you if a seat becomes available.</p>
              <br>
              <p>Best regards,<br>${application.institutionName}</p>
            </div>
          `;
          break;

        case 'promoted':
          subject = 'Congratulations! Admission Offer';
          html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #667eea;">Admission Offer</h2>
              <p>Dear ${application.studentName},</p>
              <p>Congratulations! You have been promoted from the waitlist and admitted to <strong>${application.courseName}</strong> at <strong>${application.institutionName}</strong>.</p>
              <p>Please log in to your dashboard to accept the admission offer.</p>
              <br>
              <p>Best regards,<br>${application.institutionName}</p>
            </div>
          `;
          break;
      }

      await emailService.sendEmail(application.studentEmail, subject, html);
    } catch (error) {
      console.error('Waitlist notification error:', error);
    }
  }

  // Update course statistics
  async updateCourseStatistics(courseId, institutionId, facultyId) {
    try {
      const courseRef = db.collection('institutions').doc(institutionId)
        .collection('faculties').doc(facultyId)
        .collection('courses').doc(courseId);

      const admittedCount = await this.getAdmittedCount(courseId, institutionId);
      const waitlistCount = await this.getWaitlistCount(courseId, institutionId);

      await courseRef.update({
        admittedStudents: admittedCount,
        waitlistCount: waitlistCount,
        updatedAt: new Date()
      });

    } catch (error) {
      console.error('Update course statistics error:', error);
    }
  }

  // Get waitlist count
  async getWaitlistCount(courseId, institutionId) {
    try {
      const snapshot = await db.collection('educationApplications')
        .where('courseId', '==', courseId)
        .where('institutionId', '==', institutionId)
        .where('status', '==', 'waiting')
        .get();

      return snapshot.size;
    } catch (error) {
      console.error('Get waitlist count error:', error);
      return 0;
    }
  }
}

module.exports = new AdmissionManager();