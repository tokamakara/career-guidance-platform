const { db } = require('../config/firebaseAdmin');

class Student {
  static collection = db.collection('students');

  static async create(studentData) {
    const studentRef = await this.collection.doc(studentData.userId).set({
      ...studentData,
      createdAt: new Date(),
      updatedAt: new Date(),
      profileCompleted: false,
      highSchoolGrades: {},
      applications: [],
      jobApplications: [],
      documents: []
    });
    return studentData.userId;
  }

  static async findById(studentId) {
    const doc = await this.collection.doc(studentId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async update(studentId, updateData) {
    await this.collection.doc(studentId).update({
      ...updateData,
      updatedAt: new Date()
    });
  }

  static async updateHighSchoolGrades(studentId, grades) {
    await this.collection.doc(studentId).update({
      highSchoolGrades: grades,
      profileCompleted: true,
      updatedAt: new Date()
    });
  }

  static async addApplication(studentId, application) {
    const student = await this.findById(studentId);
    const applications = student.applications || [];
    
    // Check if already applied to this institution
    const existingApp = applications.find(app => 
      app.institutionId === application.institutionId
    );
    
    if (existingApp) {
      throw new Error('Already applied to this institution');
    }

    // Check max 2 applications per institution
    const institutionApps = applications.filter(app => 
      app.institutionId === application.institutionId
    );
    
    if (institutionApps.length >= 2) {
      throw new Error('Maximum 2 applications per institution allowed');
    }

    applications.push({
      ...application,
      appliedAt: new Date(),
      status: 'pending'
    });

    await this.collection.doc(studentId).update({
      applications,
      updatedAt: new Date()
    });
  }

  static async addJobApplication(studentId, jobApplication) {
    const student = await this.findById(studentId);
    const jobApplications = student.jobApplications || [];
    
    jobApplications.push({
      ...jobApplication,
      appliedAt: new Date(),
      status: 'pending'
    });

    await this.collection.doc(studentId).update({
      jobApplications,
      updatedAt: new Date()
    });
  }

  static async updateApplicationStatus(studentId, applicationId, status) {
    const student = await this.findById(studentId);
    const applications = student.applications.map(app => 
      app.id === applicationId ? { ...app, status } : app
    );

    await this.collection.doc(studentId).update({
      applications,
      updatedAt: new Date()
    });
  }

  static async addDocument(studentId, document) {
    const student = await this.findById(studentId);
    const documents = student.documents || [];
    
    documents.push({
      ...document,
      uploadedAt: new Date()
    });

    await this.collection.doc(studentId).update({
      documents,
      updatedAt: new Date()
    });
  }

  static async getQualifiedStudentsForJob(jobRequirements) {
    const allStudents = await this.collection.get();
    const qualified = [];

    for (const doc of allStudents.docs) {
      const student = { id: doc.id, ...doc.data() };
      if (this.meetsJobRequirements(student, jobRequirements)) {
        qualified.push(student);
      }
    }

    return qualified;
  }

  static meetsJobRequirements(student, jobRequirements) {
    // Implementation of job matching logic
    if (!student.highSchoolGrades || Object.keys(student.highSchoolGrades).length === 0) {
      return false;
    }

    // Basic qualification check - can be enhanced
    return true;
  }

  static async getStudentsByInstitutionApplications(institutionId) {
    const snapshot = await this.collection.get();
    const applicants = [];

    for (const doc of snapshot.docs) {
      const student = { id: doc.id, ...doc.data() };
      const institutionApps = student.applications?.filter(app => 
        app.institutionId === institutionId
      ) || [];
      
      if (institutionApps.length > 0) {
        applicants.push({
          ...student,
          applications: institutionApps
        });
      }
    }

    return applicants;
  }
}

module.exports = Student;