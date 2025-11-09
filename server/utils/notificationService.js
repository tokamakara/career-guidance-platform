const { db } = require('../config/firebaseAdmin');
const emailService = require('./emailService');

class NotificationService {
  static async createNotification(userId, notification) {
    await db.collection('notifications').add({
      userId,
      ...notification,
      read: false,
      createdAt: new Date()
    });
  }

  static async sendAdmissionNotification(studentEmail, institutionName, status) {
    const subject = `Admission Decision - ${institutionName}`;
    const message = `Your application to ${institutionName} has been ${status}.`;
    
    await emailService.sendEmail(studentEmail, subject, message);
    
    // Also create in-app notification
    const student = await db.collection('users').where('email', '==', studentEmail).get();
    if (!student.empty) {
      const studentData = student.docs[0].data();
      await this.createNotification(studentData.uid, {
        type: 'admission_decision',
        title: `Admission Decision - ${institutionName}`,
        message: `Your application has been ${status}.`,
        relatedId: institutionName
      });
    }
  }

  static async sendJobMatchNotification(studentEmail, jobTitle, companyName, matchScore) {
    const subject = `New Job Match - ${jobTitle}`;
    const message = `You have a ${matchScore}% match for ${jobTitle} at ${companyName}.`;
    
    await emailService.sendEmail(studentEmail, subject, message);
    
    const student = await db.collection('users').where('email', '==', studentEmail).get();
    if (!student.empty) {
      const studentData = student.docs[0].data();
      await this.createNotification(studentData.uid, {
        type: 'job_match',
        title: `New Job Match - ${matchScore}%`,
        message: `You match ${jobTitle} at ${companyName}`,
        relatedId: jobTitle
      });
    }
  }

  static async sendWaitlistNotification(studentEmail, institutionName, position) {
    const subject = `Waitlist Update - ${institutionName}`;
    const message = `You are #${position} on the waitlist for ${institutionName}.`;
    
    await emailService.sendEmail(studentEmail, subject, message);
  }

  static async getUserNotifications(userId) {
    const snapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async markAsRead(notificationId) {
    await db.collection('notifications').doc(notificationId).update({
      read: true,
      readAt: new Date()
    });
  }
}

module.exports = NotificationService;