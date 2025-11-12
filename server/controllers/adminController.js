const { admin, db } = require('../config/firebaseAdmin');

class AdminController {
  // Get dashboard statistics
  async getDashboardStats(req, res) {
    try {
      // Get users count
      const usersSnapshot = await db.collection('users').get();
      
      // Get institutions (from users collection with role='institute')
      const institutionsQuery = db.collection('users').where('role', '==', 'institute');
      const institutionsSnapshot = await institutionsQuery.get();
      
      // Get companies (from users collection with role='company')
      const companiesQuery = db.collection('users').where('role', '==', 'company');
      const companiesSnapshot = await companiesQuery.get();
      
      // Get applications
      const applicationsSnapshot = await db.collection('educationApplications').get();
      
      // Get jobs
      const jobsSnapshot = await db.collection('jobs').get();

      // Count pending institutions and companies
      let pendingInstitutions = 0;
      let pendingCompanies = 0;
      
      institutionsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'pending' || data.approvalStatus === 'pending') {
          pendingInstitutions++;
        }
      });
      
      companiesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'pending' || data.approvalStatus === 'pending') {
          pendingCompanies++;
        }
      });

      const stats = {
        totalUsers: usersSnapshot.size,
        totalInstitutions: institutionsSnapshot.size,
        totalCompanies: companiesSnapshot.size,
        totalApplications: applicationsSnapshot.size,
        totalJobs: jobsSnapshot.size,
        pendingApprovals: {
          institutions: pendingInstitutions,
          companies: pendingCompanies
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
        topInstitutions: this.getTopInstitutions(applications),
        popularCourses: this.getPopularCourses(applications)
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