const { admin, db } = require('../config/firebaseAdmin');
const jobMatchingAlgorithm = require('../utils/jobMatchingAlgorithm');
const emailService = require('../utils/emailService');
const notificationService = require('../utils/notificationService');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

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

  // Get job recommendations for student with pagination
  async getJobRecommendations(req, res) {
    try {
      const studentId = req.user.uid;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

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
      const allRecommendations = await jobMatchingAlgorithm.getJobRecommendations(
        studentProfile,
        availableJobs,
        100 // Get more recommendations to allow pagination
      );

      // Apply pagination
      const total = allRecommendations.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const recommendations = allRecommendations.slice(offset, offset + limit);

      res.json({
        success: true,
        data: recommendations,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
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

      // Two-tier system: ≥55% qualified, <55% rejected
      // Generate rejection reasons and improvement suggestions if not qualified
      let rejectionReasons = [];
      let improvementSuggestions = [];
      
      if (!matchResult.qualified) {
        rejectionReasons = this.generateRejectionReasons(studentProfile, job.requirements, matchResult.breakdown);
        improvementSuggestions = this.generateImprovementSuggestions(studentProfile, job.requirements, matchResult.breakdown);
      }

      const applicationData = {
        studentId,
        jobId,
        companyId: job.companyId,
        applicationDate: new Date(),
        coverLetter: coverLetter || '',
        status: matchResult.qualified ? 'shortlisted' : 'rejected', // ≥55% = shortlisted, <55% = rejected
        matchScore: matchResult.score,
        matchBreakdown: matchResult.breakdown,
        studentName: `${studentProfile.firstName} ${studentProfile.lastName}`,
        studentEmail: studentProfile.email,
        jobTitle: job.title,
        companyName: job.companyName,
        rejectionReasons: rejectionReasons.length > 0 ? rejectionReasons : null,
        improvementSuggestions: improvementSuggestions.length > 0 ? improvementSuggestions : null,
        qualified: matchResult.qualified // System qualification flag
      };

      const applicationRef = await db.collection('jobApplications').add(applicationData);

      // Update student's job applications
      await db.collection('users').doc(studentId).update({
        jobApplications: admin.firestore.FieldValue.arrayUnion(applicationRef.id)
      });

      // Send email and notification based on qualification status
      if (matchResult.qualified) {
        // Qualified - send interview qualification email
        await emailService.sendJobApplicationDecision(
          studentProfile.email,
          job.title,
          job.companyName,
          'qualified',
          matchResult.score,
          null,
          null
        );
        
        // Create UI notification
        await notificationService.createNotification(studentId, {
          type: 'job_application',
          title: 'Congratulations! You Qualify for Interview',
          message: `Your application for ${job.title} at ${job.companyName} has been reviewed and you qualify for an interview.`,
          actionUrl: `/student/career/applications`
        });

        // Notify company
        await this.notifyCompanyNewApplication(applicationRef.id, applicationData);
      } else {
        // Not qualified - automatically reject with detailed feedback
        await emailService.sendJobApplicationDecision(
          studentProfile.email,
          job.title,
          job.companyName,
          'rejected',
          matchResult.score,
          rejectionReasons,
          improvementSuggestions
        );

        // Create UI notification
        await notificationService.createNotification(studentId, {
          type: 'job_application',
          title: 'Application Update - ' + job.companyName,
          message: `Your application for ${job.title} did not meet the minimum requirements. Please check your email for detailed feedback.`,
          actionUrl: `/student/career/applications`
        });
      }

      res.status(201).json({
        success: true,
        message: matchResult.qualified 
          ? 'Job application submitted successfully. You qualify for an interview!'
          : 'Job application submitted. Unfortunately, you did not meet the minimum requirements. Please check your email for detailed feedback.',
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

      // Get all applications for this job - ONLY shortlisted (qualified ≥55%) candidates
      // Rejected candidates (<55%) are filtered out - companies don't see them
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
        data: candidates,
        message: `Found ${candidates.length} qualified candidate${candidates.length !== 1 ? 's' : ''} for this position`
      });

    } catch (error) {
      logger.logError(error, { context: 'getQualifiedCandidates', jobId: req.params.jobId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch qualified candidates'
      });
    }
  }

  // Get all applicants for a job (including rejected) - for company dashboard
  async getJobApplicants(req, res) {
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
        .get();

      const applicants = [];
      for (const doc of applicationsSnapshot.docs) {
        const application = doc.data();
        
        // Get student details
        const studentDoc = await db.collection('users').doc(application.studentId).get();
        if (!studentDoc.exists) continue;
        
        const studentData = studentDoc.data();

        applicants.push({
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

      // Sort by match score (highest first), then by status (shortlisted first)
      applicants.sort((a, b) => {
        if (a.status === 'shortlisted' && b.status !== 'shortlisted') return -1;
        if (a.status !== 'shortlisted' && b.status === 'shortlisted') return 1;
        return b.matchScore - a.matchScore;
      });

      const qualifiedCount = applicants.filter(a => a.status === 'shortlisted').length;
      const rejectedCount = applicants.filter(a => a.status === 'rejected').length;

      res.json({
        success: true,
        data: applicants,
        stats: {
          total: applicants.length,
          qualified: qualifiedCount,
          rejected: rejectedCount
        },
        message: `Found ${qualifiedCount} qualified candidate${qualifiedCount !== 1 ? 's' : ''} out of ${applicants.length} total applicant${applicants.length !== 1 ? 's' : ''}`
      });

    } catch (error) {
      logger.logError(error, { context: 'getJobApplicants', jobId: req.params.jobId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch job applicants'
      });
    }
  }

  // Get public job listings with pagination, search, and filters
  async getPublicJobs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const lastDocIdParam = req.query.lastDocId; // For cursor-based pagination
      const search = req.query.search?.toLowerCase().trim(); // Search term
      const location = req.query.location?.toLowerCase().trim(); // Filter by location
      const type = req.query.type?.toLowerCase().trim(); // Filter by job type
      const department = req.query.department?.toLowerCase().trim(); // Filter by department

      // Create cache key
      const cacheKey = `jobs:public:${page}:${limit}:${search || ''}:${location || ''}:${type || ''}:${department || ''}`;
      
      // Check cache
      const cached = cache.get(cacheKey);
      if (cached) {
        logger.info('Cache hit for public jobs', { cacheKey });
        return res.json(cached);
      }

      let query = db.collection('jobs')
        .where('status', '==', 'open')
        .where('applicationDeadline', '>', new Date())
        .orderBy('createdAt', 'desc')
        .limit(limit);

      // For cursor-based pagination (better for Firestore)
      if (lastDocIdParam && page > 1) {
        const lastDoc = await db.collection('jobs').doc(lastDocIdParam).get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
      }

      // Get total count for pagination metadata (separate query)
      const countQuery = db.collection('jobs')
        .where('status', '==', 'open')
        .where('applicationDeadline', '>', new Date());
      const totalSnapshot = await countQuery.get();
      const total = totalSnapshot.size;
      const totalPages = Math.ceil(total / limit);

      // Apply pagination
      const jobsSnapshot = await query.get();

      let jobs = [];
      let lastDocId = null;
      
      jobsSnapshot.forEach(doc => {
        const jobData = doc.data();
        lastDocId = doc.id; // Track last document ID for next page
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

      // Apply search filter
      if (search) {
        jobs = jobs.filter(job => 
          job.title.toLowerCase().includes(search) ||
          job.description.toLowerCase().includes(search) ||
          job.companyName.toLowerCase().includes(search) ||
          job.department.toLowerCase().includes(search)
        );
      }

      // Apply filters
      if (location) {
        jobs = jobs.filter(job => job.location.toLowerCase().includes(location));
      }
      if (type) {
        jobs = jobs.filter(job => job.type.toLowerCase() === type);
      }
      if (department) {
        jobs = jobs.filter(job => job.department.toLowerCase().includes(department));
      }

      const response = {
        success: true,
        data: jobs,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: jobsSnapshot.size === limit && page < totalPages,
          hasPrevPage: page > 1,
          lastDocId: lastDocId // For cursor-based pagination
        },
        filters: {
          search: search || null,
          location: location || null,
          type: type || null,
          department: department || null
        }
      };

      // Cache for 5 minutes
      cache.set(cacheKey, response, 5 * 60 * 1000);

      res.json(response);

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

  // Generate rejection reasons based on match breakdown
  generateRejectionReasons(studentProfile, jobRequirements, matchBreakdown) {
    const reasons = [];
    
    // Check academic performance
    if (matchBreakdown.academicPerformance < 0.5) {
      const requiredSubjects = jobRequirements.qualifications || [];
      const studentSubjects = (studentProfile.highSchoolResults || []).map(s => s.name);
      const missingSubjects = requiredSubjects.filter(req => 
        !studentSubjects.some(sub => sub.toLowerCase().includes(req.toLowerCase()))
      );
      
      if (missingSubjects.length > 0) {
        reasons.push(`Missing required academic subjects: ${missingSubjects.join(', ')}`);
      } else {
        reasons.push('Academic performance does not meet the minimum requirements for this position');
      }
    }
    
    // Check certificates
    if (matchBreakdown.certificates < 0.5) {
      const requiredCerts = jobRequirements.certificates || [];
      const studentCerts = (studentProfile.certificates || []).map(c => c.name);
      const missingCerts = requiredCerts.filter(req => 
        !studentCerts.some(cert => cert.toLowerCase().includes(req.toLowerCase()))
      );
      
      if (missingCerts.length > 0) {
        reasons.push(`Missing required certificates: ${missingCerts.join(', ')}`);
      } else {
        reasons.push('Required professional certificates are missing');
      }
    }
    
    // Check work experience
    if (matchBreakdown.workExperience < 0.5) {
      const requiredExp = jobRequirements.workExperience || 0;
      const studentExp = (studentProfile.workExperience || []).reduce((total, exp) => {
        const startDate = new Date(exp.startDate);
        const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
        const months = (endDate - startDate) / (1000 * 60 * 60 * 24 * 30);
        return total + Math.max(months, 0);
      }, 0) / 12;
      
      if (studentExp < requiredExp) {
        reasons.push(`Insufficient work experience. Required: ${requiredExp} years, Your experience: ${studentExp.toFixed(1)} years`);
      }
    }
    
    // Check skills/relevance
    if (matchBreakdown.relevance < 0.5) {
      const requiredSkills = jobRequirements.skills || [];
      const studentSkills = studentProfile.skills || [];
      const missingSkills = requiredSkills.filter(req => 
        !studentSkills.some(skill => skill.toLowerCase().includes(req.toLowerCase()))
      );
      
      if (missingSkills.length > 0) {
        reasons.push(`Missing required skills: ${missingSkills.join(', ')}`);
      } else {
        reasons.push('Skills do not match the job requirements');
      }
    }
    
    // Overall match score
    const overallScore = Object.values(matchBreakdown).reduce((sum, score) => sum + score, 0) / Object.keys(matchBreakdown).length;
    if (overallScore < 0.6) {
      reasons.push(`Overall match score (${Math.round(overallScore * 100)}%) is below the minimum threshold of 60%`);
    }
    
    return reasons.length > 0 ? reasons : ['Your profile does not meet the minimum requirements for this position'];
  }

  // Generate improvement suggestions
  generateImprovementSuggestions(studentProfile, jobRequirements, matchBreakdown) {
    const suggestions = [];
    
    // Academic suggestions
    if (matchBreakdown.academicPerformance < 0.5) {
      const requiredSubjects = jobRequirements.qualifications || [];
      suggestions.push(`Consider taking courses or improving grades in: ${requiredSubjects.join(', ')}`);
      suggestions.push('Focus on strengthening your academic foundation in the required subjects');
    }
    
    // Certificate suggestions
    if (matchBreakdown.certificates < 0.5) {
      const requiredCerts = jobRequirements.certificates || [];
      suggestions.push(`Obtain the following certificates: ${requiredCerts.join(', ')}`);
      suggestions.push('Consider enrolling in professional certification programs to enhance your qualifications');
    }
    
    // Experience suggestions
    if (matchBreakdown.workExperience < 0.5) {
      const requiredExp = jobRequirements.workExperience || 0;
      suggestions.push(`Gain at least ${requiredExp} years of relevant work experience`);
      suggestions.push('Consider internships, volunteer work, or entry-level positions to build experience');
    }
    
    // Skills suggestions
    if (matchBreakdown.relevance < 0.5) {
      const requiredSkills = jobRequirements.skills || [];
      suggestions.push(`Develop skills in: ${requiredSkills.join(', ')}`);
      suggestions.push('Take online courses, attend workshops, or practice these skills through projects');
    }
    
    // General suggestions
    suggestions.push('Update your profile regularly with new qualifications and experiences');
    suggestions.push('Continue learning and developing your skills to improve your match score for future opportunities');
    
    return suggestions;
  }

  // Update job application status (for companies)
  async updateJobApplicationStatus(req, res) {
    try {
      const { applicationId } = req.params;
      const { status, notes } = req.body;
      const companyId = req.user.uid;

      const applicationRef = db.collection('jobApplications').doc(applicationId);
      const applicationDoc = await applicationRef.get();

      if (!applicationDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      const application = applicationDoc.data();

      // Verify application belongs to company's job
      if (application.companyId !== companyId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this application'
        });
      }

      // Only allow updating qualified candidates (shortlisted status)
      if (application.status !== 'shortlisted') {
        return res.status(400).json({
          success: false,
          message: 'Can only update status of qualified candidates'
        });
      }

      const updateData = {
        status,
        updatedAt: new Date()
      };

      if (notes) {
        updateData.notes = notes;
      }

      await applicationRef.update(updateData);

      // Send email notification based on new status
      if (status === 'accepted' || status === 'hired') {
        await emailService.sendJobApplicationDecision(
          application.studentEmail,
          application.jobTitle,
          application.companyName,
          'accepted',
          application.matchScore,
          null,
          null
        );

        await notificationService.createNotification(application.studentId, {
          type: 'job_application',
          title: 'Congratulations! Application Accepted',
          message: `Your application for ${application.jobTitle} at ${application.companyName} has been accepted.`,
          actionUrl: `/student/career/applications`
        });
      } else if (status === 'rejected') {
        await emailService.sendJobApplicationDecision(
          application.studentEmail,
          application.jobTitle,
          application.companyName,
          'rejected',
          application.matchScore,
          notes ? [notes] : ['Company decision'],
          null
        );

        await notificationService.createNotification(application.studentId, {
          type: 'job_application',
          title: 'Application Update - ' + application.companyName,
          message: `Your application for ${application.jobTitle} has been reviewed. Please check your email for details.`,
          actionUrl: `/student/career/applications`
        });
      }

      res.json({
        success: true,
        message: `Application status updated to ${status}`,
        data: {
          id: applicationId,
          ...updateData
        }
      });

    } catch (error) {
      logger.logError(error, { context: 'updateJobApplicationStatus', applicationId: req.params.applicationId });
      res.status(500).json({
        success: false,
        message: 'Failed to update application status'
      });
    }
  }

  // Bulk update job application status (for companies)
  async bulkUpdateJobApplicationStatus(req, res) {
    try {
      const { jobId } = req.params;
      const { applicationIds, status, notes } = req.body;
      const companyId = req.user.uid;

      if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Application IDs are required'
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      // Verify job belongs to company
      const jobDoc = await db.collection('jobs').doc(jobId).get();
      if (!jobDoc.exists || jobDoc.data().companyId !== companyId) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      const batch = db.batch();
      const updatedApplications = [];
      let batchCount = 0;

      for (const applicationId of applicationIds) {
        const applicationRef = db.collection('jobApplications').doc(applicationId);
        const applicationDoc = await applicationRef.get();

        if (!applicationDoc.exists) continue;

        const application = applicationDoc.data();

        // Verify application belongs to company's job
        if (application.companyId !== companyId || application.jobId !== jobId) {
          continue;
        }

        // Only allow updating qualified candidates (shortlisted status)
        if (application.status !== 'shortlisted') {
          continue;
        }

        const updateData = {
          status,
          updatedAt: new Date()
        };

        if (notes) {
          updateData.notes = notes;
        }

        batch.update(applicationRef, updateData);
        updatedApplications.push({
          id: applicationId,
          studentEmail: application.studentEmail,
          studentId: application.studentId,
          jobTitle: application.jobTitle,
          companyName: application.companyName,
          matchScore: application.matchScore
        });
        batchCount++;

        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }

      // Send email notifications
      for (const app of updatedApplications) {
        if (status === 'accepted' || status === 'hired') {
          await emailService.sendJobApplicationDecision(
            app.studentEmail,
            app.jobTitle,
            app.companyName,
            'accepted',
            app.matchScore,
            null,
            null
          );

          await notificationService.createNotification(app.studentId, {
            type: 'job_application',
            title: 'Congratulations! Application Accepted',
            message: `Your application for ${app.jobTitle} at ${app.companyName} has been accepted.`,
            actionUrl: `/student/career/applications`
          });
        } else if (status === 'rejected') {
          await emailService.sendJobApplicationDecision(
            app.studentEmail,
            app.jobTitle,
            app.companyName,
            'rejected',
            app.matchScore,
            notes ? [notes] : ['Company decision'],
            null
          );

          await notificationService.createNotification(app.studentId, {
            type: 'job_application',
            title: 'Application Update - ' + app.companyName,
            message: `Your application for ${app.jobTitle} has been reviewed. Please check your email for details.`,
            actionUrl: `/student/career/applications`
          });
        }
      }

      res.json({
        success: true,
        message: `Updated ${updatedApplications.length} application(s) to ${status}`,
        data: {
          updatedCount: updatedApplications.length,
          status
        }
      });

    } catch (error) {
      logger.logError(error, { context: 'bulkUpdateJobApplicationStatus', jobId: req.params.jobId });
      res.status(500).json({
        success: false,
        message: 'Failed to bulk update application status'
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