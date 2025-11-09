const { db } = require('../config/firebaseAdmin');

class Institution {
  static collection = db.collection('institutions');

  static async create(institutionData) {
    const institutionRef = await this.collection.add({
      ...institutionData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    });
    return institutionRef.id;
  }

  static async findById(institutionId) {
    const doc = await this.collection.doc(institutionId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async findByUserId(userId) {
    const snapshot = await this.collection.where('userId', '==', userId).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  static async update(institutionId, updateData) {
    await this.collection.doc(institutionId).update({
      ...updateData,
      updatedAt: new Date()
    });
  }

  static async findAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async addFaculty(institutionId, facultyData) {
    const facultyRef = await this.collection.doc(institutionId).collection('faculties').add({
      ...facultyData,
      createdAt: new Date()
    });
    return facultyRef.id;
  }

  static async getFaculties(institutionId) {
    const snapshot = await this.collection.doc(institutionId).collection('faculties').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = Institution;