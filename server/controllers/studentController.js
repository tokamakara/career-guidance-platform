const { admin, db } = require('../config/firebaseAdmin');

class StudentController {
  // Get student profile
  async getStudentProfile(req, res) {
    try {
      const studentId = req.user.uid;

      const studentDoc = await db.collection('users').doc(studentId).get();

      if (!studentDoc.exists) {
        // Return empty profile structure instead of 404
        return res.json({
          success: true,
          data: {
            id: studentId,
            firstName: '',
            lastName: '',
            email: req.user.email || '',
            phone: '',
            dateOfBirth: '',
            gender: '',
            idNumber: '',
            address: '',
            city: '',
            postalCode: '',
            country: 'Lesotho',
            bio: '',
            emergencyContact: {
              name: '',
              relationship: '',
              phone: ''
            }
          }
        });
      }

      const studentData = studentDoc.data();

      res.json({
        success: true,
        data: {
          ...studentData,
          id: studentId
        }
      });

    } catch (error) {
      console.error('Get student profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch student profile',
        error: error.message
      });
    }
  }

  // Update student profile
  async updateStudentProfile(req, res) {
    try {
      const studentId = req.user.uid;
      const updates = req.body;

      // Prepare updates
      const profileUpdates = {
        updatedAt: new Date()
      };

      // Basic info
      if (updates.firstName !== undefined) profileUpdates.firstName = updates.firstName;
      if (updates.lastName !== undefined) profileUpdates.lastName = updates.lastName;
      if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
      if (updates.dateOfBirth !== undefined) {
        profileUpdates.dateOfBirth = updates.dateOfBirth ? new Date(updates.dateOfBirth) : null;
      }
      if (updates.gender !== undefined) profileUpdates.gender = updates.gender;
      if (updates.idNumber !== undefined) profileUpdates.idNumber = updates.idNumber;

      // Address info
      if (updates.address !== undefined) profileUpdates.address = updates.address;
      if (updates.city !== undefined) profileUpdates.city = updates.city;
      if (updates.postalCode !== undefined) profileUpdates.postalCode = updates.postalCode;
      if (updates.country !== undefined) profileUpdates.country = updates.country;

      // Bio
      if (updates.bio !== undefined) profileUpdates.bio = updates.bio;

      // Emergency contact
      if (updates.emergencyContact !== undefined) {
        profileUpdates.emergencyContact = updates.emergencyContact;
      }

      // Education info (preserve existing if not provided)
      if (updates.highSchool !== undefined) profileUpdates.highSchool = updates.highSchool;
      if (updates.highSchoolResults !== undefined) profileUpdates.highSchoolResults = updates.highSchoolResults;

      // Career info (preserve existing if not provided)
      if (updates.skills !== undefined) profileUpdates.skills = updates.skills;
      if (updates.workExperience !== undefined) profileUpdates.workExperience = updates.workExperience;
      if (updates.certificates !== undefined) profileUpdates.certificates = updates.certificates;
      if (updates.resumeUrl !== undefined) profileUpdates.resumeUrl = updates.resumeUrl;
      if (updates.transcriptUrl !== undefined) profileUpdates.transcriptUrl = updates.transcriptUrl;

      // Update student profile
      await db.collection('users').doc(studentId).update(profileUpdates);

      // Fetch updated profile to return
      const updatedDoc = await db.collection('users').doc(studentId).get();
      const updatedProfile = updatedDoc.exists ? { id: updatedDoc.id, ...updatedDoc.data() } : null;

      res.json({
        success: true,
        message: 'Student profile updated successfully',
        data: updatedProfile
      });

    } catch (error) {
      console.error('Update student profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update student profile',
        error: error.message
      });
    }
  }

  // Upload student documents
  async uploadDocuments(req, res) {
    try {
      const studentId = req.user.uid;
      const { documentType, fileUrl, fileName } = req.body;

      const documentData = {
        type: documentType,
        url: fileUrl,
        name: fileName,
        uploadedAt: new Date()
      };

      // Add to student's documents array
      await db.collection('users').doc(studentId).update({
        documents: admin.firestore.FieldValue.arrayUnion(documentData),
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Document uploaded successfully',
        data: documentData
      });

    } catch (error) {
      console.error('Upload document error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload document'
      });
    }
  }

  // Get student documents
  async getStudentDocuments(req, res) {
    try {
      const studentId = req.user.uid;

      const studentDoc = await db.collection('users').doc(studentId).get();
      const studentData = studentDoc.data();

      res.json({
        success: true,
        data: studentData.documents || []
      });

    } catch (error) {
      console.error('Get student documents error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch student documents'
      });
    }
  }

  // Delete student document
  async deleteDocument(req, res) {
    try {
      const studentId = req.user.uid;
      const { documentId } = req.params;

      const studentDoc = await db.collection('users').doc(studentId).get();
      const studentData = studentDoc.data();

      const updatedDocuments = (studentData.documents || []).filter(
        doc => doc.url !== documentId
      );

      await db.collection('users').doc(studentId).update({
        documents: updatedDocuments,
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });

    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete document'
      });
    }
  }

  // Get student dashboard stats
  async getStudentStats(req, res) {
    try {
      const studentId = req.user.uid;

      const [educationAppsSnapshot, jobAppsSnapshot] = await Promise.all([
        db.collection('educationApplications')
          .where('studentId', '==', studentId)
          .get(),
        db.collection('jobApplications')
          .where('studentId', '==', studentId)
          .get()
      ]);

      const educationApps = educationAppsSnapshot.docs.map(doc => doc.data());
      const jobApps = jobAppsSnapshot.docs.map(doc => doc.data());

      const stats = {
        educationApplications: {
          total: educationApps.length,
          admitted: educationApps.filter(app => app.status === 'admitted').length,
          pending: educationApps.filter(app => app.status === 'pending').length
        },
        jobApplications: {
          total: jobApps.length,
          shortlisted: jobApps.filter(app => app.status === 'shortlisted').length,
          pending: jobApps.filter(app => app.status === 'pending').length
        },
        documents: {
          // This would come from student profile
          uploaded: 0 // Will be populated from student profile
        }
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get student stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch student statistics'
      });
    }
  }
}

module.exports = new StudentController();