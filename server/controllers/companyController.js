const { admin, db } = require('../config/firebaseAdmin');

class CompanyController {
  // Get company profile
  async getCompanyProfile(req, res) {
    try {
      const companyId = req.user.uid;

      const userDoc = await db.collection('users').doc(companyId).get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Company profile not found'
        });
      }

      const userData = userDoc.data();

      // Verify it's a company
      if (userData.role !== 'company') {
        return res.status(403).json({
          success: false,
          message: 'User is not a company'
        });
      }

      res.json({
        success: true,
        data: {
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

      // Update users collection (single source of truth)
      const userUpdates = {};
      if (updates.firstName !== undefined) userUpdates.firstName = updates.firstName;
      if (updates.lastName !== undefined) userUpdates.lastName = updates.lastName;
      if (updates.phone !== undefined) userUpdates.phone = updates.phone;
      if (updates.companyName !== undefined) userUpdates.companyName = updates.companyName;
      if (updates.industry !== undefined) userUpdates.industry = updates.industry;
      if (updates.size !== undefined) userUpdates.size = updates.size;
      if (updates.website !== undefined) userUpdates.website = updates.website;
      if (updates.description !== undefined) userUpdates.description = updates.description;
      if (updates.location !== undefined) userUpdates.location = updates.location;
      if (updates.contactPerson !== undefined) {
        userUpdates.contactPerson = updates.contactPerson;
      } else if (updates.firstName && updates.lastName) {
        userUpdates.contactPerson = `${updates.firstName} ${updates.lastName}`;
      }

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

      // Get jobs without orderBy to avoid index requirement
      const jobsSnapshot = await db.collection('jobs')
        .where('companyId', '==', companyId)
        .get();

      const jobs = [];
      jobsSnapshot.forEach(doc => {
        const jobData = doc.data();
        jobs.push({
          id: doc.id,
          ...jobData
        });
      });

      // Sort in memory by createdAt if available
      jobs.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order
      });

      res.json({
        success: true,
        data: jobs
      });

    } catch (error) {
      console.error('Get company jobs error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch company jobs',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

      const shortlisted = applications.filter(app => app.status === 'shortlisted').length;
      const totalApplicants = applications.length;
      const avgMatchRate = totalApplicants > 0 
        ? (applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) / totalApplicants).toFixed(0) + '%'
        : '0%';

      const stats = {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(job => job.status === 'open' || job.status === 'active').length,
        totalApplicants: totalApplicants,
        shortlisted: shortlisted,
        matchRate: avgMatchRate,
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

  // Get filtered candidates based on criteria
  async getFilteredCandidates(req, res) {
    try {
      const companyId = req.user.uid;
      const { minMatchScore, educationLevel, skills, experience } = req.query;

      // Get all students
      const studentsSnapshot = await db.collection('users')
        .where('role', '==', 'student')
        .get();

      let candidates = [];

      for (const studentDoc of studentsSnapshot.docs) {
        const student = studentDoc.data();
        
        // Get student's job applications to calculate match scores
        const applicationsSnapshot = await db.collection('jobApplications')
          .where('studentId', '==', studentDoc.id)
          .where('companyId', '==', companyId)
          .get();

        if (applicationsSnapshot.empty) continue;

        // Get the highest match score from applications
        let maxMatchScore = 0;
        applicationsSnapshot.forEach(appDoc => {
          const app = appDoc.data();
          if (app.matchScore && app.matchScore > maxMatchScore) {
            maxMatchScore = app.matchScore;
          }
        });

        // Apply filters
        if (minMatchScore && maxMatchScore < parseFloat(minMatchScore)) {
          continue;
        }

        if (educationLevel && educationLevel !== 'Any') {
          // Check student's education level
          const studentEducation = student.educationLevel || student.highestEducation || '';
          if (!studentEducation.toLowerCase().includes(educationLevel.toLowerCase())) {
            continue;
          }
        }

        if (skills && skills.trim() !== '') {
          const requiredSkills = skills.split(',').map(s => s.trim().toLowerCase());
          const studentSkills = (student.skills || []).map(s => s.toLowerCase());
          const hasRequiredSkills = requiredSkills.some(skill => 
            studentSkills.some(studentSkill => studentSkill.includes(skill))
          );
          if (!hasRequiredSkills) {
            continue;
          }
        }

        if (experience && experience !== 'Any') {
          const studentExperience = student.experience || student.yearsOfExperience || 0;
          const requiredExperience = parseFloat(experience);
          if (studentExperience < requiredExperience) {
            continue;
          }
        }

        candidates.push({
          id: studentDoc.id,
          name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
          email: student.email,
          matchScore: maxMatchScore,
          educationLevel: student.educationLevel || student.highestEducation || 'N/A',
          skills: student.skills || [],
          experience: student.experience || student.yearsOfExperience || 0
        });
      }

      // Sort by match score descending
      candidates.sort((a, b) => b.matchScore - a.matchScore);

      res.json({
        success: true,
        data: candidates
      });

    } catch (error) {
      console.error('Get filtered candidates error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch filtered candidates'
      });
    }
  }
}

module.exports = new CompanyController();