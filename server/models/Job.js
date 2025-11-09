const { db } = require('../config/firebaseAdmin');

class Job {
  static collection = db.collection('jobs');

  static async create(jobData) {
    const jobRef = await this.collection.add({
      ...jobData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      applicants: 0
    });
    return jobRef.id;
  }

  static async findById(jobId) {
    const doc = await this.collection.doc(jobId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async findByCompany(companyId) {
    const snapshot = await this.collection.where('companyId', '==', companyId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async update(jobId, updateData) {
    await this.collection.doc(jobId).update({
      ...updateData,
      updatedAt: new Date()
    });
  }

  static async findAllActive() {
    const snapshot = await this.collection.where('status', '==', 'active').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async incrementApplicants(jobId) {
    const job = await this.findById(jobId);
    await this.collection.doc(jobId).update({
      applicants: (job.applicants || 0) + 1
    });
  }

  static async closeJob(jobId) {
    await this.collection.doc(jobId).update({
      status: 'closed',
      updatedAt: new Date()
    });
  }
}

module.exports = Job;