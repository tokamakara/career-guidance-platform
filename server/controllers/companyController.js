const { admin, db } = require('../config/firebaseAdmin');

class CompanyController {
  // Get company profile
  async getCompanyProfile(req, res) {
    try {
      const companyId = req.user.uid;

      const companyDoc = await db.collection('companies').doc(companyId).get();
      const userDoc = await db.collection('users').doc(companyId).get();

      if (!companyDoc.exists || !userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Company profile not found'
        });
      }

      const companyData = companyDoc.data();
      const userData = userDoc.data();

      res.json({
        success: true,
        data: {
          ...companyData,
          ...userData,
          id: companyId
        }
      });

    } catch (error) {
      console.error('Get company profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch company profile'
      });
    }
  }

  // Update company profile
  async updateCompanyProfile(req, res) {
    try {
      const companyId = req.user.uid;
      const updates = req.body;

      // Update company collection
      if (updates.companyName || updates.industry || updates.size || 
          updates.website || updates.description || updates.location) {
        
        const companyUpdates = {};
        if (updates.companyName) companyUpdates.name = updates.companyName;
        if (updates.industry) companyUpdates.industry = updates.industry;
        if (updates.size) companyUpdates.size = updates.size;
        if (updates.website) companyUpdates.website = updates.website;
        if (updates.description) companyUpdates.description = updates.description;
        if (updates.location) companyUpdates.location = updates.location;

        companyUpdates.updatedAt = new Date();

        await db.collection('companies').doc(companyId).update(companyUpdates);
      }

      // Update users collection
      const userUpdates = {};
      if (updates.firstName) userUpdates.firstName = updates.firstName;
      if (updates.lastName) userUpdates.lastName = updates.lastName;
      if (updates.phone) userUpdates.phone = updates.phone;
      if (updates.companyName) userUpdates.companyName = updates.companyName;
      if (updates.contactPerson) userUpdates.contactPerson = `${updates.firstName} ${updates.lastName}`;

      userUpdates.updatedAt = new Date();

      await db.collection('users').doc(companyId).update(userUpdates);

      res.json({
        success: true,
        message: 'Company profile updated successfully'
      });

    } catch (error) {
      console.error('Update company profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update company profile'
      });
    }
  }

  // Get company's job postings
  async getCompanyJobs(req, res) {
    try {
      const companyId = req.user.uid;

      const jobsSnapshot = await db.collection('jobs')
        .where('companyId', '==', companyId)
        .orderBy('createdAt', 'desc')
        .get();

      const jobs = [];
      jobsSnapshot.forEach(doc => {
        jobs.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.json({
        success: true,
        data: jobs
      });

    } catch (error) {
      console.error('Get company jobs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch company jobs'
      });
    }
  }

  // Get company dashboard stats
  async getCompanyStats(req, res) {
    try {
      const companyId = req.user.uid;

      const [jobsSnapshot, applicationsSnapshot] = await Promise.all([
        db.collection('jobs').where('companyId', '==', companyId).get(),
        db.collection('jobApplications').where('companyId', '==', companyId).get()
      ]);

      const jobs = jobsSnapshot.docs.map(doc => doc.data());
      const applications = applicationsSnapshot.docs.map(doc => doc.data());

      const stats = {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(job => job.status === 'open').length,
        totalApplications: applications.length,
        qualifiedApplications: applications.filter(app => app.status === 'shortlisted').length,
        applicationStatus: applications.reduce((acc, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
        }, {})
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get company stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch company statistics'
      });
    }
  }

  // Export admitted candidates as PDF (for companies)
  async exportAdmittedCandidates(req, res) {
    try {
      const jobId = req.params.jobId;
      const companyId = req.user.uid;
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
      console.error('Export admitted candidates error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export admitted candidates'
      });
    }
  }
}

module.exports = new CompanyController();