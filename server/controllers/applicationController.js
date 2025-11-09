const { admin, db } = require('../config/firebaseAdmin');
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

  // Get student's applications
  async getStudentApplications(req, res) {
    try {
      const studentId = req.user.uid;
      const { status } = req.query;

      let query = db.collection('educationApplications')
        .where('studentId', '==', studentId);

      if (status) {
        query = query.where('status', '==', status);
      }

      const snapshot = await query.orderBy('applicationDate', 'desc').get();

      const applications = [];
      snapshot.forEach(doc => {
        applications.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.json({
        success: true,
        data: applications
      });

    } catch (error) {
      console.error('Get applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications'
      });
    }
  }

  // Get applications for institute
  async getInstituteApplications(req, res) {
    try {
      const instituteId = req.user.uid;
      const { status, courseId } = req.query;

      let query = db.collection('educationApplications')
        .where('institutionId', '==', instituteId);

      if (status) {
        query = query.where('status', '==', status);
      }

      if (courseId) {
        query = query.where('courseId', '==', courseId);
      }

      const snapshot = await query.orderBy('applicationDate', 'desc').get();

      const applications = [];
      for (const doc of snapshot.docs) {
        const application = doc.data();
        
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
        data: applications
      });

    } catch (error) {
      console.error('Get institute applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications'
      });
    }
  }

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

      // Send email notification
      if (status === 'admitted' || status === 'rejected') {
        await emailService.sendAdmissionDecision(
          application.studentEmail,
          application.institutionName,
          application.courseName,
          status
        );
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
      const otherAdmittedApps = await db.collection('educationApplications')
        .where('studentId', '==', studentId)
        .where('status', '==', 'admitted')
        .where('id', '!=', applicationId)
        .get();

      const batch = db.batch();
      otherAdmittedApps.forEach(doc => {
        batch.update(doc.ref, {
          status: 'rejected',
          notes: 'Automatically rejected - student accepted another offer'
        });
      });

      await batch.commit();

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