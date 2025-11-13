const { admin, db } = require('../config/firebaseAdmin');
const logger = require('../utils/logger');
const cache = require('../utils/cache');

class InstituteController {
  // Get all approved institutions
  async getInstitutions(req, res) {
    try {
      const cacheKey = 'institutions:approved';
      const cached = cache.get(cacheKey);
      if (cached) {
        logger.info('Cache hit for approved institutions');
        return res.json(cached);
      }

      // Query users collection with role filter - simple and efficient
      const snapshot = await db.collection('users')
        .where('role', '==', 'institute')
        .where('status', '==', 'approved')
        .get();

      const institutions = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        institutions.push({
          id: doc.id,
          name: data.institutionName || data.name,
          type: data.institutionType || data.type,
          location: data.location,
          description: data.description,
          website: data.website,
          contactEmail: data.email,
          phone: data.phone,
          contactPerson: data.contactPerson,
          status: data.status,
          createdAt: data.createdAt
        });
      });

      const response = {
        success: true,
        data: institutions
      };

      // Cache for 10 minutes
      cache.set(cacheKey, response, 10 * 60 * 1000);

      res.json(response);

    } catch (error) {
      logger.logError(error, { context: 'getInstitutions' });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch institutions'
      });
    }
  }

  // Get institution details with faculties
  async getInstitutionDetails(req, res) {
    try {
      const { institutionId } = req.params;

      // Get institution data from users collection
      const institutionDoc = await db.collection('users').doc(institutionId).get();
      if (!institutionDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Institution not found'
        });
      }

      const userData = institutionDoc.data();
      if (userData.role !== 'institute') {
        return res.status(404).json({
          success: false,
          message: 'Institution not found'
        });
      }

      // Map user data to institution format
      const institution = {
        id: institutionId,
        name: userData.institutionName || userData.name,
        type: userData.institutionType || userData.type,
        location: userData.location,
        description: userData.description,
        website: userData.website,
        contactEmail: userData.email,
        phone: userData.phone,
        contactPerson: userData.contactPerson,
        status: userData.status
      };

      // Get faculties
      const facultiesSnapshot = await db.collection('institutions')
        .doc(institutionId)
        .collection('faculties')
        .get();

      const faculties = [];
      facultiesSnapshot.forEach(doc => {
        faculties.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.json({
        success: true,
        data: {
          ...institution,
          id: institutionId,
          faculties
        }
      });

    } catch (error) {
      console.error('Get institution details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch institution details'
      });
    }
  }

  // Get courses for a faculty
  async getFacultyCourses(req, res) {
    try {
      const { institutionId, facultyId } = req.params;

      const coursesSnapshot = await db.collection('institutions')
        .doc(institutionId)
        .collection('faculties')
        .doc(facultyId)
        .collection('courses')
        .where('status', '==', 'open')
        .get();

      const courses = [];
      coursesSnapshot.forEach(doc => {
        const courseData = doc.data();
        courses.push({
          id: doc.id,
          ...courseData,
          // Ensure requirements are properly formatted
          requirements: courseData.requirements || []
        });
      });

      res.json({
        success: true,
        data: courses
      });

    } catch (error) {
      logger.logError(error, { institutionId: req.params.institutionId, facultyId: req.params.facultyId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch courses'
      });
    }
  }

  // Get all institutions with courses (for browsing)
  async getAllInstitutionsWithCourses(req, res) {
    try {
      const cacheKey = 'institutions:all:with:courses';
      const cached = cache.get(cacheKey);
      if (cached) {
        logger.info('Cache hit for all institutions with courses');
        return res.json(cached);
      }

      const institutionsSnapshot = await db.collection('institutions')
        .where('status', '==', 'approved')
        .get();

      const institutions = [];
      
      // Parallelize fetching faculties and courses for all institutions
      const institutionPromises = institutionsSnapshot.docs.map(async (instDoc) => {
        const institution = instDoc.data();
        
        // Get faculties in parallel
        const facultiesSnapshot = await db.collection('institutions')
          .doc(instDoc.id)
          .collection('faculties')
          .get();

        // Parallelize course fetching for all faculties
        const facultyPromises = facultiesSnapshot.docs.map(async (facDoc) => {
          const faculty = facDoc.data();
          
          // Get courses for this faculty
          const coursesSnapshot = await db.collection('institutions')
            .doc(instDoc.id)
            .collection('faculties')
            .doc(facDoc.id)
            .collection('courses')
            .where('status', '==', 'open')
            .get();

          const courses = [];
          coursesSnapshot.forEach(courseDoc => {
            const courseData = courseDoc.data();
            courses.push({
              id: courseDoc.id,
              ...courseData,
              requirements: courseData.requirements || []
            });
          });
          
          return {
            id: facDoc.id,
            ...faculty,
            courses
          };
        });
        
        const faculties = await Promise.all(facultyPromises);
        
        return {
          id: instDoc.id,
          ...institution,
          faculties
        };
      });

      const institutionsData = await Promise.all(institutionPromises);

      const response = {
        success: true,
        data: institutionsData
      };

      // Cache for 15 minutes (longer since this is expensive)
      cache.set(cacheKey, response, 15 * 60 * 1000);

      res.json(response);

    } catch (error) {
      logger.logError(error, { context: 'getAllInstitutionsWithCourses' });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch institutions with courses'
      });
    }
  }

  // Get qualified courses for a student (backend filtering)
  async getQualifiedCourses(req, res) {
    try {
      const studentId = req.user?.uid;
      const { institutionId, facultyId, onlyQualified = true } = req.query;

      // Get student profile to access high school results
      let studentProfile = null;
      if (studentId) {
        const studentDoc = await db.collection('users').doc(studentId).get();
        if (studentDoc.exists) {
          studentProfile = studentDoc.data();
        }
      }

      // If no student profile or no high school results, return empty or all courses
      const studentSubjects = studentProfile?.highSchoolResults || [];
      const hasResults = studentSubjects.length > 0;

      // Convert student results to map for easy lookup
      const studentSubjectsMap = {};
      studentSubjects.forEach(subject => {
        studentSubjectsMap[subject.name] = subject.grade;
      });

      // Get all institutions or specific institution
      let institutionsSnapshot;
      if (institutionId) {
        const institutionDoc = await db.collection('institutions').doc(institutionId).get();
        if (institutionDoc.exists && institutionDoc.data().status === 'approved') {
          institutionsSnapshot = { docs: [institutionDoc] };
        } else {
          institutionsSnapshot = { docs: [] };
        }
      } else {
        institutionsSnapshot = await db.collection('institutions')
          .where('status', '==', 'approved')
          .get();
      }

      const institutions = [];
      
      for (const instDoc of institutionsSnapshot.docs) {
        const institution = instDoc.data();
        
        // Get faculties
        let facultiesSnapshot;
        if (facultyId) {
          const facultyDoc = await db.collection('institutions')
            .doc(instDoc.id)
            .collection('faculties')
            .doc(facultyId)
            .get();
          
          if (facultyDoc.exists) {
            facultiesSnapshot = { docs: [facultyDoc] };
          } else {
            facultiesSnapshot = { docs: [] };
          }
        } else {
          facultiesSnapshot = await db.collection('institutions')
            .doc(instDoc.id)
            .collection('faculties')
            .get();
        }

        const faculties = [];
        
        for (const facDoc of facultiesSnapshot.docs) {
          const faculty = facDoc.data();
          
          // Get courses for this faculty
          const coursesSnapshot = await db.collection('institutions')
            .doc(instDoc.id)
            .collection('faculties')
            .doc(facDoc.id)
            .collection('courses')
            .where('status', '==', 'open')
            .get();

          const courses = [];
          coursesSnapshot.forEach(courseDoc => {
            const courseData = courseDoc.data();
            const course = {
              id: courseDoc.id,
              ...courseData,
              requirements: courseData.requirements || [],
              institutionId: instDoc.id,
              institutionName: institution.name,
              facultyId: facDoc.id,
              facultyName: faculty.name
            };

            // Filter qualified courses if requested and student has results
            if (onlyQualified && hasResults) {
              const isQualified = this.checkCourseQualification(course.requirements, studentSubjectsMap);
              if (isQualified) {
                courses.push(course);
              }
            } else {
              // Include all courses or if student has no results
              courses.push(course);
            }
          });
          
          if (courses.length > 0 || !onlyQualified) {
            faculties.push({
              id: facDoc.id,
              ...faculty,
              courses
            });
          }
        }
        
        if (faculties.length > 0) {
          institutions.push({
            id: instDoc.id,
            ...institution,
            faculties
          });
        }
      }

      res.json({
        success: true,
        data: institutions,
        filters: {
          onlyQualified: onlyQualified && hasResults,
          hasStudentResults: hasResults,
          institutionId: institutionId || null,
          facultyId: facultyId || null
        }
      });

    } catch (error) {
      logger.logError(error, { 
        studentId: req.user?.uid,
        institutionId: req.query.institutionId,
        facultyId: req.query.facultyId
      });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch qualified courses'
      });
    }
  }

  // Helper method to check if student qualifies for a course
  checkCourseQualification(courseRequirements, studentSubjectsMap) {
    // If no requirements, all students qualify
    if (!courseRequirements || courseRequirements.length === 0) {
      return true;
    }

    // Check if student meets all requirements
    return courseRequirements.every(requirement => {
      const studentGrade = studentSubjectsMap[requirement.subject];
      
      if (!studentGrade) {
        return false; // Student doesn't have this subject
      }

      // Check if grade meets requirement
      return this.meetsGradeRequirement(studentGrade, requirement.grade);
    });
  }

  // Helper method to check if student grade meets required grade
  meetsGradeRequirement(studentGrade, requiredGrade) {
    const GRADE_POINTS = {
      'A*': 1, 'A': 2, 'B': 3, 'C': 4, 'D': 5, 'E': 6, 'F': 7, 'G': 8
    };

    const studentPoints = GRADE_POINTS[studentGrade] || 9; // Lower number = better grade
    const requiredPoints = GRADE_POINTS[requiredGrade] || 9;

    return studentPoints <= requiredPoints; // Student grade is equal or better
  }

  // Get all faculties for the current institute
  async getFaculties(req, res) {
    try {
      const instituteId = req.user.uid;

      const facultiesSnapshot = await db.collection('institutions')
        .doc(instituteId)
        .collection('faculties')
        .get();

      const faculties = [];
      for (const doc of facultiesSnapshot.docs) {
        const facultyData = doc.data();
        
        // Get course count for this faculty
        const coursesSnapshot = await db.collection('institutions')
          .doc(instituteId)
          .collection('faculties')
          .doc(doc.id)
          .collection('courses')
          .get();

        faculties.push({
          id: doc.id,
          ...facultyData,
          courseCount: coursesSnapshot.size
        });
      }

      res.json({
        success: true,
        data: faculties
      });

    } catch (error) {
      console.error('Get faculties error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch faculties'
      });
    }
  }

  // Institute creates a faculty
  async createFaculty(req, res) {
    try {
      const { name, description } = req.body;
      const instituteId = req.user.uid;

      const facultyData = {
        name,
        description,
        institutionId: instituteId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const facultyRef = await db.collection('institutions')
        .doc(instituteId)
        .collection('faculties')
        .add(facultyData);

      res.status(201).json({
        success: true,
        message: 'Faculty created successfully',
        data: {
          id: facultyRef.id,
          ...facultyData
        }
      });

    } catch (error) {
      console.error('Create faculty error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create faculty'
      });
    }
  }

  // Delete a faculty
  async deleteFaculty(req, res) {
    try {
      const { facultyId } = req.params;
      const instituteId = req.user.uid;

      // Check if faculty exists
      const facultyRef = db.collection('institutions')
        .doc(instituteId)
        .collection('faculties')
        .doc(facultyId);
      
      const facultyDoc = await facultyRef.get();
      if (!facultyDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found'
        });
      }

      // Delete all courses in this faculty first
      const coursesSnapshot = await facultyRef.collection('courses').get();
      const batch = db.batch();
      
      coursesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete the faculty
      batch.delete(facultyRef);
      await batch.commit();

      res.json({
        success: true,
        message: 'Faculty deleted successfully'
      });

    } catch (error) {
      console.error('Delete faculty error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete faculty'
      });
    }
  }

  // Institute creates a course
  async createCourse(req, res) {
    try {
      const { facultyId, name, code, duration, description, requirements, seatsAvailable, applicationDeadline } = req.body;
      const instituteId = req.user.uid;

      const courseData = {
        name,
        code,
        duration,
        description,
        requirements: requirements || [], // Array of { subject: 'Mathematics', grade: 'C' }
        seatsAvailable: parseInt(seatsAvailable),
        applicationDeadline: new Date(applicationDeadline),
        facultyId,
        institutionId: instituteId,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const courseRef = await db.collection('institutions')
        .doc(instituteId)
        .collection('faculties')
        .doc(facultyId)
        .collection('courses')
        .add(courseData);

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: {
          id: courseRef.id,
          ...courseData
        }
      });

    } catch (error) {
      console.error('Create course error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create course'
      });
    }
  }

  // Get institute profile
  async getInstituteProfile(req, res) {
    try {
      const instituteId = req.user.uid;

      const instituteDoc = await db.collection('users').doc(instituteId).get();

      if (!instituteDoc.exists) {
        // Return empty profile structure instead of 404
        return res.json({
          success: true,
          data: {
            id: instituteId,
            email: req.user.email || '',
            firstName: '',
            lastName: '',
            institutionName: '',
            institutionType: '',
            location: '',
            phone: '',
            website: '',
            description: '',
            contactPerson: ''
          }
        });
      }

      const instituteData = instituteDoc.data();

      res.json({
        success: true,
        data: {
          ...instituteData,
          id: instituteId
        }
      });

    } catch (error) {
      logger.logError(error, { context: 'getInstituteProfile' });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch institute profile',
        error: error.message
      });
    }
  }

  // Update institute profile
  async updateInstituteProfile(req, res) {
    try {
      const instituteId = req.user.uid;
      const updates = req.body;

      // Prepare updates
      const profileUpdates = {
        updatedAt: new Date()
      };

      // Basic info
      if (updates.firstName !== undefined) profileUpdates.firstName = updates.firstName;
      if (updates.lastName !== undefined) profileUpdates.lastName = updates.lastName;
      if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
      if (updates.email !== undefined) profileUpdates.email = updates.email;

      // Institution info
      if (updates.institutionName !== undefined) profileUpdates.institutionName = updates.institutionName;
      if (updates.institutionType !== undefined) profileUpdates.institutionType = updates.institutionType;
      if (updates.location !== undefined) profileUpdates.location = updates.location;
      if (updates.website !== undefined) profileUpdates.website = updates.website;
      if (updates.description !== undefined) profileUpdates.description = updates.description;
      if (updates.contactPerson !== undefined) profileUpdates.contactPerson = updates.contactPerson;

      // Update institute profile
      await db.collection('users').doc(instituteId).update(profileUpdates);

      // Also update the institution record if it exists
      const institutionDoc = await db.collection('institutions').doc(instituteId).get();
      if (institutionDoc.exists) {
        const institutionUpdates = {};
        if (updates.institutionName !== undefined) institutionUpdates.name = updates.institutionName;
        if (updates.institutionType !== undefined) institutionUpdates.type = updates.institutionType;
        if (updates.location !== undefined) institutionUpdates.location = updates.location;
        if (updates.website !== undefined) institutionUpdates.website = updates.website;
        if (updates.description !== undefined) institutionUpdates.description = updates.description;
        if (updates.phone !== undefined) institutionUpdates.phone = updates.phone;
        if (updates.email !== undefined) institutionUpdates.contactEmail = updates.email;
        institutionUpdates.updatedAt = new Date();
        
        await db.collection('institutions').doc(instituteId).update(institutionUpdates);
      }

      // Fetch updated profile to return
      const updatedDoc = await db.collection('users').doc(instituteId).get();
      const updatedProfile = updatedDoc.exists ? { id: updatedDoc.id, ...updatedDoc.data() } : null;

      res.json({
        success: true,
        message: 'Institute profile updated successfully',
        data: updatedProfile
      });

    } catch (error) {
      logger.logError(error, { context: 'updateInstituteProfile' });
      res.status(500).json({
        success: false,
        message: 'Failed to update institute profile',
        error: error.message
      });
    }
  }

  // Export admitted students as PDF (for institutes)
  async exportAdmittedStudents(req, res) {
    try {
      const { courseId } = req.params;
      const instituteId = req.user.uid;
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="admitted-students-${instituteId}-${Date.now()}.pdf"`);

      // Pipe PDF to response
      doc.pipe(res);

      // Get institution profile
      const institutionDoc = await db.collection('institutions').doc(instituteId).get();
      const institutionProfile = institutionDoc.exists ? institutionDoc.data() : {};

      // Get admitted students
      let query = db.collection('educationApplications')
        .where('institutionId', '==', instituteId)
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
          const courseRef = db.collection('institutions').doc(instituteId)
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
      logger.logError(error, { context: 'exportAdmittedStudents' });
      res.status(500).json({
        success: false,
        message: 'Failed to export admitted students'
      });
    }
  }

  // Publish admissions for a course
  async publishAdmissions(req, res) {
    try {
      const { courseId } = req.params;
      const instituteId = req.user.uid;

      // Get all admitted applications for this course
      const applicationsSnapshot = await db.collection('educationApplications')
        .where('institutionId', '==', instituteId)
        .where('courseId', '==', courseId)
        .where('status', '==', 'admitted')
        .get();

      const batch = db.batch();
      let updatedCount = 0;

      applicationsSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          admissionPublished: true,
          admissionPublishedAt: new Date(),
          updatedAt: new Date()
        });
        updatedCount++;
      });

      await batch.commit();

      res.json({
        success: true,
        message: `Admissions published successfully for ${updatedCount} students`,
        data: {
          publishedCount: updatedCount
        }
      });

    } catch (error) {
      console.error('Publish admissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to publish admissions'
      });
    }
  }
}

module.exports = new InstituteController();