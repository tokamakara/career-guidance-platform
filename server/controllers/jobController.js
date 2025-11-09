const { admin, db } = require('../config/firebaseAdmin');
const jobMatchingAlgorithm = require('../utils/jobMatchingAlgorithm');
const emailService = require('../utils/emailService');

class JobController {
  // Post a new job
  async createJob(req, res) {
    try {
      const {
        title,
        department,
        type,
        location,
        description,
        requirements,
        qualifications,
        skills,
        salaryRange,
        applicationDeadline
      } = req.body;

      const companyId = req.user.uid;

      // Get company profile
      const companyDoc = await db.collection('users').doc(companyId).get();
      if (!companyDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Company profile not found'
        });
      }

      const companyProfile = companyDoc.data();

      const jobData = {
        title,
        department,
        type,
        location,
        description,
        requirements: {
          qualifications: qualifications || [],
          certificates: requirements.certificates || [],
          workExperience: requirements.workExperience || 0,
          skills: skills || []
        },
        salaryRange,
        applicationDeadline: new Date(applicationDeadline),
        companyId,
        companyName: companyProfile.companyName,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const jobRef = await db.collection('jobs').add(jobData);

      res.status(201).json({
        success: true,
        message: 'Job posted successfully',
        data: {
          id: jobRef.id,
          ...jobData
        }
      });

    } catch (error) {
      console.error('Create job error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to post job'
      });
    }
  }

  // Get job recommendations for student
  async getJobRecommendations(req, res) {
    try {
      const studentId = req.user.uid;

      // Get student profile
      const studentDoc = await db.collection('users').doc(studentId).get();
      if (!studentDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found'
        });
      }

      const studentProfile = studentDoc.data();

      // Get active jobs
      const jobsSnapshot = await db.collection('jobs')
        .where('status', '==', 'open')
        .where('applicationDeadline', '>', new Date())
        .get();

      const availableJobs = [];
      jobsSnapshot.forEach(doc => {
        availableJobs.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Get recommendations using matching algorithm
      const recommendations = await jobMatchingAlgorithm.getJobRecommendations(
        studentProfile,
        availableJobs,
        10
      );

      res.json({
        success: true,
        data: recommendations
      });

    } catch (error) {
      console.error('Get job recommendations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get job recommendations'
      });
    }
  }

  // Apply to a job
  async applyToJob(req, res) {
    try {
      const { jobId, coverLetter } = req.body;
      const studentId = req.user.uid;

      // Check if job exists and is open
      const jobDoc = await db.collection('jobs').doc(jobId).get();
      if (!jobDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      const job = jobDoc.data();

      if (job.status !== 'open') {
        return res.status(400).json({
          success: false,
          message: 'Job is no longer accepting applications'
        });
      }

      if (new Date() > job.applicationDeadline.toDate()) {
        return res.status(400).json({
          success: false,
          message: 'Application deadline has passed'
        });
      }

      // Check if already applied
      const existingApplication = await db.collection('jobApplications')
        .where('studentId', '==', studentId)
        .where('jobId', '==', jobId)
        .get();

      if (!existingApplication.empty) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied to this job'
        });
      }

      // Get student profile for matching
      const studentDoc = await db.collection('users').doc(studentId).get();
      const studentProfile = studentDoc.data();

      // Calculate match score
      const matchResult = await jobMatchingAlgorithm.calculateMatchScore(
        studentProfile,
        job.requirements
      );

      const applicationData = {
        studentId,
        jobId,
        companyId: job.companyId,
        applicationDate: new Date(),
        coverLetter: coverLetter || '',
        status: matchResult.qualified ? 'shortlisted' : 'under-review',
        matchScore: matchResult.score,
        matchBreakdown: matchResult.breakdown,
        studentName: `${studentProfile.firstName} ${studentProfile.lastName}`,
        studentEmail: studentProfile.email,
        jobTitle: job.title,
        companyName: job.companyName
      };

      const applicationRef = await db.collection('jobApplications').add(applicationData);

      // Update student's job applications
      await db.collection('users').doc(studentId).update({
        jobApplications: admin.firestore.FieldValue.arrayUnion(applicationRef.id)
      });

      // Send notification to company if qualified
      if (matchResult.qualified) {
        await this.notifyCompanyNewApplication(applicationRef.id, applicationData);
      }

      res.status(201).json({
        success: true,
        message: 'Job application submitted successfully',
        data: {
          id: applicationRef.id,
          ...applicationData,
          qualified: matchResult.qualified
        }
      });

    } catch (error) {
      console.error('Apply to job error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit job application'
      });
    }
  }

  // Get qualified candidates for a job (for companies)
  async getQualifiedCandidates(req, res) {
    try {
      const { jobId } = req.params;
      const companyId = req.user.uid;

      // Verify job belongs to company
      const jobDoc = await db.collection('jobs').doc(jobId).get();
      if (!jobDoc.exists || jobDoc.data().companyId !== companyId) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Get all applications for this job
      const applicationsSnapshot = await db.collection('jobApplications')
        .where('jobId', '==', jobId)
        .where('status', '==', 'shortlisted')
        .get();

      const candidates = [];
      for (const doc of applicationsSnapshot.docs) {
        const application = doc.data();
        
        // Get student details
        const studentDoc = await db.collection('users').doc(application.studentId).get();
        const studentData = studentDoc.data();

        candidates.push({
          applicationId: doc.id,
          ...application,
          student: {
            id: application.studentId,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            email: studentData.email,
            highSchoolResults: studentData.highSchoolResults || [],
            certificates: studentData.certificates || [],
            workExperience: studentData.workExperience || [],
            skills: studentData.skills || []
          }
        });
      }

      // Sort by match score
      candidates.sort((a, b) => b.matchScore - a.matchScore);

      res.json({
        success: true,
        data: candidates
      });

    } catch (error) {
      console.error('Get qualified candidates error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch qualified candidates'
      });
    }
  }

  // Get public job listings
  async getPublicJobs(req, res) {
    try {
      const jobsSnapshot = await db.collection('jobs')
        .where('status', '==', 'open')
        .where('applicationDeadline', '>', new Date())
        .orderBy('createdAt', 'desc')
        .get();

      const jobs = [];
      jobsSnapshot.forEach(doc => {
        const jobData = doc.data();
        // Return only public-facing job information
        jobs.push({
          id: doc.id,
          title: jobData.title,
          department: jobData.department,
          type: jobData.type,
          location: jobData.location,
          description: jobData.description,
          requirements: jobData.requirements,
          salaryRange: jobData.salaryRange,
          applicationDeadline: jobData.applicationDeadline,
          companyName: jobData.companyName,
          createdAt: jobData.createdAt
        });
      });

      res.json({
        success: true,
        data: jobs
      });

    } catch (error) {
      console.error('Get public jobs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch job listings'
      });
    }
  }

  // Get job details for public view
  async getJobDetails(req, res) {
    try {
      const { jobId } = req.params;

      const jobDoc = await db.collection('jobs').doc(jobId).get();
      
      if (!jobDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      const jobData = jobDoc.data();

      // Return public job details only
      const publicJob = {
        id: jobDoc.id,
        title: jobData.title,
        department: jobData.department,
        type: jobData.type,
        location: jobData.location,
        description: jobData.description,
        requirements: jobData.requirements,
        salaryRange: jobData.salaryRange,
        applicationDeadline: jobData.applicationDeadline,
        companyName: jobData.companyName,
        createdAt: jobData.createdAt
      };

      res.json({
        success: true,
        data: publicJob
      });

    } catch (error) {
      console.error('Get job details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch job details'
      });
    }
  }

  // Notify company about new qualified application
  async notifyCompanyNewApplication(applicationId, applicationData) {
    try {
      // Get company profile
      const companyDoc = await db.collection('users').doc(applicationData.companyId).get();
      const companyProfile = companyDoc.data();

      const subject = 'New Qualified Applicant';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">New Qualified Applicant</h2>
          <p>Dear ${companyProfile.companyName},</p>
          <p>You have a new qualified applicant for the position: <strong>${applicationData.jobTitle}</strong></p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Applicant:</strong> ${applicationData.studentName}</p>
            <p><strong>Match Score:</strong> ${applicationData.matchScore}%</p>
            <p><strong>Email:</strong> ${applicationData.studentEmail}</p>
          </div>
          <p>View the application in your company dashboard to learn more.</p>
          <br>
          <p>Best regards,<br>Career Guidance Platform</p>
        </div>
      `;

      await emailService.sendEmail(companyProfile.email, subject, html);
    } catch (error) {
      console.error('Notification error:', error);
    }
  }
}

module.exports = new JobController();