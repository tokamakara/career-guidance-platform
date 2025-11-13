const { admin, db } = require('../config/firebaseAdmin');
const logger = require('../utils/logger');
const cache = require('../utils/cache');
const emailService = require('../utils/emailService');
const admissionManager = require('../utils/admissionManager');

class ApplicationController {

// Add to applicationController class
async checkCourseEligibility(req, res) {
  try {
    const { courseId, studentSubjects } = req.body;
    const studentId = req.user.uid;

    // Get course details
    const courseQuery = await db.collectionGroup('courses')
      .where('id', '==', courseId)
      .get();

    if (courseQuery.empty) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const courseDoc = courseQuery.docs[0];
    const course = courseDoc.data();

    // Check eligibility based on requirements
    const eligibilityResult = this.checkEligibility(studentSubjects, course.requirements);

    res.json({
      success: true,
      data: {
        eligible: eligibilityResult.eligible,
        missingRequirements: eligibilityResult.missingRequirements,
        course: {
          id: courseId,
          name: course.name,
          requirements: course.requirements
        }
      }
    });

  } catch (error) {
    console.error('Check eligibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check course eligibility'
    });
  }
}

// Enhanced eligibility checker
checkEligibility(studentSubjects, courseRequirements) {
  const missingRequirements = [];

  courseRequirements.forEach(requirement => {
    const studentSubject = studentSubjects.find(
      subject => subject.name === requirement.subject
    );

    if (!studentSubject) {
      missingRequirements.push({
        subject: requirement.subject,
        requiredGrade: requirement.grade,
        reason: 'Subject not completed'
      });
      return;
    }

    const meetsRequirement = this.meetsGradeRequirement(studentSubject.grade, requirement.grade);
    
    if (!meetsRequirement) {
      missingRequirements.push({
        subject: requirement.subject,
        requiredGrade: requirement.grade,
        studentGrade: studentSubject.grade,
        reason: 'Grade too low'
      });
    }
  });

  return {
    eligible: missingRequirements.length === 0,
    missingRequirements
  };
}

