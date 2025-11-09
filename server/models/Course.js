const { db } = require('../config/firebaseAdmin');

class CourseModel {
  // Create a new course with requirements
  async createCourse(institutionId, facultyId, courseData) {
    try {
      const courseRef = db.collection('institutions').doc(institutionId)
        .collection('faculties').doc(facultyId)
        .collection('courses').doc();
      
      const course = {
        id: courseRef.id,
        institutionId,
        facultyId,
        ...courseData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      };

      await courseRef.set(course);
      return { success: true, data: course };
    } catch (error) {
      console.error('Create course error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get courses by faculty with requirements
  async getCoursesByFaculty(institutionId, facultyId) {
    try {
      const snapshot = await db.collection('institutions').doc(institutionId)
        .collection('faculties').doc(facultyId)
        .collection('courses')
        .where('status', '==', 'active')
        .get();

      const courses = [];
      snapshot.forEach(doc => {
        courses.push(doc.data());
      });

      return { success: true, data: courses };
    } catch (error) {
      console.error('Get courses error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all institutions with their courses
  async getAllInstitutionsWithCourses() {
    try {
      const institutionsSnapshot = await db.collection('institutions')
        .where('status', '==', 'approved')
        .get();

      const institutions = [];
      
      for (const instDoc of institutionsSnapshot.docs) {
        const institution = instDoc.data();
        
        // Get faculties
        const facultiesSnapshot = await db.collection('institutions').doc(instDoc.id)
          .collection('faculties')
          .get();

        institution.faculties = [];
        
        for (const facDoc of facultiesSnapshot.docs) {
          const faculty = facDoc.data();
          
          // Get courses for this faculty
          const coursesResult = await this.getCoursesByFaculty(instDoc.id, facDoc.id);
          if (coursesResult.success) {
            faculty.courses = coursesResult.data;
          } else {
            faculty.courses = [];
          }
          
          institution.faculties.push(faculty);
        }
        
        institutions.push(institution);
      }

      return { success: true, data: institutions };
    } catch (error) {
      console.error('Get institutions with courses error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new CourseModel();