const { admin, db } = require('../config/firebaseAdmin');

class AdminController {
  // Get dashboard statistics
  async getDashboardStats(req, res) {
    try {
      const [
        usersSnapshot,
        institutionsSnapshot,
        companiesSnapshot,
        applicationsSnapshot,
        jobsSnapshot
      ] = await Promise.all([
        db.collection('users').get(),
        db.collection('institutions').get(),
        db.collection('companies').get(),
        db.collection('educationApplications').get(),
        db.collection('jobs').get()
      ]);

      const stats = {
        totalUsers: usersSnapshot.size,
        totalInstitutions: institutionsSnapshot.size,
        totalCompanies: companiesSnapshot.size,
        totalApplications: applicationsSnapshot.size,
        totalJobs: jobsSnapshot.size,
        pendingApprovals: {
          institutions: institutionsSnapshot.docs.filter(doc => doc.data().status === 'pending').length,
          companies: companiesSnapshot.docs.filter(doc => doc.data().status === 'pending').length
        }
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics'
      });
    }
  }

  // Get all users with filtering
  async getUsers(req, res) {
    try {
      const { role, status } = req.query;
      let query = db.collection('users');

      if (role) {
        query = query.where('role', '==', role);
      }

      if (status) {
        query = query.where('status', '==', status);
      }

      const snapshot = await query.get();
      const users = [];
      
      snapshot.forEach(doc => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.json({
        success: true,
        data: users
      });

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  // Approve institution or company
  async approveRegistration(req, res) {
    try {
      const { userId } = req.params;
      const { type } = req.body; // 'institution' or 'company'

      // Update user status
      await db.collection('users').doc(userId).update({
        status: 'approved',
        updatedAt: new Date()
      });

      // Update institution/company status
      if (type === 'institution') {
        await db.collection('institutions').doc(userId).update({
          status: 'approved',
          updatedAt: new Date()
        });
      } else if (type === 'company') {
        await db.collection('companies').doc(userId).update({
          status: 'approved',
          updatedAt: new Date()
        });
      }

      // Get user email for notification
      const userDoc = await db.collection('users').doc(userId).get();
      const user = userDoc.data();

      res.json({
        success: true,
        message: `${type} approved successfully`
      });

    } catch (error) {
      console.error('Approve registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve registration'
      });
    }
  }

  // Suspend user account
  async suspendUser(req, res) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;

      await db.collection('users').doc(userId).update({
        status: 'suspended',
        suspensionReason: reason,
        suspendedAt: new Date(),
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: 'User suspended successfully'
      });

    } catch (error) {
      console.error('Suspend user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to suspend user'
      });
    }
  }

  // Reactivate user account
  async reactivateUser(req, res) {
    try {
      const { userId } = req.params;

      await db.collection('users').doc(userId).update({
        status: 'approved',
        suspensionReason: null,
        suspendedAt: null,
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: 'User reactivated successfully'
      });

    } catch (error) {
      console.error('Reactivate user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reactivate user'
      });
    }
  }

  // Delete user account
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      const userDoc = await db.collection('users').doc(userId).get();
      const user = userDoc.data();

      // Delete from Firebase Auth
      await admin.auth().deleteUser(userId);

      // Delete from Firestore
      await db.collection('users').doc(userId).delete();

      // Delete institution/company record if exists
      if (user.role === 'institution') {
        await db.collection('institutions').doc(userId).delete();
      } else if (user.role === 'company') {
        await db.collection('companies').doc(userId).delete();
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }

  // Get system reports
  async getReports(req, res) {
    try {
      const { type, startDate, endDate } = req.query;

      let reportData = {};

      switch (type) {
        case 'admissions':
          reportData = await this.generateAdmissionsReport(startDate, endDate);
          break;
        case 'employment':
          reportData = await this.generateEmploymentReport(startDate, endDate);
          break;
        case 'system':
          reportData = await this.generateSystemReport(startDate, endDate);
          break;
        default:
          reportData = await this.generateGeneralReport(startDate, endDate);
      }

      res.json({
        success: true,
        data: reportData
      });

    } catch (error) {
      console.error('Get reports error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate reports'
      });
    }
  }

  // Generate admissions report
  async generateAdmissionsReport(startDate, endDate) {
    const applicationsSnapshot = await db.collection('educationApplications').get();
    
    const applications = applicationsSnapshot.docs.map(doc => doc.data());
    const filteredApplications = applications.filter(app => {
      const appDate = app.applicationDate.toDate();
      return (!startDate || appDate >= new Date(startDate)) && 
             (!endDate || appDate <= new Date(endDate));
    });

    const statusCounts = filteredApplications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalApplications: filteredApplications.length,
      statusBreakdown: statusCounts,
      topInstitutions: this.getTopInstitutions(filteredApplications),
      popularCourses: this.getPopularCourses(filteredApplications)
    };
  }

  // Generate employment report
  async generateEmploymentReport(startDate, endDate) {
    const jobsSnapshot = await db.collection('jobs').get();
    const jobApplicationsSnapshot = await db.collection('jobApplications').get();

    const jobs = jobsSnapshot.docs.map(doc => doc.data());
    const jobApplications = jobApplicationsSnapshot.docs.map(doc => doc.data());

    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(job => job.status === 'open').length,
      totalJobApplications: jobApplications.length,
      applicationStatus: jobApplications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {}),
      topCompanies: this.getTopCompanies(jobs),
      popularJobTypes: this.getPopularJobTypes(jobs)
    };
  }

  // Generate system report
  async generateSystemReport(startDate, endDate) {
    const usersSnapshot = await db.collection('users').get();
    const institutionsSnapshot = await db.collection('institutions').get();
    const companiesSnapshot = await db.collection('companies').get();

    const users = usersSnapshot.docs.map(doc => doc.data());

    return {
      totalUsers: users.length,
      userGrowth: this.calculateUserGrowth(users, startDate, endDate),
      roleDistribution: users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}),
      institutionStats: {
        total: institutionsSnapshot.size,
        approved: institutionsSnapshot.docs.filter(doc => doc.data().status === 'approved').length,
        pending: institutionsSnapshot.docs.filter(doc => doc.data().status === 'pending').length
      },
      companyStats: {
        total: companiesSnapshot.size,
        approved: companiesSnapshot.docs.filter(doc => doc.data().status === 'approved').length,
        pending: companiesSnapshot.docs.filter(doc => doc.data().status === 'pending').length
      }
    };
  }

  // Helper methods
  getTopInstitutions(applications) {
    const institutionCounts = applications.reduce((acc, app) => {
      acc[app.institutionName] = (acc[app.institutionName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(institutionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }

  getPopularCourses(applications) {
    const courseCounts = applications.reduce((acc, app) => {
      acc[app.courseName] = (acc[app.courseName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(courseCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }

  getTopCompanies(jobs) {
    const companyCounts = jobs.reduce((acc, job) => {
      acc[job.companyName] = (acc[job.companyName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(companyCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }

  getPopularJobTypes(jobs) {
    const typeCounts = jobs.reduce((acc, job) => {
      acc[job.type] = (acc[job.type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }));
  }

  calculateUserGrowth(users, startDate, endDate) {
    const filteredUsers = users.filter(user => {
      const userDate = user.createdAt.toDate();
      return (!startDate || userDate >= new Date(startDate)) && 
             (!endDate || userDate <= new Date(endDate));
    });

    return filteredUsers.length;
  }

  async generateGeneralReport(startDate, endDate) {
    const [
      admissionsReport,
      employmentReport,
      systemReport
    ] = await Promise.all([
      this.generateAdmissionsReport(startDate, endDate),
      this.generateEmploymentReport(startDate, endDate),
      this.generateSystemReport(startDate, endDate)
    ]);

    return {
      admissions: admissionsReport,
      employment: employmentReport,
      system: systemReport,
      generatedAt: new Date().toISOString()
    };
  }
}

module.exports = new AdminController();