// Check if student grade meets required grade
meetsGradeRequirement(studentGrade, requiredGrade) {
  const GRADE_POINTS = {
    'A*': 1, 'A': 2, 'B': 3, 'C': 4, 'D': 5, 'E': 6, 'F': 7, 'G': 8
  };

  const studentPoints = GRADE_POINTS[studentGrade] || 9; // Lower number = better grade
  const requiredPoints = GRADE_POINTS[requiredGrade] || 9;

  return studentPoints <= requiredPoints; // Student grade is equal or better
}

  // Apply to a course
  async createApplication(req, res) {
    try {
      const { institutionId, facultyId, courseId, documents = [] } = req.body;
      const studentId = req.user.uid;

      // Check if student exists and get profile
      const studentDoc = await db.collection('users').doc(studentId).get();
      if (!studentDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found'
        });
      }

      const studentProfile = studentDoc.data();

      // Check if course exists
      const courseRef = db.collection('institutions').doc(institutionId)
        .collection('faculties').doc(facultyId)
        .collection('courses').doc(courseId);
      const courseDoc = await courseRef.get();

      if (!courseDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const course = courseDoc.data();

      // Check application deadline
      if (course.applicationDeadline && new Date() > course.applicationDeadline.toDate()) {
        return res.status(400).json({
          success: false,
          message: 'Application deadline has passed'
        });
      }

      // Check if student already has 2 applications for this institution
      const existingApplications = await db.collection('educationApplications')
        .where('studentId', '==', studentId)
        .where('institutionId', '==', institutionId)
        .get();

      if (existingApplications.size >= 2) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 2 applications per institution allowed'
        });
      }

      // Check if student already applied to this course
      const existingCourseApplication = await db.collection('educationApplications')
        .where('studentId', '==', studentId)
        .where('courseId', '==', courseId)
        .get();

      if (!existingCourseApplication.empty) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied to this course'
        });
      }

      // Check course requirements (basic implementation)
      const meetsRequirements = this.checkCourseRequirements(studentProfile, course);
      if (!meetsRequirements) {
        return res.status(400).json({
          success: false,
          message: 'You do not meet the course requirements'
        });
      }

      // Create application
      const applicationData = {
        studentId,
        institutionId,
        facultyId,
        courseId,
        applicationDate: new Date(),
        status: 'pending',
        priority: existingApplications.size + 1,
        documents,
        studentName: `${studentProfile.firstName} ${studentProfile.lastName}`,
        studentEmail: studentProfile.email,
        courseName: course.name,
        institutionName: (await db.collection('institutions').doc(institutionId).get()).data().name,
        meetsRequirements
      };

      const applicationRef = await db.collection('educationApplications').add(applicationData);

      // Update student's applications array
      await db.collection('users').doc(studentId).update({
        educationApplications: admin.firestore.FieldValue.arrayUnion(applicationRef.id)
      });

      // Send confirmation email
      await emailService.sendApplicationConfirmation(
        studentProfile.email,
        applicationData.institutionName,
        applicationData.courseName
      );

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          id: applicationRef.id,
          ...applicationData
        }
      });

    } catch (error) {
      console.error('Create application error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit application'
      });
    }
  }

  // Get student's applications with pagination
  async getStudentApplications(req, res) {
    try {
      const studentId = req.user.uid;
      const { status } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const lastDocIdParam = req.query.lastDocId; // For cursor-based pagination

      // Cache key (only cache first page without status filter for dashboard)
      const cacheKey = page === 1 && !status 
        ? `applications:student:${studentId}:page:1`
        : null;
      
      if (cacheKey) {
        const cached = cache.get(cacheKey);
        if (cached) {
          logger.info('Cache hit for student applications');
          return res.json(cached);
        }
      }

      let query = db.collection('educationApplications')
        .where('studentId', '==', studentId)
        .orderBy('applicationDate', 'desc')
        .limit(limit);

      if (status) {
        query = query.where('status', '==', status);
      }

      // For cursor-based pagination
      if (lastDocIdParam && page > 1) {
        const lastDoc = await db.collection('educationApplications').doc(lastDocIdParam).get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
      }

      // Parallelize count query and data query
      let countQuery = db.collection('educationApplications')
        .where('studentId', '==', studentId);
      if (status) {
        countQuery = countQuery.where('status', '==', status);
      }

      const [totalSnapshot, snapshot] = await Promise.all([
        countQuery.get(),
        query.get()
      ]);

      const total = totalSnapshot.size;
      const totalPages = Math.ceil(total / limit);

      const applications = [];
      let lastDocId = null;
      
      snapshot.forEach(doc => {
        lastDocId = doc.id; // Track last document ID for next page
        applications.push({
          id: doc.id,
          ...doc.data()
        });
      });

      const response = {
        success: true,
        data: applications,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: snapshot.size === limit && page < totalPages,
          hasPrevPage: page > 1,
          lastDocId: lastDocId // For cursor-based pagination
        }
      };

      // Cache first page for 2 minutes
      if (cacheKey) {
        cache.set(cacheKey, response, 2 * 60 * 1000);
      }

      res.json(response);

    } catch (error) {
      logger.logError(error, { 
        context: 'getStudentApplications',
        studentId: req.user?.uid 
      });
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch applications'
      });
    }
  }

  // Get applications for institute with pagination
  async getInstituteApplications(req, res) {
    try {
      const instituteId = req.user.uid;
      const { status, courseId } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const lastDocIdParam = req.query.lastDocId; // For cursor-based pagination

      let query = db.collection('educationApplications')
        .where('institutionId', '==', instituteId)
        .orderBy('applicationDate', 'desc')
        .limit(limit);

      if (status) {
        query = query.where('status', '==', status);
      }

      if (courseId) {
        query = query.where('courseId', '==', courseId);
      }

      // For cursor-based pagination
      if (lastDocIdParam && page > 1) {
        const lastDoc = await db.collection('educationApplications').doc(lastDocIdParam).get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
      }

      // Get total count (separate query)
      let countQuery = db.collection('educationApplications')
        .where('institutionId', '==', instituteId);
      if (status) {
        countQuery = countQuery.where('status', '==', status);
      }
      if (courseId) {
        countQuery = countQuery.where('courseId', '==', courseId);
      }
      const totalSnapshot = await countQuery.get();
      const total = totalSnapshot.size;
      const totalPages = Math.ceil(total / limit);

      // Apply pagination
      const snapshot = await query.get();

      const applications = [];
      let lastDocId = null;
      
      for (const doc of snapshot.docs) {
        const application = doc.data();
        lastDocId = doc.id; // Track last document ID for next page
        
        // Get student details
        const studentDoc = await db.collection('users').doc(application.studentId).get();
        const studentData = studentDoc.data();

        applications.push({
          id: doc.id,
          ...application,
          student: {
            id: application.studentId,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            email: studentData.email,
            highSchool: studentData.highSchool,
            highSchoolResults: studentData.highSchoolResults || []
          }
        });
      }

      res.json({
        success: true,
        data: applications,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: snapshot.size === limit && page < totalPages,
          hasPrevPage: page > 1,
          lastDocId: lastDocId // For cursor-based pagination
        }
      });

    } catch (error) {
      console.error('Get institute applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications'
      });
    }
  }

  // Get applications for a specific course
  async getCourseApplications(req, res) {
    try {
      const { courseId } = req.params;
      const instituteId = req.user.uid;

      const applicationsSnapshot = await db.collection('educationApplications')
        .where('institutionId', '==', instituteId)
        .where('courseId', '==', courseId)
        .orderBy('applicationDate', 'desc')
        .get();

      const applications = [];
      for (const doc of applicationsSnapshot.docs) {
        const application = doc.data();
        
        // Get student details
        const studentDoc = await db.collection('users').doc(application.studentId).get();
        const studentData = studentDoc.data();

        applications.push({
          id: doc.id,
          ...application,
          studentName: `${studentData?.firstName || ''} ${studentData?.lastName || ''}`.trim(),
          studentEmail: studentData?.email || ''
        });
      }

      res.json({
        success: true,
        data: applications
      });

    } catch (error) {
      console.error('Get course applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch course applications'
      });
    }
  },

  // Update application status (Institute)
  async updateApplicationStatus(req, res) {
    try {
      const { applicationId } = req.params;
      const { status, notes } = req.body;
      const instituteId = req.user.uid;

      const applicationRef = db.collection('educationApplications').doc(applicationId);
      const applicationDoc = await applicationRef.get();

      if (!applicationDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      const application = applicationDoc.data();

      // Check if institute owns this application
      if (application.institutionId !== instituteId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this application'
        });
      }

      const updateData = {
        status,
        updatedAt: new Date()
      };

      if (notes) {
        updateData.notes = notes;
      }

      if (status === 'admitted') {
        // Check if course has available seats
        const courseRef = db.collection('institutions').doc(instituteId)
          .collection('faculties').doc(application.facultyId)
          .collection('courses').doc(application.courseId);
        
        const courseDoc = await courseRef.get();
        const course = courseDoc.data();

        const admittedCount = await admissionManager.getAdmittedCount(
          application.courseId, 
          instituteId
        );

        if (admittedCount >= course.seatsAvailable) {
          // Add to waitlist instead of admitting
          await admissionManager.addToWaitlist(applicationId, course);
          
          return res.json({
            success: true,
            message: 'Application added to waitlist - course is full',
            data: {
              id: applicationId,
              status: 'waiting',
              waitlistPosition: await admissionManager.getNextWaitlistPosition(
                application.courseId, 
                instituteId
              ) - 1
            }
          });
        }

        updateData.admissionDecision = {
          decision: status,
          decisionDate: new Date(),
          notes: notes || ''
        };
      } else if (status === 'rejected') {
        updateData.admissionDecision = {
          decision: status,
          decisionDate: new Date(),
          notes: notes || ''
        };
      }

      await applicationRef.update(updateData);

      // Send email notification with detailed feedback
      if (status === 'admitted' || status === 'rejected') {
        const rejectionReason = status === 'rejected' && notes ? notes : null;
        const improvementSuggestions = status === 'rejected' ? this.generateImprovementSuggestions(application) : null;
        
        await emailService.sendAdmissionDecision(
          application.studentEmail,
          application.institutionName,
          application.courseName,
          status,
          rejectionReason,
          improvementSuggestions
        );

        // Create UI notification
        const notificationService = require('../utils/notificationService');
        await notificationService.createNotification(application.studentId, {
          type: 'admission_decision',
          title: status === 'admitted' 
            ? `Congratulations! Admission Offer - ${application.institutionName}`
            : `Admission Decision - ${application.institutionName}`,
          message: status === 'admitted'
            ? `Your application for ${application.courseName} has been accepted. Please log in to accept the offer.`
            : `Your application for ${application.courseName} has been rejected. Please check your email for detailed feedback.`,
          actionUrl: `/student/education/results`
        });
      }

      // Process waitlist if someone was admitted
      if (status === 'admitted') {
        await admissionManager.processAdmissions(
          application.courseId,
          instituteId,
          application.facultyId
        );
      }

      res.json({
        success: true,
        message: `Application ${status} successfully`,
        data: {
          id: applicationId,
          ...updateData
        }
      });

    } catch (error) {
      console.error('Update application status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update application status'
      });
    }
  }
  // Student accepts admission offer
  async acceptAdmission(req, res) {
    try {
      const { applicationId } = req.params;
      const studentId = req.user.uid;

      const applicationRef = db.collection('educationApplications').doc(applicationId);
      const applicationDoc = await applicationRef.get();

      if (!applicationDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      const application = applicationDoc.data();

      // Check if student owns this application
      if (application.studentId !== studentId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      // Check if application is admitted
      if (application.status !== 'admitted') {
        return res.status(400).json({
          success: false,
          message: 'Only admitted applications can be accepted'
        });
      }

      // Check if student already accepted another admission
      const acceptedApplications = await db.collection('educationApplications')
        .where('studentId', '==', studentId)
        .where('status', '==', 'accepted')
        .get();

      if (!acceptedApplications.empty) {
        return res.status(400).json({
          success: false,
          message: 'You have already accepted an admission offer'
        });
      }

      // Update application status to accepted
      await applicationRef.update({
        status: 'accepted',
        acceptedAt: new Date()
      });

      // Reject all other admitted applications for this student
      // Note: Firestore doesn't support != operator, so we fetch all and filter in memory
      const allAdmittedApps = await db.collection('educationApplications')
        .where('studentId', '==', studentId)
        .where('status', '==', 'admitted')
        .get();

      const batch = db.batch();
      let batchCount = 0;
      
      allAdmittedApps.forEach(doc => {
        // Filter out the current application in memory
        if (doc.id !== applicationId) {
          batch.update(doc.ref, {
            status: 'rejected',
            notes: 'Automatically rejected - student accepted another offer',
            updatedAt: new Date()
          });
          batchCount++;
        }
      });

      // Firestore batch operations are limited to 500 writes
      if (batchCount > 0) {
        await batch.commit();
      }

      res.json({
        success: true,
        message: 'Admission offer accepted successfully'
      });

    } catch (error) {
      console.error('Accept admission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to accept admission offer'
      });
    }
  }

  // Generate improvement suggestions for rejected applications
  generateImprovementSuggestions(application) {
    const suggestions = [];
    
    suggestions.push('Review the course requirements and ensure you meet all prerequisites');
    suggestions.push('Consider improving your high school grades in the required subjects');
    suggestions.push('Take additional courses or certifications related to the field');
    suggestions.push('Gain relevant experience through internships or volunteer work');
    suggestions.push('Update your profile with any new qualifications or achievements');
    suggestions.push('Consider applying to similar courses that may have different requirements');
    
    return suggestions;
  }

  // Helper function to check course requirements
  checkCourseRequirements(studentProfile, course) {
    // Basic implementation - in real scenario, this would be more complex
    // checking specific subject requirements, grades, etc.
    
    if (!course.requirements || course.requirements.length === 0) {
      return true; // No specific requirements
    }

    // Check if student has completed high school
    if (!studentProfile.highSchoolResults || studentProfile.highSchoolResults.length === 0) {
      return false;
    }

    // Simple check - ensure student has some results
    // This should be enhanced based on specific course requirements
    return studentProfile.highSchoolResults.length >= 5; // At least 5 subjects
  }
}

module.exports = new ApplicationController();