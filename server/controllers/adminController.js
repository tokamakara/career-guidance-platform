const { admin, db } = require('../config/firebaseAdmin');

class AdminController {
  // Get dashboard statistics
  async getDashboardStats(req, res) {
    try {
      console.log('📊 Fetching admin dashboard stats...');
      
      // Initialize default stats
      let stats = {
        totalUsers: 0,
        totalInstitutions: 0,
        totalCompanies: 0,
        totalApplications: 0,
        totalJobs: 0,
        pendingApprovals: {
          institutions: 0,
          companies: 0
        }
      };

      // Get users count
      try {
        const usersSnapshot = await db.collection('users').get();
        stats.totalUsers = usersSnapshot.size;
        console.log(`✅ Users count: ${stats.totalUsers}`);
      } catch (error) {
        console.error('❌ Error fetching users:', error.message);
        // Continue with default value
      }
      
      // Get institutions (from users collection with role='institute')
      let institutionsSnapshot = null;
      try {
        const institutionsQuery = db.collection('users').where('role', '==', 'institute');
        institutionsSnapshot = await institutionsQuery.get();
        stats.totalInstitutions = institutionsSnapshot.size;
        console.log(`✅ Institutions count: ${stats.totalInstitutions}`);
      } catch (error) {
        console.error('❌ Error fetching institutions:', error.message);
        // Continue with default value
      }
      
      // Get companies (from users collection with role='company')
      let companiesSnapshot = null;
      try {
        const companiesQuery = db.collection('users').where('role', '==', 'company');
        companiesSnapshot = await companiesQuery.get();
        stats.totalCompanies = companiesSnapshot.size;
        console.log(`✅ Companies count: ${stats.totalCompanies}`);
      } catch (error) {
        console.error('❌ Error fetching companies:', error.message);
        // Continue with default value
      }
      
      // Get applications
      try {
        const applicationsSnapshot = await db.collection('educationApplications').get();
        stats.totalApplications = applicationsSnapshot.size;
        console.log(`✅ Applications count: ${stats.totalApplications}`);
      } catch (appError) {
        console.warn('⚠️ Error fetching applications:', appError.message);
        // Continue with default value
      }
      
      // Get jobs
      try {
        const jobsSnapshot = await db.collection('jobs').get();
        stats.totalJobs = jobsSnapshot.size;
        console.log(`✅ Jobs count: ${stats.totalJobs}`);
      } catch (jobError) {
        console.warn('⚠️ Error fetching jobs:', jobError.message);
        // Continue with default value
      }

      // Count pending institutions and companies
      if (institutionsSnapshot) {
        try {
          institutionsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.status === 'pending' || data.approvalStatus === 'pending') {
              stats.pendingApprovals.institutions++;
            }
          });
        } catch (error) {
          console.warn('⚠️ Error counting pending institutions:', error.message);
        }
      }
      
      if (companiesSnapshot) {
        try {
          companiesSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.status === 'pending' || data.approvalStatus === 'pending') {
              stats.pendingApprovals.companies++;
            }
          });
        } catch (error) {
          console.warn('⚠️ Error counting pending companies:', error.message);
        }
      }

      console.log('✅ Dashboard stats calculated:', stats);

      // Always return success, even if some queries failed (graceful degradation)
      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('❌ Get dashboard stats error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Return default stats instead of error (graceful degradation)
      const defaultStats = {
        totalUsers: 0,
        totalInstitutions: 0,
        totalCompanies: 0,
        totalApplications: 0,
        totalJobs: 0,
        pendingApprovals: {
          institutions: 0,
          companies: 0
        }
      };
      
      // Still return 200 with default values so frontend doesn't break
      res.status(200).json({
        success: true,
        data: defaultStats,
        warning: 'Some data could not be loaded. Showing default values.'
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

      // Status is already updated in users collection above
      // No need to update separate collections

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

  // Delete user account by userId
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      const userDoc = await db.collection('users').doc(userId).get();
      const user = userDoc.data();

      // Delete from Firebase Auth
      await admin.auth().deleteUser(userId);

      // Delete from Firestore
      await db.collection('users').doc(userId).delete();

      // All user data is in users collection, no separate collections to delete

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

  // Delete user account by email (for easier management)
  async deleteUserByEmail(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      console.log(`🔍 Searching for user with email: ${email}`);

      // Find user by email in Firebase Auth
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(email);
        console.log(`✅ Found user in Firebase Auth: ${userRecord.uid}`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Try Firestore
          const usersSnapshot = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

          if (usersSnapshot.empty) {
            return res.status(404).json({
              success: false,
              message: 'User not found'
            });
          }

          const userDoc = usersSnapshot.docs[0];
          const userId = userDoc.id;

          // Delete from Firestore only
          await db.collection('users').doc(userId).delete();
          console.log('✅ Deleted from Firestore');

          return res.json({
            success: true,
            message: 'User deleted successfully (Firestore only - not in Firebase Auth)'
          });
        }
        throw error;
      }

      const userId = userRecord.uid;

      // Delete from Firebase Auth
      await admin.auth().deleteUser(userId);
      console.log('✅ Deleted from Firebase Auth');

      // Delete from Firestore
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        await db.collection('users').doc(userId).delete();
        console.log('✅ Deleted from Firestore');
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (error) {
      console.error('Delete user by email error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete user'
      });
    }
  }

  // Get system reports
  async getReports(req, res) {
    try {
      const { type, start, end, startDate, endDate } = req.query;
      
      // Support both 'start/end' and 'startDate/endDate' parameter names
      const dateStart = startDate || start;
      const dateEnd = endDate || end;

      let reportData = {};

      switch (type) {
        case 'admissions':
          reportData = await this.generateAdmissionsReport(dateStart, dateEnd);
          break;
        case 'jobs':
        case 'employment':
          reportData = await this.generateEmploymentReport(dateStart, dateEnd);
          break;
        case 'system':
        case 'users':
          reportData = await this.generateSystemReport(dateStart, dateEnd);
          break;
        case 'applications':
          // For applications, use institute applications data
          reportData = await this.generateApplicationsReport(dateStart, dateEnd);
          break;
        case 'institutions':
          reportData = await this.generateInstitutionsReport(dateStart, dateEnd);
          break;
        default:
          reportData = await this.generateGeneralReport(dateStart, dateEnd);
      }

      res.json({
        success: true,
        data: reportData.data || reportData,
        total: reportData.total || (reportData.data && reportData.data.length) || 0,
        period: reportData.period || (dateStart && dateEnd ? `${dateStart} to ${dateEnd}` : 'All time'),
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Get reports error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Failed to generate reports',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get Applications Overview - Institute Applications
  async getInstituteApplications(req, res) {
    try {
      const { institutionId, courseId, status, startDate, endDate } = req.query;

      let query = db.collection('educationApplications');

      if (institutionId) {
        query = query.where('institutionId', '==', institutionId);
      }
      if (courseId) {
        query = query.where('courseId', '==', courseId);
      }
      if (status) {
        query = query.where('status', '==', status);
      }

      const snapshot = await query.get();
      let applications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter by date range if provided
      if (startDate || endDate) {
        applications = applications.filter(app => {
          const appDate = app.applicationDate?.toDate() || new Date(app.applicationDate);
          return (!startDate || appDate >= new Date(startDate)) &&
                 (!endDate || appDate <= new Date(endDate));
        });
      }

      // Get statistics
      const stats = {
        total: applications.length,
        admitted: applications.filter(a => a.status === 'admitted' || a.status === 'accepted').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
        pending: applications.filter(a => a.status === 'pending' || a.status === 'under-review').length,
        waitlisted: applications.filter(a => a.status === 'waiting' || a.status === 'waitlisted').length
      };

      res.json({
        success: true,
        data: applications,
        stats
      });

    } catch (error) {
      console.error('Get institute applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch institute applications'
      });
    }
  }

  // Get Applications Overview - Company Applications
  async getCompanyApplications(req, res) {
    try {
      const { companyId, jobId, status, startDate, endDate } = req.query;

      let query = db.collection('jobApplications');

      if (companyId) {
        query = query.where('companyId', '==', companyId);
      }
      if (jobId) {
        query = query.where('jobId', '==', jobId);
      }
      if (status) {
        query = query.where('status', '==', status);
      }

      const snapshot = await query.get();
      let applications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter by date range if provided
      if (startDate || endDate) {
        applications = applications.filter(app => {
          const appDate = app.applicationDate?.toDate() || new Date(app.applicationDate);
          return (!startDate || appDate >= new Date(startDate)) &&
                 (!endDate || appDate <= new Date(endDate));
        });
      }

      // Get statistics
      const stats = {
        total: applications.length,
        qualified: applications.filter(a => a.status === 'shortlisted' || a.qualified).length,
        rejected: applications.filter(a => a.status === 'rejected').length,
        accepted: applications.filter(a => a.status === 'accepted' || a.status === 'hired').length,
        underReview: applications.filter(a => a.status === 'under-review').length
      };

      res.json({
        success: true,
        data: applications,
        stats
      });

    } catch (error) {
      console.error('Get company applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch company applications'
      });
    }
  }

  // Get Applications Overview - Combined (Institute + Company)
  async getCombinedApplications(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const [instituteSnapshot, companySnapshot] = await Promise.all([
        db.collection('educationApplications').get(),
        db.collection('jobApplications').get()
      ]);

      let instituteApplications = instituteSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'education',
        ...doc.data()
      }));

      let companyApplications = companySnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'job',
        ...doc.data()
      }));

      // Filter by date range if provided
      if (startDate || endDate) {
        instituteApplications = instituteApplications.filter(app => {
          const appDate = app.applicationDate?.toDate() || new Date(app.applicationDate);
          return (!startDate || appDate >= new Date(startDate)) &&
                 (!endDate || appDate <= new Date(endDate));
        });

        companyApplications = companyApplications.filter(app => {
          const appDate = app.applicationDate?.toDate() || new Date(app.applicationDate);
          return (!startDate || appDate >= new Date(startDate)) &&
                 (!endDate || appDate <= new Date(endDate));
        });
      }

      const allApplications = [...instituteApplications, ...companyApplications];

      // Get combined statistics
      const stats = {
        total: allApplications.length,
        education: {
          total: instituteApplications.length,
          admitted: instituteApplications.filter(a => a.status === 'admitted' || a.status === 'accepted').length,
          rejected: instituteApplications.filter(a => a.status === 'rejected').length,
          pending: instituteApplications.filter(a => a.status === 'pending' || a.status === 'under-review').length
        },
        job: {
          total: companyApplications.length,
          qualified: companyApplications.filter(a => a.status === 'shortlisted' || a.qualified).length,
          rejected: companyApplications.filter(a => a.status === 'rejected').length,
          accepted: companyApplications.filter(a => a.status === 'accepted' || a.status === 'hired').length
        }
      };

      res.json({
        success: true,
        data: allApplications,
        stats
      });

    } catch (error) {
      console.error('Get combined applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch combined applications'
      });
    }
  }

  // Get Analytics & Reports - Institute Analytics
  async getInstituteAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const snapshot = await db.collection('educationApplications').get();
      let applications = snapshot.docs.map(doc => doc.data());

      // Filter by date range if provided
      if (startDate || endDate) {
        applications = applications.filter(app => {
          const appDate = app.applicationDate?.toDate() || new Date(app.applicationDate);
          return (!startDate || appDate >= new Date(startDate)) &&
                 (!endDate || appDate <= new Date(endDate));
        });
      }

      const analytics = {
        totalApplications: applications.length,
        statusBreakdown: applications.reduce((acc, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
        }, {}),
        admissionRate: applications.length > 0 
          ? ((applications.filter(a => a.status === 'admitted' || a.status === 'accepted').length / applications.length) * 100).toFixed(2)
          : 0,
        rejectionRate: applications.length > 0
          ? ((applications.filter(a => a.status === 'rejected').length / applications.length) * 100).toFixed(2)
          : 0,
        topInstitutions: Array.isArray(applications) && applications.length > 0 ? this.getTopInstitutions(applications) : [],
        popularCourses: Array.isArray(applications) && applications.length > 0 ? this.getPopularCourses(applications) : []
      };

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Get institute analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch institute analytics'
      });
    }
  }

  // Get Analytics & Reports - Company Analytics
  async getCompanyAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const snapshot = await db.collection('jobApplications').get();
      let applications = snapshot.docs.map(doc => doc.data());

      // Filter by date range if provided
      if (startDate || endDate) {
        applications = applications.filter(app => {
          const appDate = app.applicationDate?.toDate() || new Date(app.applicationDate);
          return (!startDate || appDate >= new Date(startDate)) &&
                 (!endDate || appDate <= new Date(endDate));
        });
      }

      const analytics = {
        totalApplications: applications.length,
        statusBreakdown: applications.reduce((acc, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
        }, {}),
        qualificationRate: applications.length > 0
          ? ((applications.filter(a => a.status === 'shortlisted' || a.qualified).length / applications.length) * 100).toFixed(2)
          : 0,
        rejectionRate: applications.length > 0
          ? ((applications.filter(a => a.status === 'rejected').length / applications.length) * 100).toFixed(2)
          : 0,
        averageMatchScore: applications.length > 0
          ? (applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) / applications.length).toFixed(2)
          : 0,
        topCompanies: this.getTopCompaniesFromApplications(applications),
        popularJobTypes: this.getPopularJobTypesFromApplications(applications)
      };

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Get company analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch company analytics'
      });
    }
  }

  // Get Analytics & Reports - Combined Analytics
  async getCombinedAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const [instituteSnapshot, companySnapshot] = await Promise.all([
        db.collection('educationApplications').get(),
        db.collection('jobApplications').get()
      ]);

      let instituteApplications = instituteSnapshot.docs.map(doc => doc.data());
      let companyApplications = companySnapshot.docs.map(doc => doc.data());

      // Filter by date range if provided
      if (startDate || endDate) {
        instituteApplications = instituteApplications.filter(app => {
          const appDate = app.applicationDate?.toDate() || new Date(app.applicationDate);
          return (!startDate || appDate >= new Date(startDate)) &&
                 (!endDate || appDate <= new Date(endDate));
        });

        companyApplications = companyApplications.filter(app => {
          const appDate = app.applicationDate?.toDate() || new Date(app.applicationDate);
          return (!startDate || appDate >= new Date(startDate)) &&
                 (!endDate || appDate <= new Date(endDate));
        });
      }

      const analytics = {
        totalApplications: instituteApplications.length + companyApplications.length,
        education: {
          total: instituteApplications.length,
          admitted: instituteApplications.filter(a => a.status === 'admitted' || a.status === 'accepted').length,
          rejected: instituteApplications.filter(a => a.status === 'rejected').length,
          admissionRate: instituteApplications.length > 0
            ? ((instituteApplications.filter(a => a.status === 'admitted' || a.status === 'accepted').length / instituteApplications.length) * 100).toFixed(2)
            : 0
        },
        job: {
          total: companyApplications.length,
          qualified: companyApplications.filter(a => a.status === 'shortlisted' || a.qualified).length,
          rejected: companyApplications.filter(a => a.status === 'rejected').length,
          qualificationRate: companyApplications.length > 0
            ? ((companyApplications.filter(a => a.status === 'shortlisted' || a.qualified).length / companyApplications.length) * 100).toFixed(2)
            : 0,
          averageMatchScore: companyApplications.length > 0
            ? (companyApplications.reduce((sum, app) => sum + (app.matchScore || 0), 0) / companyApplications.length).toFixed(2)
            : 0
        }
      };

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Get combined analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch combined analytics'
      });
    }
  }

  // Generate admissions report
  async generateAdmissionsReport(startDate, endDate) {
    try {
      const applicationsSnapshot = await db.collection('educationApplications').get();
      
      const applications = applicationsSnapshot.docs.map(doc => doc.data());
      const filteredApplications = applications.filter(app => {
        const appDate = app.applicationDate?.toDate ? app.applicationDate.toDate() : new Date(app.applicationDate || app.appliedAt);
        return (!startDate || appDate >= new Date(startDate)) && 
               (!endDate || appDate <= new Date(endDate));
      });

      const statusCounts = filteredApplications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});

      return {
        data: filteredApplications.map(app => ({
          institutionName: app.institutionName || 'Unknown',
          courseName: app.courseName || 'Unknown',
          applied: 1,
          admitted: (app.status === 'admitted' || app.status === 'accepted') ? 1 : 0,
          rate: app.status === 'admitted' || app.status === 'accepted' ? '100%' : '0%'
        })),
        total: filteredApplications.length,
        statusBreakdown: statusCounts,
        topInstitutions: filteredApplications.length > 0 ? this.getTopInstitutions(filteredApplications) : [],
        popularCourses: filteredApplications.length > 0 ? this.getPopularCourses(filteredApplications) : [],
        period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
      };
    } catch (error) {
      console.error('Generate admissions report error:', error);
      return {
        data: [],
        total: 0,
        period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
      };
    }
  }

  // Generate employment report
  async generateEmploymentReport(startDate, endDate) {
    try {
      const jobsSnapshot = await db.collection('jobs').get();
      const jobApplicationsSnapshot = await db.collection('jobApplications').get();

      const jobs = jobsSnapshot.docs.map(doc => doc.data());
      const jobApplications = jobApplicationsSnapshot.docs.map(doc => doc.data());

      // Filter by date range if provided
      let filteredJobs = jobs;
      let filteredApplications = jobApplications;
      
      if (startDate || endDate) {
        filteredJobs = jobs.filter(job => {
          const jobDate = job.createdAt?.toDate ? job.createdAt.toDate() : new Date(job.createdAt || job.postedAt || 0);
          return (!startDate || jobDate >= new Date(startDate)) &&
                 (!endDate || jobDate <= new Date(endDate));
        });
        
        filteredApplications = jobApplications.filter(app => {
          const appDate = app.applicationDate?.toDate ? app.applicationDate.toDate() : new Date(app.applicationDate || app.appliedAt || 0);
          return (!startDate || appDate >= new Date(startDate)) &&
                 (!endDate || appDate <= new Date(endDate));
        });
      }

      return {
        data: filteredJobs.map(job => ({
          companyName: job.companyName || 'Unknown',
          jobTitle: job.title || job.jobTitle || 'Unknown',
          applications: filteredApplications.filter(app => app.jobId === job.id || app.jobTitle === job.title).length,
          matches: filteredApplications.filter(app => (app.jobId === job.id || app.jobTitle === job.title) && app.status === 'shortlisted').length
        })),
        total: filteredJobs.length,
        totalJobApplications: filteredApplications.length,
        activeJobs: filteredJobs.filter(job => job.status === 'open' || job.status === 'active').length,
        applicationStatus: filteredApplications.reduce((acc, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
        }, {}),
        period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
      };
    } catch (error) {
      console.error('Generate employment report error:', error);
      return {
        data: [],
        total: 0,
        period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
      };
    }
  }

  // Generate system report
  async generateSystemReport(startDate, endDate) {
    try {
      const usersSnapshot = await db.collection('users').get();
      const institutionsQuery = db.collection('users').where('role', '==', 'institute');
      const institutionsSnapshot = await institutionsQuery.get();
      const companiesQuery = db.collection('users').where('role', '==', 'company');
      const companiesSnapshot = await companiesQuery.get();

      const users = usersSnapshot.docs.map(doc => doc.data());

      // Filter users by date range if provided
      let filteredUsers = users;
      if (startDate || endDate) {
        filteredUsers = users.filter(user => {
          const userDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt || 0);
          return (!startDate || userDate >= new Date(startDate)) &&
                 (!endDate || userDate <= new Date(endDate));
        });
      }

      return {
        data: filteredUsers.map(user => ({
          email: user.email || 'Unknown',
          role: user.role || 'Unknown',
          status: user.status || 'active',
          createdAt: user.createdAt?.toDate ? user.createdAt.toDate().toISOString() : new Date(user.createdAt || 0).toISOString()
        })),
        total: filteredUsers.length,
        totalUsers: users.length,
        userGrowth: this.calculateUserGrowth(users, startDate, endDate),
        roleDistribution: users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {}),
        institutionStats: {
          total: institutionsSnapshot.size,
          approved: institutionsSnapshot.docs.filter(doc => {
            const data = doc.data();
            return data.status === 'approved' || data.approvalStatus === 'approved';
          }).length,
          pending: institutionsSnapshot.docs.filter(doc => {
            const data = doc.data();
            return data.status === 'pending' || data.approvalStatus === 'pending';
          }).length
        },
        companyStats: {
          total: companiesSnapshot.size,
          approved: companiesSnapshot.docs.filter(doc => {
            const data = doc.data();
            return data.status === 'approved' || data.approvalStatus === 'approved';
          }).length,
          pending: companiesSnapshot.docs.filter(doc => {
            const data = doc.data();
            return data.status === 'pending' || data.approvalStatus === 'pending';
          }).length
        },
        period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
      };
    } catch (error) {
      console.error('Generate system report error:', error);
      return {
        data: [],
        total: 0,
        period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
      };
    }
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

  getTopCompaniesFromApplications(applications) {
    const companyCounts = applications.reduce((acc, app) => {
      acc[app.companyName] = (acc[app.companyName] || 0) + 1;
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

  getPopularJobTypesFromApplications(applications) {
    const jobTitleCounts = applications.reduce((acc, app) => {
      acc[app.jobTitle] = (acc[app.jobTitle] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(jobTitleCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([title, count]) => ({ title, count }));
  }

  calculateUserGrowth(users, startDate, endDate) {
    try {
      const filteredUsers = users.filter(user => {
        const userDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt || 0);
        return (!startDate || userDate >= new Date(startDate)) && 
               (!endDate || userDate <= new Date(endDate));
      });

      return filteredUsers.length;
    } catch (error) {
      console.error('Calculate user growth error:', error);
      return 0;
    }
  }

  // Generate applications report
  async generateApplicationsReport(startDate, endDate) {
    try {
      const applicationsSnapshot = await db.collection('educationApplications').get();
      
      let applications = applicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter by date range if provided
      if (startDate || endDate) {
        applications = applications.filter(app => {
          const appDate = app.applicationDate?.toDate ? app.applicationDate.toDate() : new Date(app.applicationDate || app.appliedAt);
          return (!startDate || appDate >= new Date(startDate)) &&
                 (!endDate || appDate <= new Date(endDate));
        });
      }

      // Group by institution and course
      const grouped = {};
      applications.forEach(app => {
        const key = `${app.institutionName || 'Unknown'}-${app.courseName || 'Unknown'}`;
        if (!grouped[key]) {
          grouped[key] = {
            institutionName: app.institutionName || 'Unknown',
            courseName: app.courseName || 'Unknown',
            count: 0,
            status: app.status || 'pending'
          };
        }
        grouped[key].count++;
      });

      return {
        data: Object.values(grouped),
        total: applications.length,
        period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
      };
    } catch (error) {
      console.error('Generate applications report error:', error);
      return {
        data: [],
        total: 0,
        period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
      };
    }
  }

  // Generate institutions report
  async generateInstitutionsReport(startDate, endDate) {
    try {
      const institutionsSnapshot = await db.collection('users').where('role', '==', 'institute').get();
      const applicationsSnapshot = await db.collection('educationApplications').get();
      
      const institutions = institutionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      let applications = applicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter applications by date range if provided
      if (startDate || endDate) {
        applications = applications.filter(app => {
          const appDate = app.applicationDate?.toDate ? app.applicationDate.toDate() : new Date(app.applicationDate || app.appliedAt);
          return (!startDate || appDate >= new Date(startDate)) &&
                 (!endDate || appDate <= new Date(endDate));
        });
      }

      // Calculate performance metrics for each institution
      const performance = institutions.map(inst => {
        const instApplications = applications.filter(app => app.institutionId === inst.id);
        const admitted = instApplications.filter(app => app.status === 'admitted' || app.status === 'accepted').length;
        const total = instApplications.length;
        const admissionRate = total > 0 ? ((admitted / total) * 100).toFixed(1) : 0;

        return {
          institutionName: inst.institutionName || inst.companyName || 'Unknown',
          totalApplications: total,
          admitted: admitted,
          admissionRate: `${admissionRate}%`,
          status: inst.status || 'active'
        };
      });

      return {
        data: performance,
        total: institutions.length,
        period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
      };
    } catch (error) {
      console.error('Generate institutions report error:', error);
      return {
        data: [],
        total: 0,
        period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
      };
    }
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

  // Export admitted candidates as PDF (for companies)
  async exportCompanyAdmittedCandidates(req, res) {
    try {
      const { companyId, jobId } = req.params;
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="admitted-candidates-${companyId}-${Date.now()}.pdf"`);

      // Pipe PDF to response
      doc.pipe(res);

      // Get company profile
      const companyDoc = await db.collection('users').doc(companyId).get();
      const companyProfile = companyDoc.exists ? companyDoc.data() : {};

      // Get admitted candidates
      let query = db.collection('jobApplications')
        .where('companyId', '==', companyId)
        .where('status', 'in', ['accepted', 'hired']);

      if (jobId) {
        query = query.where('jobId', '==', jobId);
      }

      const snapshot = await query.get();
      const candidates = [];
      
      for (const docSnap of snapshot.docs) {
        const application = docSnap.data();
        const studentDoc = await db.collection('users').doc(application.studentId).get();
        if (studentDoc.exists) {
          const studentData = studentDoc.data();
          candidates.push({
            ...application,
            student: {
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              email: studentData.email
            }
          });
        }
      }

      // PDF Header
      doc.fontSize(20).text('Admitted Candidates Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Company: ${companyProfile.companyName || 'N/A'}`, { align: 'center' });
      if (jobId) {
        const jobDoc = await db.collection('jobs').doc(jobId).get();
        if (jobDoc.exists) {
          doc.text(`Job: ${jobDoc.data().title}`, { align: 'center' });
        }
      }
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);

      // Summary
      doc.fontSize(16).text('Summary', { underline: true });
      doc.fontSize(12).text(`Total Admitted Candidates: ${candidates.length}`);
      doc.moveDown();

      // Candidates List
      if (candidates.length > 0) {
        doc.fontSize(16).text('Candidates List', { underline: true });
        doc.moveDown();

        candidates.forEach((candidate, index) => {
          doc.fontSize(14).text(`${index + 1}. ${candidate.student.firstName} ${candidate.student.lastName}`, { bold: true });
          doc.fontSize(12).text(`   Email: ${candidate.student.email}`);
          doc.text(`   Job Title: ${candidate.jobTitle}`);
          doc.text(`   Match Score: ${candidate.matchScore}%`);
          doc.text(`   Application Date: ${candidate.applicationDate?.toDate ? candidate.applicationDate.toDate().toLocaleDateString() : new Date(candidate.applicationDate).toLocaleDateString()}`);
          doc.text(`   Status: ${candidate.status}`);
          if (candidate.notes) {
            doc.text(`   Notes: ${candidate.notes}`);
          }
          doc.moveDown();
        });
      } else {
        doc.fontSize(12).text('No admitted candidates found.', { align: 'center' });
      }

      // Footer
      doc.fontSize(10).text('Career & Education Gateway', { align: 'center' });
      doc.text('Generated by Career Guidance Platform', { align: 'center' });

      doc.end();

    } catch (error) {
      console.error('Export company admitted candidates error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export admitted candidates'
      });
    }
  }

  // Export admitted students as PDF (for institutes)
  async exportInstituteAdmittedStudents(req, res) {
    try {
      const { institutionId, courseId } = req.params;
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="admitted-students-${institutionId}-${Date.now()}.pdf"`);

      // Pipe PDF to response
      doc.pipe(res);

      // Get institution profile
      const institutionDoc = await db.collection('institutions').doc(institutionId).get();
      const institutionProfile = institutionDoc.exists ? institutionDoc.data() : {};

      // Get admitted students
      let query = db.collection('educationApplications')
        .where('institutionId', '==', institutionId)
        .where('status', 'in', ['admitted', 'accepted']);

      if (courseId) {
        query = query.where('courseId', '==', courseId);
      }

      const snapshot = await query.get();
      const students = [];
      
      for (const docSnap of snapshot.docs) {
        const application = docSnap.data();
        const studentDoc = await db.collection('users').doc(application.studentId).get();
        if (studentDoc.exists) {
          const studentData = studentDoc.data();
          students.push({
            ...application,
            student: {
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              email: studentData.email
            }
          });
        }
      }

      // PDF Header
      doc.fontSize(20).text('Admitted Students Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Institution: ${institutionProfile.name || 'N/A'}`, { align: 'center' });
      if (courseId) {
        // Get course details
        const applications = snapshot.docs.map(doc => doc.data());
        if (applications.length > 0) {
          const firstApp = applications[0];
          const courseRef = db.collection('institutions').doc(institutionId)
            .collection('faculties').doc(firstApp.facultyId)
            .collection('courses').doc(courseId);
          const courseDoc = await courseRef.get();
          if (courseDoc.exists) {
            doc.text(`Course: ${courseDoc.data().name}`, { align: 'center' });
          }
        }
      }
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);

      // Summary
      doc.fontSize(16).text('Summary', { underline: true });
      doc.fontSize(12).text(`Total Admitted Students: ${students.length}`);
      doc.moveDown();

      // Students List
      if (students.length > 0) {
        doc.fontSize(16).text('Students List', { underline: true });
        doc.moveDown();

        students.forEach((student, index) => {
          doc.fontSize(14).text(`${index + 1}. ${student.student.firstName} ${student.student.lastName}`, { bold: true });
          doc.fontSize(12).text(`   Email: ${student.student.email}`);
          doc.text(`   Course: ${student.courseName}`);
          doc.text(`   Application Date: ${student.applicationDate?.toDate ? student.applicationDate.toDate().toLocaleDateString() : new Date(student.applicationDate).toLocaleDateString()}`);
          doc.text(`   Status: ${student.status}`);
          if (student.notes) {
            doc.text(`   Notes: ${student.notes}`);
          }
          doc.moveDown();
        });
      } else {
        doc.fontSize(12).text('No admitted students found.', { align: 'center' });
      }

      // Footer
      doc.fontSize(10).text('Career & Education Gateway', { align: 'center' });
      doc.text('Generated by Career Guidance Platform', { align: 'center' });

      doc.end();

    } catch (error) {
      console.error('Export institute admitted students error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export admitted students'
      });
    }
  }
}

module.exports = new AdminController();