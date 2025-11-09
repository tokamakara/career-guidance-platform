const { admin, db } = require('../config/firebaseAdmin');

class InstituteController {
  // Get all approved institutions
  async getInstitutions(req, res) {
    try {
      const snapshot = await db.collection('institutions')
        .where('status', '==', 'approved')
        .get();

      const institutions = [];
      snapshot.forEach(doc => {
        institutions.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.json({
        success: true,
        data: institutions
      });

    } catch (error) {
      console.error('Get institutions error:', error);
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

      const institutionDoc = await db.collection('institutions').doc(institutionId).get();
      if (!institutionDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Institution not found'
        });
      }

      const institution = institutionDoc.data();

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
      console.error('Get faculty courses error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch courses'
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
}

module.exports = new InstituteController();